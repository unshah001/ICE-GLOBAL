import { FastifyInstance } from "fastify";
import { Collection, ObjectId } from "mongodb";
import { z } from "zod";
import { getRedis } from "../../db/redis";
import { getDb } from "../../db/mongo";

const brandSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  logo: z.string().min(1),
  relationship: z.string().default(""),
  category: z.string().default(""),
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
  summary: z.string().optional(),
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
      highlights: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
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
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  brands: z.array(brandSchema),
});

const brandsHeroSchema = z.object({
  badge: z.string().default("Partner Brands"),
  title: z.string().default("Brands that trust ICE Exhibitions"),
  subheading: z
    .string()
    .default(
      "Explore our partner roster—long-term collaborators, headline sponsors, and innovators who shaped the expo experience."
    ),
});

const listQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .catch(1)
    .optional(),
  pageSize: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .catch(24)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .catch(24)
    .optional(),
  cursor: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "name-asc", "name-desc"]).optional(),
});

type BrandRecord = z.infer<typeof brandSchema>;
type BrandHighlightDocument = {
  key?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  brands?: Array<Partial<BrandRecord> & { slug?: string }>;
};

const emptyHighlightsResponse = () => ({
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  brands: [] as BrandRecord[],
});

const toHighlightsResponse = (stored?: BrandHighlightDocument, brands: BrandRecord[] = []) => ({
  eyebrow: stored?.eyebrow ?? "",
  title: stored?.title ?? "",
  description: stored?.description ?? "",
  ctaLabel: stored?.ctaLabel ?? "",
  ctaHref: stored?.ctaHref ?? "",
  brands,
});

const buildLiveHighlightBrands = async (
  brandsCol: Collection<BrandRecord>,
  references: Array<{ slug?: string }> = []
) => {
  const slugs = references
    .map((brand) => brand.slug?.trim())
    .filter((slug): slug is string => Boolean(slug));

  if (!slugs.length) return [];

  const liveBrands = await brandsCol
    .find({ slug: { $in: Array.from(new Set(slugs)) } })
    .toArray();
  const bySlug = new Map(liveBrands.map((brand) => [brand.slug, brand]));

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((brand): brand is BrandRecord => Boolean(brand));
};

const invalidateBrandCache = async () => {
  try {
    const redis = getRedis();
    const patterns = ["cache:/brands:*", "cache:/brands/:slug:*", "cache:/brands/highlights:*", "cache:/brands/hero:*"];
    const keys = new Set<string>();

    for (const pattern of patterns) {
      let cursor = "0";

      do {
        const [nextCursor, batch] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        batch.forEach((key) => keys.add(key));
        cursor = nextCursor;
      } while (cursor !== "0");
    }

    if (keys.size) {
      await redis.del(...Array.from(keys));
    }
  } catch {
    // Ignore cache invalidation errors and continue serving writes.
  }
};

