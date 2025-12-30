import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { getRedis } from "../../db/redis";
import { queueEmail } from "../../services/email";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import { digestQueue } from "../../jobs/queues";

const digestConfigSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "semiannual", "annual"]),
  timeOfDay: z.string().default("09:00"), // HH:mm
  timezone: z.string().default("UTC"),
  recipients: z.array(z.string().email()).nonempty(),
  formSlugs: z.array(z.string()).optional(),
  includeMetrics: z
    .object({
      leads: z.boolean().default(true),
      comments: z.boolean().default(true),
      likes: z.boolean().default(true),
      users: z.boolean().default(true),
    })
    .default({ leads: true, comments: true, likes: true, users: true }),
  includeStatusBreakdown: z.boolean().default(false),
});

const manualDigestSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  recipients: z.array(z.string().email()).optional(),
  formSlugs: z.array(z.string()).optional(),
});

type DigestConfig = z.infer<typeof digestConfigSchema> & { _id?: string; lastRunAt?: Date; nextRunAt?: Date };

const defaultRange = (frequency: DigestConfig["frequency"], tz: string) => {
  const now = DateTime.now().setZone(tz || "UTC");
  switch (frequency) {
    case "daily":
      return { from: now.minus({ days: 1 }), to: now };
    case "weekly":
      return { from: now.minus({ days: 7 }), to: now };
    case "monthly":
      return { from: now.minus({ months: 1 }), to: now };
    case "quarterly":
      return { from: now.minus({ months: 3 }), to: now };
    case "semiannual":
      return { from: now.minus({ months: 6 }), to: now };
    case "annual":
      return { from: now.minus({ years: 1 }), to: now };
    default:
      return { from: now.minus({ days: 1 }), to: now };
  }
};

const collectDigest = async ({
  from,
  to,
  formSlugs,
  includeMetrics,
}: {
  from: Date;
  to: Date;
  formSlugs?: string[];
  includeMetrics: DigestConfig["includeMetrics"];
}) => {
  const db = await getDb();

  const leadMatch: any = { createdAt: { $gte: from, $lte: to } };
  if (formSlugs?.length) leadMatch.slug = { $in: formSlugs };
  const submissions = db.collection("forms_submissions");

  let leads = { total: 0, byForm: [] as { slug: string; count: number }[] };
  if (includeMetrics.leads) {
    const agg = await submissions
      .aggregate([
        { $match: leadMatch },
        { $group: { _id: "$slug", count: { $sum: 1 } } },
        { $project: { slug: "$_id", count: 1, _id: 0 } },
      ])
      .toArray();
    leads = { total: agg.reduce((acc, cur) => acc + (cur.count || 0), 0), byForm: agg as any };
  }

  const galleryCol = db.collection("gallery");
  let commentsTotal = 0;
  if (includeMetrics.comments) {
    const agg = await galleryCol
      .aggregate([
        { $unwind: "$comments" },
        { $addFields: { "comments.dateObj": { $toDate: "$comments.date" } } },
        { $match: { "comments.dateObj": { $gte: from, $lte: to } } },
        { $count: "count" },
      ])
      .toArray();
    commentsTotal = agg[0]?.count || 0;
  }

  let likesTotal = 0;
  if (includeMetrics.likes) {
    const likesAgg = await galleryCol.aggregate([{ $group: { _id: null, total: { $sum: "$likes" } } }]).toArray();
    likesTotal += likesAgg[0]?.total || 0;
    try {
      const redis = getRedis();
      const buffers = await redis.hvals("gallery:like-buffer");
      likesTotal += buffers.reduce((acc, val) => acc + Number(val || 0), 0);
    } catch {
      // ignore redis errors
    }
  }

  let usersTotal = 0;
  if (includeMetrics.users) {
    const usersCol = db.collection("users");
    usersTotal = await usersCol.countDocuments({ createdAt: { $gte: from, $lte: to } });
  }

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    leads,
    comments: { total: commentsTotal },
    likes: { total: likesTotal },
    users: { total: usersTotal },
  };
};

const renderEmail = (config: DigestConfig, payload: Awaited<ReturnType<typeof collectDigest>>) => {
  const { range, leads, comments, likes, users } = payload;
  const fmt = (iso?: string) =>
    iso ? DateTime.fromISO(iso).toFormat("yyyy-MM-dd HH:mm") : "";
  const byFormRows =
    leads.byForm.length === 0
      ? "<tr><td colspan='2'>No leads</td></tr>"
      : leads.byForm.map((f) => `<tr><td>${f.slug}</td><td style="text-align:right;">${f.count}</td></tr>`).join("");

  return {
    subject: `[Digest] ${config.name} (${config.frequency})`,
    html: `
      <h2>${config.name}</h2>
      <p>Range: ${fmt(range.from)} → ${fmt(range.to)}</p>
      <h3>Leads</h3>
      <p>Total: <strong>${leads.total}</strong></p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;min-width:300px;">
        <thead><tr><th align="left">Form</th><th align="right">Count</th></tr></thead>
        <tbody>${byFormRows}</tbody>
      </table>
      <h3>Engagement</h3>
      <ul>
        <li>Comments: <strong>${comments.total}</strong></li>
        <li>Likes (cumulative): <strong>${likes.total}</strong></li>
        <li>New Users: <strong>${users.total}</strong></li>
      </ul>
      <p style="color:#666;font-size:12px;">Note: Likes are cumulative totals; per-window likes logging not yet implemented.</p>
    `,
  };
};

