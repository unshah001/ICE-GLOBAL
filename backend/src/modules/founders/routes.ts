import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "../../db/mongo";

const founderSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1),
  title: z.string().default(""),
  era: z.enum(["ICE 1.0", "ICE 2.0"]),
  focus: z.string().default(""),
  image: z.string().url(),
  highlight: z.string().default(""),
  href: z.string().default(""),
  social: z
    .object({
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .partial()
    .optional(),
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
  founders: z.array(founderSchema),
});

const detailCopySchema = z.object({
  moreEyebrow: z.string().default("More founders"),
  moreTitle: z.string().default("Explore more founder profiles"),
  moreDescription: z.string().default("Scroll to reveal more founders—tap to open their detailed profiles."),
});

const heroSchema = z.object({
  badge: z.string().default("Founders"),
  title: z.string().default("Meet the founders of ICE"),
  subheading: z
    .string()
    .default("Professional profiles of ICE 1.0 and 2.0—research-driven, with operational and creative highlights."),
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
  era: z.string().optional(),
});

export default async function foundersRoutes(app: FastifyInstance) {
  app.get("/founders", async () => {
    const db = await getDb();
    const col = db.collection("founders");
    const stored = await col.findOne<{
      eyebrow: string;
      title: string;
      description: string;
      ctaLabel: string;
      ctaHref: string;
      founders: any[];
    }>({ key: "default" });
    if (!stored) {
      return { eyebrow: "", title: "", description: "", ctaLabel: "", ctaHref: "", founders: [] };
    }
    return {
      eyebrow: stored.eyebrow ?? "",
      title: stored.title ?? "",
      description: stored.description ?? "",
      ctaLabel: stored.ctaLabel ?? "",
      ctaHref: stored.ctaHref ?? "",
      founders: stored.founders ?? [],
    };
  });

  app.get("/founders/hero", async () => {
    const db = await getDb();
    const col = db.collection<{ badge: string; title: string; subheading: string }>("founders_hero");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return heroSchema.parse({});
    const parsed = heroSchema.safeParse(stored);
    if (!parsed.success) return heroSchema.parse({});
    return parsed.data;
  });

  app.get("/founders/list", async (request) => {
    const db = await getDb();
    const col = db.collection<z.infer<typeof founderSchema>>("founders_list");
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : { limit: 24 };
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { title: { $regex: query.search, $options: "i" } },
        { focus: { $regex: query.search, $options: "i" } },
        { highlight: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.era) filter.era = query.era;
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
    const eras = await col.distinct("era");
    return { data, cursor: { next, limit }, filters: { eras } };
  });

  app.get("/founders/detail-copy", async () => {
    const db = await getDb();
    const col = db.collection<{ moreEyebrow: string; moreTitle: string; moreDescription: string }>("founders_detail_copy");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return detailCopySchema.parse({});
    const parsed = detailCopySchema.safeParse(stored);
    if (!parsed.success) return detailCopySchema.parse({});
    return parsed.data;
  });

  app.get("/founders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDb();
    const col = db.collection<z.infer<typeof founderSchema>>("founders_list");
    const item = await col.findOne({ id });
    if (!item) return reply.code(404).send({ message: "Founder not found" });
    return item;
  });

  app.put(
    "/founders",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = payloadSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "founders.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("founders");
      await col.updateOne(
        { key: "default" },
        {
          $set: {
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            ctaLabel: parse.data.ctaLabel,
            ctaHref: parse.data.ctaHref,
            founders: parse.data.founders,
          },
        },
        { upsert: true }
      );
      request.log.info("founders.update success");
      return parse.data;
    }
  );

  app.put(
    "/founders/hero",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = heroSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "founders.hero validation failed");
        return reply.code(400).send({ message: "Invalid hero payload" });
      }
      const db = await getDb();
      const col = db.collection("founders_hero");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("founders.hero updated");
      return parsed.data;
    }
  );

  app.put(
    "/founders/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parse = founderSchema.safeParse({ ...(request.body as object), id });
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "founders.list.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection<z.infer<typeof founderSchema>>("founders_list");
      await col.updateOne(
        { id },
        { $set: { ...parse.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      request.log.info({ id }, "founders.list upserted");
      return parse.data;
    }
  );

  app.delete(
    "/founders/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const db = await getDb();
      const col = db.collection<z.infer<typeof founderSchema>>("founders_list");
      const res = await col.deleteOne({ id });
      if (!res.deletedCount) return reply.code(404).send({ message: "Founder not found" });
      request.log.info({ id }, "founders.list deleted");
      return { message: "Deleted", id };
    }
  );

  app.post(
    "/founders/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = { eyebrow: "", title: "", description: "", ctaLabel: "", ctaHref: "", founders: [] as any[] };
      const db = await getDb();
      const col = db.collection("founders");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );

  app.put(
    "/founders/detail-copy",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = detailCopySchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "founders.detail-copy validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("founders_detail_copy");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("founders.detail-copy updated");
      return parsed.data;
    }
  );
}
