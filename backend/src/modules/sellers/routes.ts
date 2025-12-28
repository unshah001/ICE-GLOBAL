import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "../../db/mongo";

const sellerSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1),
  role: z.string().default(""),
  company: z.string().default(""),
  quote: z.string().default(""),
  outcome: z.string().default(""),
  image: z.string().url(),
  href: z.string().default(""),
  detail: z
    .object({
      headline: z.string().optional(),
      summary: z.string().optional(),
      heroImage: z.string().url().optional(),
      highlights: z
        .array(z.object({ title: z.string(), body: z.string() }))
        .default([]),
      metrics: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .default([]),
      pullQuote: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
    })
    .optional(),
});

const payloadSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  sellers: z.array(sellerSchema),
});

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .catch(24)
    .optional(),
  search: z.string().optional(),
  company: z.string().optional(),
});

export default async function sellersRoutes(app: FastifyInstance) {
  app.get("/sellers", async () => {
    const db = await getDb();
    const col = db.collection("sellers");
    const stored = await col.findOne<{ eyebrow: string; title: string; description: string; ctaLabel: string; ctaHref: string; sellers: any[] }>({ key: "default" });
    if (!stored) {
      return { eyebrow: "", title: "", description: "", sellers: [] };
    }
    return {
      eyebrow: stored.eyebrow ?? "",
      title: stored.title ?? "",
      description: stored.description ?? "",
      sellers: stored.sellers ?? [],
      ctaLabel: stored.ctaLabel ?? "",
      ctaHref: stored.ctaHref ?? "",
    };
  });

  app.get("/sellers/list", async (request) => {
    const db = await getDb();
    const col = db.collection<z.infer<typeof sellerSchema>>("sellers_list");
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : { limit: 24, cursor: undefined, search: undefined, company: undefined };
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { role: { $regex: query.search, $options: "i" } },
        { company: { $regex: query.search, $options: "i" } },
        { outcome: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.company) {
      filter.company = query.company;
    }
    if (query.cursor) {
      try {
        filter._id = { $gt: new ObjectId(query.cursor) };
      } catch {
        // ignore bad cursor
      }
    }
    const limit = Math.min(Math.max(query.limit ?? 24, 1), 200);
    const data = await col.find(filter).sort({ _id: 1 }).limit(limit).toArray();
    const next = data.length === limit ? data[data.length - 1]._id?.toString() : null;
    const companies = await col.distinct("company");
    return { data, cursor: { next, limit }, filters: { companies } };
  });

  app.get("/sellers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDb();
    const col = db.collection<z.infer<typeof sellerSchema>>("sellers_list");
    const item = await col.findOne({ id });
    if (!item) return reply.code(404).send({ message: "Seller not found" });
    return item;
  });

  app.put(
    "/sellers",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = payloadSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "sellers.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("sellers");
      await col.updateOne(
        { key: "default" },
        {
          $set: {
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            ctaLabel: parse.data.ctaLabel,
            ctaHref: parse.data.ctaHref,
            sellers: parse.data.sellers,
          },
        },
        { upsert: true }
      );
      request.log.info("sellers.update success");
      return parse.data;
    }
  );

  app.put(
    "/sellers/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parse = sellerSchema.safeParse({ ...(request.body as object), id });
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "sellers.list.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection<z.infer<typeof sellerSchema>>("sellers_list");
      await col.updateOne(
        { id },
        { $set: { ...parse.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      request.log.info({ id }, "sellers.list upserted");
      return parse.data;
    }
  );

  app.delete(
    "/sellers/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const db = await getDb();
      const col = db.collection<z.infer<typeof sellerSchema>>("sellers_list");
      const res = await col.deleteOne({ id });
      if (!res.deletedCount) return reply.code(404).send({ message: "Seller not found" });
      request.log.info({ id }, "sellers.list deleted");
      return { message: "Deleted", id };
    }
  );

  app.post(
    "/sellers/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = {
        eyebrow: "",
        title: "",
        description: "",
        ctaLabel: "",
        ctaHref: "",
        sellers: [] as any[],
      };
      const db = await getDb();
      const col = db.collection("sellers");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );
}