export default async function brandsRoutes(app: FastifyInstance) {
  app.get("/brands/highlights", async () => {
    const db = await getDb();
    const highlightsCol = db.collection<BrandHighlightDocument>("brands_highlights");
    const brandsCol = db.collection<BrandRecord>("brands");
    const stored = await highlightsCol.findOne({ key: "default" });

    if (!stored) return emptyHighlightsResponse();

    const liveBrands = await buildLiveHighlightBrands(brandsCol, stored.brands ?? []);
    return toHighlightsResponse(stored, liveBrands);
  });

  app.get("/brands/hero", async () => {
    const db = await getDb();
    const col = db.collection<{ badge: string; title: string; subheading: string }>("brands_hero");
    const stored = await col.findOne({ key: "default" });

    if (!stored) return brandsHeroSchema.parse({});

    const parsed = brandsHeroSchema.safeParse(stored);
    if (!parsed.success) return brandsHeroSchema.parse({});

    return parsed.data;
  });

  app.get("/brands", async (request) => {
    const db = await getDb();
    const col = db.collection<BrandRecord>("brands");
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success
      ? parsed.data
      : {
          page: 1,
          pageSize: 24,
          limit: 24,
          category: undefined,
          search: undefined,
          cursor: undefined,
          sort: "newest" as const,
        };

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
    const sortParam = query.sort ?? "newest";
    const sort: Record<string, 1 | -1> =
      sortParam === "oldest"
        ? { createdAt: 1, _id: 1 }
        : sortParam === "name-asc"
          ? { name: 1 }
          : sortParam === "name-desc"
            ? { name: -1 }
            : { createdAt: -1, _id: -1 };

    if (useCursor) {
      if (query.cursor) {
        try {
          filter._id = { $gt: new ObjectId(query.cursor) };
        } catch {
          // Ignore bad cursors and start from the beginning.
        }
      }

      const data = await col
        .find(filter)
        .sort(sortParam === "oldest" ? { _id: 1 } : { _id: -1 })
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
      .sort(sort)
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
    const col = db.collection<BrandRecord>("brands");
    const item = await col.findOne({ slug });

    if (!item) return reply.code(404).send({ message: "Brand not found" });
    return item;
  });

  app.put(
    "/brands/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const requestBody = (request.body as { previousSlug?: string } | undefined) ?? {};
      const previousSlug = requestBody.previousSlug?.trim();
      const parse = brandSchema.safeParse({ ...(request.body as object), slug });

      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "brands.item validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }

      const db = await getDb();
      const col = db.collection<BrandRecord>("brands");

      if (previousSlug && previousSlug !== slug) {
        const existing = await col.findOne({ slug });
        if (existing && existing.slug !== previousSlug) {
          return reply.code(409).send({ message: "A brand with this slug already exists" });
        }
      }

      await col.updateOne(
        { slug: previousSlug || slug },
        { $set: { ...parse.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      if (previousSlug && previousSlug !== slug) {
        const highlightsCol = db.collection<BrandHighlightDocument>("brands_highlights");
        const storedHighlights = await highlightsCol.findOne({ key: "default" });

        if (storedHighlights?.brands?.length) {
          const updatedReferences = storedHighlights.brands.map((brand) =>
            brand.slug === previousSlug ? { ...brand, slug } : brand
          );

          await highlightsCol.updateOne(
            { key: "default" },
            {
              $set: {
                key: "default",
                eyebrow: storedHighlights.eyebrow ?? "",
                title: storedHighlights.title ?? "",
                description: storedHighlights.description ?? "",
                ctaLabel: storedHighlights.ctaLabel ?? "",
                ctaHref: storedHighlights.ctaHref ?? "",
                brands: updatedReferences,
              },
            },
            { upsert: true }
          );
        }
      }

      await invalidateBrandCache();
      request.log.info({ slug, previousSlug }, "brands.item upserted");
      return parse.data;
    }
  );

  app.delete(
    "/brands/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      
      const { slug } = request.params as { slug: string };
      const db = await getDb();
      const brandsCol = db.collection<BrandRecord>("brands");
      const highlightsCol = db.collection<BrandHighlightDocument>("brands_highlights");
      const result = await brandsCol.deleteOne({ slug });

      if (!result.deletedCount) {
        return reply.code(404).send({ message: "Brand not found" });
      }

      const storedHighlights = await highlightsCol.findOne({ key: "default" });
      if (storedHighlights) {
        const remainingReferences = (storedHighlights.brands ?? []).filter((brand) => brand.slug && brand.slug !== slug);
        const liveBrands = await buildLiveHighlightBrands(brandsCol, remainingReferences);

        await highlightsCol.updateOne(
          { key: "default" },
          {
            $set: {
              key: "default",
              eyebrow: storedHighlights.eyebrow ?? "",
              title: storedHighlights.title ?? "",
              description: storedHighlights.description ?? "",
              ctaLabel: storedHighlights.ctaLabel ?? "",
              ctaHref: storedHighlights.ctaHref ?? "",
              brands: liveBrands,
            },
          },
          { upsert: true }
        );
      }

      await invalidateBrandCache();
      request.log.info({ slug }, "brands.item deleted");
      return {
        success: true,
        deletedSlug: slug,
      };
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
            key: "default",
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            ctaLabel: parse.data.ctaLabel,
            ctaHref: parse.data.ctaHref,
            brands: parse.data.brands,
          },
        },
        { upsert: true }
      );

      await invalidateBrandCache();
      request.log.info("brands.update success");
      return parse.data;
    }
  );

  app.put(
    "/brands/hero",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = brandsHeroSchema.safeParse(request.body);

      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "brands.hero validation failed");
        return reply.code(400).send({ message: "Invalid hero payload" });
      }

      const db = await getDb();
      const col = db.collection("brands_hero");

      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });

      await invalidateBrandCache();
      request.log.info("brands.hero updated");
      return parsed.data;
    }
  );

  app.post(
    "/brands/highlights/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = emptyHighlightsResponse();
      const db = await getDb();
      const col = db.collection("brands_highlights");

      await col.updateOne(
        { key: "default" },
        { $set: { key: "default", ...empty } },
        { upsert: true }
      );

      await invalidateBrandCache();
      return empty;
    }
  );
}
