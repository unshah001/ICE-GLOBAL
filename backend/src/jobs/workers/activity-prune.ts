import { Worker } from "bullmq";
import { cacheQueue } from "../queues";
import { getDb } from "../../db/mongo";
import { getRedis } from "../../db/redis";

export const activityPruneWorker = new Worker(
  cacheQueue.name,
  async (job) => {
    if (job.name !== "prune-activity") return;
    const db = await getDb();
    const settingsCol = db.collection("logging_settings");
    const activityCol = db.collection("activity_events");
    const settings = await settingsCol.findOne({ key: "activity" });
    const retentionDays = settings?.retentionDays || 30;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const res = await activityCol.deleteMany({ createdAt: { $lt: cutoff } });
    job.log(`Pruned activity events older than ${retentionDays} days (${res.deletedCount || 0} removed)`);
  },
  { connection: getRedis() }
);
