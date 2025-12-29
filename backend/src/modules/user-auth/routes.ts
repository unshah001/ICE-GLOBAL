import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { queueEmail } from "../../services/email";
import { env } from "../../config/env";
import { getDb } from "../../db/mongo";
import { isNotificationEnabled } from "../../services/notifications";

const requestSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({ email: z.string().email(), otp: z.string().length(6) });
const profileSchema = z.object({
  name: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  company: z.string().max(120).optional(),
  address: z.string().max(240).optional(),
  bio: z.string().max(400).optional(),
  notes: z.string().max(500).optional(),
  extras: z.record(z.string()).optional(),
});

const otpStore = new Map<string, { code: string; expires: number }>();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export default async function userAuthRoutes(app: FastifyInstance) {
  const listQuery = z.object({
    limit: z
      .string()
      .optional()
      .transform((v) => Number(v))
      .pipe(z.number().int().positive().max(100))
      .catch(20),
    cursor: z.string().optional(),
    search: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
  });

  app.post("/user-auth/request-otp", async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid email" });
    const { email } = parsed.data;
    const code = generateOtp();
    const expires = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { code, expires });
    if (await isNotificationEnabled("otp")) {
      const db = await getDb();
      const tpl = await db.collection("templates").findOne<{ subject?: string; body?: string }>({ slug: "otp" });
      const placeholders: Record<string, string> = { code, name: email.split("@")[0] || "there", email };
      const render = (content: string) =>
        Object.entries(placeholders).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), content || "");
      const subject = render(tpl?.subject || `Your login code: ${code}`);
      const html = render(tpl?.body || `<p>Your one-time code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`);
      await queueEmail({
        to: email,
        subject,
        html,
        event: "otp",
        meta: { kind: "user-login" },
      });
    }
    return { message: "OTP sent" };
  });

  app.post("/user-auth/verify-otp", async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid payload" });
    const { email, otp } = parsed.data;
    const entry = otpStore.get(email);
    if (!entry || entry.code !== otp || entry.expires < Date.now()) {
      return reply.code(401).send({ message: "Invalid or expired code" });
    }
    otpStore.delete(email);
    const accessToken = app.jwt.sign({ sub: email, role: "user" }, { expiresIn: env.userAccessTtl });
    return { accessToken, user: { email } };
  });

  app.get("/admin/users", { preHandler: [app.authenticateAdmin] }, async (request, reply) => {
    const parsed = listQuery.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid query" });
    const { limit, cursor, search, start, end } = parsed.data;
    const db = await getDb();
    const col = db.collection("users");
    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    if (cursor) {
      try {
        filter._id = { $lt: new ObjectId(cursor) };
      } catch {
        // ignore invalid cursor
      }
    }
    if (start || end) {
      filter.createdAt = {};
      if (start) {
        const d = new Date(start);
        if (!isNaN(d.getTime())) filter.createdAt.$gte = d;
      }
      if (end) {
        const d = new Date(end);
        if (!isNaN(d.getTime())) filter.createdAt.$lte = d;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }
    const docs = await col.find(filter).sort({ _id: -1 }).limit(limit + 1).toArray();
    const hasMore = docs.length > limit;
    const items = docs.slice(0, limit).map((d) => ({
      id: d._id?.toString(),
      email: d.email,
      name: d.name || "",
      company: d.company || "",
      address: d.address || "",
      bio: d.bio || "",
      notes: d.notes || "",
      extras: d.extras || {},
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
    return { data: items, cursor: { next: hasMore ? docs[limit]._id?.toString() : null, limit } };
  });

  app.get("/user/me", { preHandler: [app.authenticateUser] }, async (request) => {
    const user = request.user as { sub: string };
    const db = await getDb();
    const doc = await db.collection("users").findOne({ email: user.sub });
    return {
      email: user.sub,
      name: doc?.name || "",
      avatarUrl: doc?.avatarUrl || "",
      company: doc?.company || "",
      address: doc?.address || "",
      bio: doc?.bio || "",
      notes: doc?.notes || "",
      extras: doc?.extras || {},
    };
  });

  app.put("/user/me", { preHandler: [app.authenticateUser] }, async (request, reply) => {
    const user = request.user as { sub: string };
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid profile" });
    const db = await getDb();
    const col = db.collection("users");
    await col.updateOne(
      { email: user.sub },
      { $set: { email: user.sub, ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return { message: "Saved" };
  });
}
