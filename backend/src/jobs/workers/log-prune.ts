import { Worker } from "bullmq";
import { cacheQueue } from "../queues";
import { getDb } from "../../db/mongo";
import { getRedis } from "../../db/redis";

// Reuse cacheQueue for simple scheduled prune; could create dedicated queue if needed
export const logPruneWorker = new Worker(
  cacheQueue.name,
  async (job) => {
    if (job.name !== "prune-logs") return;
    const db = await getDb();
    const settingsCol = db.collection("logging_settings");
    const logs = db.collection("digest_logs");
    const settings = await settingsCol.findOne({ key: "digest" });
    const retentionDays = settings?.retentionDays || 30;
    const graceDays = settings?.graceDays || 15;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const graceCutoff = new Date(Date.now() - (retentionDays + graceDays) * 24 * 60 * 60 * 1000);

    const hardDelete = await logs.deleteMany({ createdAt: { $lt: graceCutoff } });
    const graceWindowDocs = await logs
      .find({ createdAt: { $lt: cutoff, $gte: graceCutoff } })
      .sort({ createdAt: -1 })
      .toArray();
    let softDeleted = 0;
    if (graceWindowDocs.length > 0) {
      const keepUntil = new Date(cutoff.getTime() - graceDays * 24 * 60 * 60 * 1000);
      softDeleted = await logs
        .deleteMany({ createdAt: { $lt: keepUntil, $gte: graceCutoff } })
        .then((r) => r.deletedCount || 0);
    }
    job.log(`Pruned ${hardDelete.deletedCount || 0} hard and ${softDeleted} soft logs (retention ${retentionDays}d, grace ${graceDays}d)`);
  },
  { connection: getRedis() }
);