export default async function digestsRoutes(app: FastifyInstance) {
  const configsCol = (await getDb()).collection("digest_configs");

  app.get("/admin/digests", { preHandler: [app.authenticate] }, async () => {
    const docs = await configsCol.find({}, { sort: { updatedAt: -1 } }).toArray();
    return { data: docs };
  });

  app.post("/admin/digests", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = digestConfigSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid digest config" });
    const now = new Date();
    const doc: DigestConfig = { ...parsed.data, createdAt: now, updatedAt: now };
    const res = await configsCol.insertOne(doc);
    return { ...doc, _id: res.insertedId?.toString() };
  });

  app.put("/admin/digests/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = digestConfigSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid digest config" });
    const res = await configsCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    if (!res.matchedCount) return reply.code(404).send({ message: "Digest config not found" });
    return { _id: id, ...parsed.data };
  });

  app.delete("/admin/digests/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await configsCol.updateOne({ _id: new ObjectId(id) }, { $set: { enabled: false, updatedAt: new Date() } });
    if (!res.matchedCount) return reply.code(404).send({ message: "Digest config not found" });
    return { _id: id, disabled: true };
  });

  app.post("/admin/digests/:id/send-now", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await configsCol.findOne({ _id: new ObjectId(id) });
    if (!doc) return reply.code(404).send({ message: "Digest config not found" });
    const parsed = digestConfigSchema.safeParse({ ...doc });
    if (!parsed.success) return reply.code(400).send({ message: "Invalid stored config" });
    const config = parsed.data;
    const tz = config.timezone || "UTC";
    const { from, to } = defaultRange(config.frequency, tz);
    const payload = await collectDigest({
      from: from.toJSDate(),
      to: to.toJSDate(),
      formSlugs: config.formSlugs,
      includeMetrics: config.includeMetrics,
    });
    const { subject, html } = renderEmail(config, payload);
    await queueEmail({ to: config.recipients, subject, html, event: "digest-send" });
    await configsCol.updateOne({ _id: id as any }, { $set: { lastRunAt: new Date() } });
    return { message: "Digest sent", range: payload.range };
  });

  app.post("/admin/digests/preview", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = manualDigestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid payload" });

    const now = DateTime.now();
    const from = parsed.data.from ? DateTime.fromISO(parsed.data.from) : now.minus({ days: 1 });
    const to = parsed.data.to ? DateTime.fromISO(parsed.data.to) : now;

    const payload = await collectDigest({
      from: from.toJSDate(),
      to: to.toJSDate(),
      formSlugs: parsed.data.formSlugs,
      includeMetrics: { leads: true, comments: true, likes: true, users: true },
    });

    if (parsed.data.recipients?.length) {
      const config: DigestConfig = {
        name: "Manual preview",
        enabled: true,
        frequency: "daily",
        timeOfDay: "00:00",
        timezone: "UTC",
        recipients: parsed.data.recipients,
        includeMetrics: { leads: true, comments: true, likes: true, users: true },
      };
      const { subject, html } = renderEmail(config, payload);
      await queueEmail({ to: parsed.data.recipients, subject, html, event: "digest-preview" });
    }

    return { data: payload };
  });

  // Enqueue due digests based on frequency/time; call from a cron or scheduler
  app.post("/admin/digests/run-due", { preHandler: [app.authenticate] }, async () => {
    const now = DateTime.utc();
    const configs = await configsCol.find({ enabled: true }).toArray();
    let enqueued = 0;

    for (const cfg of configs) {
      const parsed = digestConfigSchema.safeParse({ ...cfg, recipients: cfg.recipients || [] });
      if (!parsed.success) continue;
      const { frequency, timezone } = parsed.data;
      const tz = timezone || "UTC";

      // Determine next run time if missing
      let nextRun = cfg.nextRunAt ? DateTime.fromJSDate(cfg.nextRunAt).setZone(tz) : null;
      if (!nextRun) {
        const { to } = defaultRange(frequency, tz);
        nextRun = to.set({ hour: Number(parsed.data.timeOfDay.split(":")[0] || 9), minute: Number(parsed.data.timeOfDay.split(":")[1] || 0) });
      }

      if (now < nextRun.toUTC()) continue;

      const { from, to } = defaultRange(frequency, tz);
      await digestQueue.add(
        "digest",
        { configId: cfg._id?.toString(), from: from.toISO(), to: to.toISO() },
        { removeOnComplete: true, attempts: 3 }
      );
      enqueued += 1;

      // Compute and persist nextRunAt
      let increment: any = {};
      if (frequency === "daily") increment = { days: 1 };
      else if (frequency === "weekly") increment = { weeks: 1 };
      else if (frequency === "monthly") increment = { months: 1 };
      else if (frequency === "quarterly") increment = { months: 3 };
      else if (frequency === "semiannual") increment = { months: 6 };
      else if (frequency === "annual") increment = { years: 1 };
      const updatedNext = nextRun.plus(increment).toJSDate();
      await configsCol.updateOne({ _id: cfg._id }, { $set: { nextRunAt: updatedNext, updatedAt: new Date() } });
    }

    return { enqueued };
  });
}
