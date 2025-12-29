import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { getRedis } from "../../db/redis";

const gallerySectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

const galleryCommentSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  message: z.string().min(1),
  date: z.string().min(1),
});

const galleryItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  year: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().min(1),
  image: z.string().min(1),
  excerpt: z.string().min(1),
  article: z.array(gallerySectionSchema).default([]),
  likes: z.number().int().nonnegative().default(0),
  comments: z.array(galleryCommentSchema).default([]),
  tags: z.array(z.string()).default([]),
});

const bulkGallerySchema = z.object({
  items: z.array(galleryItemSchema),
});

const galleryHeroSchema = z.object({
  heading: z.string().default("Legacy"),
  accent: z.string().default("Gallery"),
  subheading: z.string().default("Browse curated moments from our past expos. Filter by year, category, or search for specific brands."),
});

const galleryQuerySchema = z.object({
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
  year: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
});

type GalleryItem = z.infer<typeof galleryItemSchema>;
type GalleryComment = z.infer<typeof galleryCommentSchema>;

export default async function galleryRoutes(app: FastifyInstance) {
  const sanitizeComments = (comments?: GalleryComment[]) =>
    (comments ?? []).map((c) => ({ id: c.id, message: c.message, date: c.date }));

  const sanitizeItem = (item: GalleryItem) => {
    const { comments, ...rest } = item;
    return {
      ...rest,
      comments: [], // comments are served via /gallery/:id/comments
    };
  };

  const commentsQuerySchema = z.object({
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => Number(v))
      .catch(10)
      .optional(),
    cursor: z.string().optional(), // base64 of { date: string; id: string }
  });

  app.get("/gallery", async (request) => {
    const db = await getDb();
    const col = db.collection<GalleryItem>("gallery");

    const parsed = galleryQuerySchema.safeParse(request.query);
    const query =
      parsed.success
        ? parsed.data
        : { page: 1, pageSize: 24, year: undefined, category: undefined, search: undefined, tag: undefined };

    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 24, 1), 200);
    const filter: Record<string, any> = {};

    if (query.year && query.year !== "All Years") {
      filter.year = query.year;
    }
    if (query.category && query.category !== "All") {
      filter.category = query.category;
    }
    if (query.tag) {
      filter.tags = { $in: [query.tag] };
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { brand: { $regex: query.search, $options: "i" } },
        { tags: { $regex: query.search, $options: "i" } },
      ];
    }

    const total = await col.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const raw = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    const data = raw.map(sanitizeItem);

    const distinctYears = await col.distinct("year");
    const distinctCategories = await col.distinct("category");
    const distinctTags = await col.distinct("tags");

    return {
      data,
      pagination: { page, pageSize, total, totalPages },
      filters: {
        years: distinctYears,
        categories: distinctCategories,
        tags: distinctTags,
        applied: {
          year: query.year ?? null,
          category: query.category ?? null,
          search: query.search ?? null,
          tag: query.tag ?? null,
        },
      },
    };
  });

  app.get("/gallery/hero", async () => {
    const db = await getDb();
    const col = db.collection<{ key: string; heading: string; subheading: string }>("gallery_hero");
    const stored = await col.findOne({ key: "default" });
    if (!stored) {
      return {
        heading: "Legacy",
        accent: "Gallery",
        subheading: "Browse curated moments from our past expos. Filter by year, category, or search for specific brands.",
      };
    }
    return {
      heading: stored.heading,
      accent: (stored as any).accent ?? "Gallery",
      subheading: stored.subheading,
    };
  });

  app.get("/gallery/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDb();
    const col = db.collection<GalleryItem>("gallery");
    const item = await col.findOne({ id });
    if (!item) {
      return reply.code(404).send({ message: "Gallery item not found" });
    }
    try {
      const redis = getRedis();
      const buffer = await redis.hget("gallery:like-buffer", id);
      if (buffer) {
        return sanitizeItem({ ...item, likes: item.likes + Number(buffer) });
      }
    } catch {
      // ignore redis errors
    }
    return sanitizeItem(item);
  });

  app.get("/gallery/:id/comments", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDb();
    const col = db.collection<GalleryItem>("gallery");

    const parsed = commentsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid query" });
    }

    const limit = Math.min(Math.max(parsed.data.limit ?? 10, 1), 50);
    let cursorDate: Date | null = null;
    let cursorId: string | null = null;
    if (parsed.data.cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(parsed.data.cursor, "base64").toString("utf8"));
        cursorDate = decoded.date ? new Date(decoded.date) : null;
        cursorId = decoded.id ?? null;
      } catch {
        // ignore malformed cursor
      }
    }

    const pipeline: any[] = [
      { $match: { id } },
      { $unwind: "$comments" },
      {
        $addFields: {
          "comments.dateObj": { $toDate: "$comments.date" },
        },
      },
    ];

    if (cursorDate && cursorId) {
      pipeline.push({
        $match: {
          $expr: {
            $or: [
              { $lt: ["$comments.dateObj", cursorDate] },
              {
                $and: [
                  { $eq: ["$comments.dateObj", cursorDate] },
                  { $lt: ["$comments.id", cursorId] },
                ],
              },
            ],
          },
        },
      });
    }

    pipeline.push(
      { $sort: { "comments.dateObj": -1, "comments.id": -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: "$comments.id",
          message: "$comments.message",
          date: "$comments.date",
          author: "$comments.author",
        },
      }
    );

    const docs = await col.aggregate<GalleryComment>(pipeline).toArray();
    const sanitized = sanitizeComments(docs);

    let next: string | null = null;
    if (sanitized.length === limit) {
      const last = sanitized[sanitized.length - 1];
      next = Buffer.from(JSON.stringify({ date: last.date, id: last.id })).toString("base64");
    }

    return { data: sanitized, cursor: { next, limit } };
  });

  app.put(
    "/gallery",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = bulkGallerySchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "gallery.bulk validation failed");
        return reply.code(400).send({ message: "Invalid gallery payload" });
      }

      const ids = new Set<string>();
      for (const item of parsed.data.items) {
        if (ids.has(item.id)) {
          return reply.code(400).send({ message: `Duplicate id detected: ${item.id}` });
        }
        ids.add(item.id);
      }

      const db = await getDb();
      const col = db.collection<GalleryItem>("gallery");
      await col.deleteMany({});
      const now = new Date();
      await col.insertMany(
        parsed.data.items.map((item) => ({
          ...item,
          createdAt: now,
          updatedAt: now,
        }))
      );

      request.log.info("gallery.bulk replaced");
      return { message: "Gallery items saved", count: parsed.data.items.length };
    }
  );

  app.post(
    "/gallery/:id/like",
    { preHandler: [app.authenticateUser] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user as { sub: string };
      const db = await getDb();
      const col = db.collection<GalleryItem>("gallery");
      const existing = await col.findOne({ id }, { projection: { likes: 1 } });
      if (!existing) return reply.code(404).send({ message: "Gallery item not found" });

      const redis = getRedis();
      const likedKey = `gallery:liked:${id}`;
      const bufferKey = "gallery:like-buffer";

      // prevent duplicate likes in the window
      const already = await redis.sismember(likedKey, user.sub);
      if (already) {
        const bufferVal = await redis.hget(bufferKey, id);
        const total = existing.likes + (bufferVal ? Number(bufferVal) : 0);
        return { likes: total };
      }

      await redis.sadd(likedKey, user.sub);
      await redis.expire(likedKey, 60 * 60 * 24 * 30);

      const bufferCount = await redis.hincrby(bufferKey, id, 1);
      let likesTotal = existing.likes + bufferCount;

      // Flush to Mongo when buffer reaches threshold
      if (bufferCount >= 10) {
        await redis.hdel(bufferKey, id);
        await col.updateOne({ id }, { $inc: { likes: bufferCount } });
        likesTotal = existing.likes + bufferCount;
      }

      return { likes: likesTotal };
    }
  );

  app.post(
    "/gallery/:id/comment",
    { preHandler: [app.authenticateUser] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user as { sub: string };
      const parsed = galleryCommentSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: "Invalid comment" });
      const comment: GalleryComment = { ...parsed.data, author: user.sub };
      const db = await getDb();
      const col = db.collection<GalleryItem>("gallery");
      const now = new Date();
      // Ensure doc exists first (no conflicting ops on the same path).
      await col.updateOne(
        { id },
        {
          $setOnInsert: {
            id,
            title: id,
            year: "",
            category: "",
            brand: "",
            image: "",
            excerpt: "",
            article: [],
            likes: 0,
            tags: [],
            comments: [],
            createdAt: now,
          },
          $set: { updatedAt: now },
        },
        { upsert: true }
      );
      await col.updateOne({ id }, { $push: { comments: comment }, $set: { updatedAt: now } });
      const updated = await col.findOne({ id }, { projection: { comments: 1 } });
      if (!updated) return reply.code(500).send({ message: "Unable to save comment" });
      return { comments: sanitizeComments(updated.comments) };
    }
  );

  app.put(
    "/gallery/hero",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = galleryHeroSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "gallery.hero validation failed");
        return reply.code(400).send({ message: "Invalid hero payload" });
      }
      const db = await getDb();
      const col = db.collection("gallery_hero");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("gallery.hero updated");
      return parsed.data;
    }
  );

  app.put(
    "/gallery/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = galleryItemSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "gallery.update validation failed");
        return reply.code(400).send({ message: "Invalid gallery item payload" });
      }

      const db = await getDb();
      const col = db.collection<GalleryItem>("gallery");
      const res = await col.updateOne(
        { id },
        { $set: { ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      request.log.info({ id, upserted: res.upsertedCount > 0 }, "gallery.update saved");
      return parsed.data;
    }
  );

  app.delete(
    "/gallery/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const db = await getDb();
      const col = db.collection<GalleryItem>("gallery");
      const res = await col.deleteOne({ id });
      if (!res.deletedCount) {
        return reply.code(404).send({ message: "Gallery item not found" });
      }
      request.log.info({ id }, "gallery.delete removed");
      return { message: "Deleted", id };
    }
  );
}
