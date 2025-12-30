import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "../../db/mongo";

const buyerSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1),
  city: z.string().default(""),
  segment: z.string().default(""),
  quote: z.string().default(""),
  spend: z.string().default(""),
  visits: z.string().default(""),
  image: z.string().min(1),
  variants: z
    .array(
      z.object({
        key: z.string().min(1),
        path: z.string().min(1),
        fileName: z.string().optional(),
        format: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        size: z.number().optional(),
      })
    )
    .optional(),
  href: z.string().default(""),
  detail: z
    .object({
      headline: z.string().optional(),
      summary: z.string().optional(),
      heroImage: z.string().optional(),
      heroVariants: z
        .array(
          z.object({
            key: z.string().min(1),
            path: z.string().min(1),
            fileName: z.string().optional(),
            format: z.string().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            size: z.number().optional(),
          })
        )
        .optional(),
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
  buyers: z.array(buyerSchema),
});

const buyersHeroSchema = z.object({
  badge: z.string().default("Buyer Stories"),
  title: z.string().default("Buyers who keep coming back"),
  subheading: z
    .string()
    .default("Search and filter buyer journeys—spend, visits, and how ICE programming keeps them onsite."),
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
  city: z.string().optional(),
  segment: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
});

export default async function buyersRoutes(app: FastifyInstance) {
  app.get("/buyers", async () => {
    const db = await getDb();
    const col = db.collection("buyers");
    const stored = await col.findOne<{
      eyebrow: string;
      title: string;
      description: string;
      ctaLabel: string;
      ctaHref: string;
      buyers: any[];
    }>({ key: "default" });

    if (!stored) {
      return { eyebrow: "", title: "", description: "", ctaLabel: "", ctaHref: "", buyers: [] };
    }

    return {
      eyebrow: stored.eyebrow ?? "",
      title: stored.title ?? "",
      description: stored.description ?? "",
      ctaLabel: stored.ctaLabel ?? "",
      ctaHref: stored.ctaHref ?? "",
      buyers: stored.buyers ?? [],
    };
  });

  app.get("/buyers/hero", async () => {
    const db = await getDb();
    const col = db.collection<{ badge: string; title: string; subheading: string }>("buyers_hero");
    const stored = await col.findOne({ key: "default" });
    if (!stored) {
      return buyersHeroSchema.parse({});
    }
    const parsed = buyersHeroSchema.safeParse(stored);
    if (!parsed.success) {
      return buyersHeroSchema.parse({});
    }
    return parsed.data;
  });

  app.get("/buyers/list", async (request) => {
    const db = await getDb();
    const col = db.collection<z.infer<typeof buyerSchema>>("buyers_list");
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : { limit: 24 };
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { city: { $regex: query.search, $options: "i" } },
        { segment: { $regex: query.search, $options: "i" } },
        { quote: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.city) filter.city = query.city;
    if (query.segment) filter.segment = query.segment;
    const sortOrder = query.sort === "oldest" ? 1 : -1;
    if (query.cursor) {
      try {
        filter._id = sortOrder === -1 ? { $lt: new ObjectId(query.cursor) } : { $gt: new ObjectId(query.cursor) };
      } catch {
        // ignore bad cursor
      }
    }
    const limit = Math.min(Math.max(query.limit ?? 24, 1), 200);
    const data = await col.find(filter).sort({ _id: sortOrder }).limit(limit).toArray();
    const next = data.length === limit ? data[data.length - 1]._id?.toString() : null;
    const cities = await col.distinct("city");
    const segments = await col.distinct("segment");
    return { data, cursor: { next, limit }, filters: { cities, segments } };
  });

  app.get("/buyers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDb();
    const col = db.collection<z.infer<typeof buyerSchema>>("buyers_list");
    const item = await col.findOne({ id });
    if (!item) return reply.code(404).send({ message: "Buyer not found" });
    return item;
  });

  app.put(
    "/buyers",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = payloadSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "buyers.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }

      const db = await getDb();
      const col = db.collection("buyers");
      await col.updateOne(
        { key: "default" },
        {
          $set: {
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            ctaLabel: parse.data.ctaLabel,
            ctaHref: parse.data.ctaHref,
            buyers: parse.data.buyers,
          },
        },
        { upsert: true }
      );
      request.log.info("buyers.update success");
      return parse.data;
    }
  );

  app.put(
    "/buyers/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parse = buyerSchema.safeParse({ ...(request.body as object), id });
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "buyers.list.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection<z.infer<typeof buyerSchema>>("buyers_list");
      await col.updateOne(
        { id },
        { $set: { ...parse.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      request.log.info({ id }, "buyers.list upserted");
      return parse.data;
    }
  );

  app.delete(
    "/buyers/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const db = await getDb();
      const col = db.collection<z.infer<typeof buyerSchema>>("buyers_list");
      const res = await col.deleteOne({ id });
      if (!res.deletedCount) return reply.code(404).send({ message: "Buyer not found" });
      request.log.info({ id }, "buyers.list deleted");
      return { message: "Deleted", id };
    }
  );

  app.put(
    "/buyers/hero",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = buyersHeroSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "buyers.hero validation failed");
        return reply.code(400).send({ message: "Invalid hero payload" });
      }
      const db = await getDb();
      const col = db.collection("buyers_hero");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("buyers.hero updated");
      return parsed.data;
    }
  );

  app.post(
    "/buyers/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = {
        eyebrow: "",
        title: "",
        description: "",
        ctaLabel: "",
        ctaHref: "",
        buyers: [] as any[],
      };
      const db = await getDb();
      const col = db.collection("buyers");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );
}
