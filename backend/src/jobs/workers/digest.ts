import { Worker } from "bullmq";
import { digestQueue } from "../queues";
import { getDb } from "../../db/mongo";
import { getRedis } from "../../db/redis";
import { queueEmail } from "../../services/email";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import { Collection } from "mongodb";

type DigestJob = {
  configId: string;
  from?: string;
  to?: string;
};

const defaultRange = (frequency: string, tz: string) => {
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
  includeMetrics: { leads: boolean; comments: boolean; likes: boolean; users: boolean };
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

const renderEmail = (config: any, payload: Awaited<ReturnType<typeof collectDigest>>) => {
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

export const digestWorker = new Worker(
  digestQueue.name,
  async (job) => {
    const payload = job.data as DigestJob;
    const db = await getDb();
    const configsCol = db.collection("digest_configs");
    const logsCol: Collection = db.collection("digest_logs");
    const doc = await configsCol.findOne({ _id: new ObjectId(payload.configId) });
    if (!doc) {
      job.log(`config ${payload.configId} not found`);
      return;
    }

    const { frequency, timezone, formSlugs, includeMetrics, recipients, name } = doc as any;
    const tz = timezone || "UTC";
    const now = DateTime.now().setZone(tz);
    const rangeFrom = payload.from ? DateTime.fromISO(payload.from) : defaultRange(frequency, tz).from;
    const rangeTo = payload.to ? DateTime.fromISO(payload.to) : now;

    const startedAt = new Date();
    try {
      const aggregated = await collectDigest({
        from: rangeFrom.toJSDate(),
        to: rangeTo.toJSDate(),
        formSlugs,
        includeMetrics: includeMetrics || { leads: true, comments: true, likes: true, users: true },
      });

      const { subject, html } = renderEmail({ name, frequency }, aggregated);
      await queueEmail({ to: recipients, subject, html, event: "digest-scheduled" });
      await configsCol.updateOne(
        { _id: new ObjectId(payload.configId) },
        { $set: { lastRunAt: new Date(), updatedAt: new Date() } }
      );
      await logsCol.insertOne({
        configId: payload.configId,
        name,
        status: "success",
        rangeFrom: aggregated.range.from,
        rangeTo: aggregated.range.to,
        recipients,
        metrics: aggregated,
        createdAt: new Date(),
        startedAt,
      });
      job.log(`digest sent for config ${payload.configId}`);
    } catch (err: any) {
      await logsCol.insertOne({
        configId: payload.configId,
        name,
        status: "failed",
        rangeFrom: rangeFrom.toISO(),
        rangeTo: rangeTo.toISO(),
        recipients,
        error: err?.message || String(err),
        createdAt: new Date(),
        startedAt,
      });
      throw err;
    }
  },
  { connection: getRedis() }
);
