import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "../../db/mongo";

const brandSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  logo: z.string().min(1),
  relationship: z.string().default(""),
  category: z.string().default(""),
  image: z.string().url(),
  summary: z.string().optional(),
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
      impactDescription: z.string().optional(),
    })
    .optional(),
});

const brandsSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  brands: z.array(brandSchema),
});

const listQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .catch(1)
    .optional(),
  pageSize: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .catch(24)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .catch(24)
    .optional(),
  cursor: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export default async function brandsRoutes(app: FastifyInstance) {
  app.get("/brands/highlights", async () => {
    const db = await getDb();
    const col = db.collection("brands_highlights");
    const stored = await col.findOne<{ eyebrow: string; title: string; description: string; brands: z.infer<typeof brandSchema>[] }>({
      key: "default",
    });
    if (!stored) {
      return { eyebrow: "", title: "", description: "", brands: [] };
    }
    return {
      eyebrow: stored.eyebrow ?? "",
      title: stored.title ?? "",
      description: stored.description ?? "",
      brands: stored.brands ?? [],
    };
  });

  app.get("/brands", async (request) => {
    const db = await getDb();
    const col = db.collection<z.infer<typeof brandSchema>>("brands");

    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success
      ? parsed.data
      : { page: 1, pageSize: 24, limit: 24, category: undefined, search: undefined, cursor: undefined };

    const filter: Record<string, unknown> = {};
    if (query.category && query.category !== "All") {
      filter.category = query.category;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { relationship: { $regex: query.search, $options: "i" } },
        { category: { $regex: query.search, $options: "i" } },
      ];
    }

    const useCursor = Boolean(query.cursor);
    const limit = Math.min(Math.max(query.limit ?? 24, 1), 200);

    if (useCursor) {
      if (query.cursor) {
        try {
          filter._id = { $gt: new ObjectId(query.cursor) };
        } catch {
          // ignore invalid cursor, treat as start
        }
      }
      const data = await col
        .find(filter)
        .sort({ _id: 1 })
        .limit(limit)
        .toArray();
      const categories = await col.distinct("category");
      const nextCursor = data.length === limit ? data[data.length - 1]._id?.toString() : null;
      return {
        data,
        cursor: { next: nextCursor, limit },
        filters: { categories },
      };
    }

    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 24, 1), 200);
    const total = await col.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const data = await col
      .find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const categories = await col.distinct("category");

    return {
      data,
      pagination: { page, pageSize, total, totalPages },
      filters: { categories },
    };
  });

  app.get("/brands/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const db = await getDb();
    const col = db.collection<z.infer<typeof brandSchema>>("brands");
    const item = await col.findOne({ slug });
    if (!item) return reply.code(404).send({ message: "Brand not found" });
    return item;
  });

  app.put(
    "/brands/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const parse = brandSchema.safeParse({ ...(request.body as object), slug });
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "brands.item validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }

      const db = await getDb();
      const col = db.collection<z.infer<typeof brandSchema>>("brands");
      await col.updateOne(
        { slug },
        { $set: { ...parse.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      request.log.info({ slug }, "brands.item upserted");
      return parse.data;
    }
  );

  app.delete(
    "/brands/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const db = await getDb();
      const col = db.collection<z.infer<typeof brandSchema>>("brands");
      const res = await col.deleteOne({ slug });
      if (!res.deletedCount) return reply.code(404).send({ message: "Brand not found" });
      request.log.info({ slug }, "brands.item deleted");
      return { message: "Deleted", slug };
    }
  );

  app.put(
    "/brands/highlights",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = brandsSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "brands.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("brands_highlights");
      await col.updateOne(
        { key: "default" },
        {
          $set: {
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            brands: parse.data.brands,
          },
        },
        { upsert: true }
      );
      request.log.info("brands.update success");
      return parse.data;
    }
  );

  app.post(
    "/brands/highlights/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = {
        eyebrow: "",
        title: "",
        description: "",
        brands: [] as any[],
      };
      const db = await getDb();
      const col = db.collection("brands_highlights");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );
}
