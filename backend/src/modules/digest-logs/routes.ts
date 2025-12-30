import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { cacheQueue } from "../../jobs/queues";

const listQuery = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => Number(v))
    .pipe(z.number().int().positive().max(200))
    .catch(20),
  cursor: z.string().optional(),
  configId: z.string().optional(),
  status: z.enum(["success", "failed"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export default async function digestLogsRoutes(app: FastifyInstance) {
  const db = await getDb();
  const logs = db.collection("digest_logs");

  app.get("/admin/digests/logs", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuery.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid query" });
    const { limit, cursor, configId, status, from, to } = parsed.data;
    const filter: any = {};
    if (configId) filter.configId = configId;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (cursor) {
      filter._id = { $lt: new (await import("mongodb")).ObjectId(cursor) };
    }
    const docs = await logs.find(filter).sort({ _id: -1 }).limit(limit + 1).toArray();
    const hasMore = docs.length > limit;
    const items = docs.slice(0, limit).map((d) => ({
      id: d._id?.toString(),
      configId: d.configId,
      name: d.name,
      status: d.status,
      rangeFrom: d.rangeFrom,
      rangeTo: d.rangeTo,
      recipients: d.recipients,
      metrics: d.metrics,
      error: d.error,
      createdAt: d.createdAt,
    }));
    return { data: items, cursor: { next: hasMore ? docs[limit]._id?.toString() : null, limit } };
  });

  app.delete("/admin/digests/logs/prune", { preHandler: [app.authenticate] }, async (request, reply) => {
    const settingsCol = db.collection("logging_settings");
    const settings = await settingsCol.findOne({ key: "digest" });
    const retentionDays = settings?.retentionDays || 30;
    const graceDays = settings?.graceDays || 15;
    const now = Date.now();
    const cutoff = new Date(now - retentionDays * 24 * 60 * 60 * 1000);
    const graceCutoff = new Date(now - (retentionDays + graceDays) * 24 * 60 * 60 * 1000);

    // First delete anything older than retention + grace
    const hardDelete = await logs.deleteMany({ createdAt: { $lt: graceCutoff } });

    // For the grace window (between retention and retention+grace), keep only the most recent 15 days
    const graceWindowDocs = await logs
      .find({ createdAt: { $lt: cutoff, $gte: graceCutoff } })
      .sort({ createdAt: -1 })
      .toArray();

    let softDeleted = 0;
    if (graceWindowDocs.length > 0) {
      const keepUntil = new Date(cutoff.getTime() - graceDays * 24 * 60 * 60 * 1000);
      softDeleted = await logs.deleteMany({ createdAt: { $lt: keepUntil, $gte: graceCutoff } }).then((r) => r.deletedCount || 0);
    }

    return { deleted: (hardDelete.deletedCount || 0) + softDeleted, retentionDays, graceDays };
  });

  app.post("/admin/digests/logs/prune-now", { preHandler: [app.authenticate] }, async () => {
    await cacheQueue.add("prune-logs", {}, { removeOnComplete: true });
    return { enqueued: true, job: "prune-logs" };
  });

  app.get("/admin/settings/logging", { preHandler: [app.authenticate] }, async () => {
    const settingsCol = db.collection("logging_settings");
    const settings = await settingsCol.findOne({ key: "digest" });
    return {
      retentionDays: settings?.retentionDays || 30,
      graceDays: settings?.graceDays || 15,
    };
  });

  app.put("/admin/settings/logging", { preHandler: [app.authenticate] }, async (request, reply) => {
    const schema = z.object({
      retentionDays: z.number().int().positive().max(365).default(30),
      graceDays: z.number().int().nonnegative().max(180).default(15),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid settings" });
    const settingsCol = db.collection("logging_settings");
    await settingsCol.updateOne(
      { key: "digest" },
      { $set: { key: "digest", ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return parsed.data;
  });
}
