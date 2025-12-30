import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { DateTime } from "luxon";
import { cacheQueue } from "../../jobs/queues";

const ingestSchema = z.object({
  path: z.string().min(1),
  referrer: z.string().optional(),
  user: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export default async function activityRoutes(app: FastifyInstance) {
  const db = await getDb();
  const activityCol = db.collection("activity_events");
  const settingsCol = db.collection("logging_settings");

  app.post("/activity/page", async (request, reply) => {
    const parsed = ingestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid payload" });
    await activityCol.insertOne({
      ...parsed.data,
      createdAt: new Date(),
      type: "page_view",
      ip: request.ip,
      ua: request.headers["user-agent"],
    });
    return { message: "ok" };
  });

  app.get("/admin/analytics/pages", { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { from?: string; to?: string; limit?: string };
    const limit = Math.min(parseInt(query.limit || "20", 10) || 20, 200);
    const match: any = { type: "page_view" };
    if (query.from || query.to) {
      match.createdAt = {};
      if (query.from) match.createdAt.$gte = new Date(query.from);
      if (query.to) match.createdAt.$lte = new Date(query.to);
    }
    const agg = await activityCol
      .aggregate([
        { $match: match },
        { $group: { _id: "$path", count: { $sum: 1 }, avgDuration: { $avg: "$durationMs" } } },
        { $project: { path: "$_id", count: 1, avgDuration: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return { data: agg };
  });

  app.get("/admin/settings/activity-logging", { preHandler: [app.authenticate] }, async () => {
    const settings = await settingsCol.findOne({ key: "activity" });
    return {
      retentionDays: settings?.retentionDays || 30,
    };
  });

  app.put("/admin/settings/activity-logging", { preHandler: [app.authenticate] }, async (request, reply) => {
    const schema = z.object({
      retentionDays: z.number().int().positive().max(365).default(30),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Invalid settings" });
    await settingsCol.updateOne(
      { key: "activity" },
      { $set: { key: "activity", ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return parsed.data;
  });

  app.post("/admin/activity/prune-now", { preHandler: [app.authenticate] }, async () => {
    await cacheQueue.add("prune-activity", {}, { removeOnComplete: true });
    return { enqueued: true, job: "prune-activity" };
  });
}
