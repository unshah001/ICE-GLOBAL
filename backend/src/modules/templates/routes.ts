import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { ObjectId } from "mongodb";

const templateSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(["email", "sms"]).default("email"),
  title: z.string().min(1),
  subject: z.string().default(""),
  body: z.string().default(""),
  placeholders: z.array(z.string()).default([]),
  formSlug: z.string().optional(),
  description: z.string().default(""),
});

export default async function templatesRoutes(app: FastifyInstance) {
  app.get("/templates", async (request) => {
    const q = request.query as { formSlug?: string; type?: string; search?: string; limit?: string; cursor?: string };
    const limit = Math.min(parseInt(q.limit || "20", 10) || 20, 100);
    const db = await getDb();
    const col = db.collection("templates");
    const filter: any = {};
    if (q.formSlug) filter.formSlug = q.formSlug;
    if (q.type) filter.type = q.type;
    if (q.search) filter.$or = [{ slug: { $regex: q.search, $options: "i" } }, { title: { $regex: q.search, $options: "i" } }];
    if (q.cursor) {
      try {
        filter._id = { $lt: new ObjectId(q.cursor) };
      } catch {
        // ignore invalid cursor
      }
    }
    const docs = await col.find(filter).sort({ _id: -1 }).limit(limit + 1).toArray();
    const hasMore = docs.length > limit;
    const items = docs.slice(0, limit).map((d) => ({
      id: d._id?.toString(),
      slug: d.slug,
      type: d.type,
      title: d.title,
      subject: d.subject,
      body: d.body,
      placeholders: d.placeholders || [],
      formSlug: d.formSlug,
      description: d.description || "",
      updatedAt: d.updatedAt,
    }));
    return {
      data: items,
      cursor: { next: hasMore ? docs[limit]._id?.toString() : null, limit },
      filters: { formSlug: q.formSlug || null, type: q.type || null, search: q.search || null },
    };
  });

  app.get("/templates/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const db = await getDb();
    const col = db.collection("templates");
    const doc = await col.findOne({ slug });
    if (!doc) return reply.code(404).send({ message: "Template not found" });
    return {
      id: doc._id?.toString(),
      slug: doc.slug,
      type: doc.type,
      title: doc.title,
      subject: doc.subject,
      body: doc.body,
      placeholders: doc.placeholders || [],
      formSlug: doc.formSlug,
      description: doc.description || "",
      updatedAt: doc.updatedAt,
    };
  });

  app.put(
    "/templates/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const parsed = templateSchema.safeParse({ ...(request.body as object), slug });
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "templates.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("templates");
      const now = new Date();
      await col.updateOne(
        { slug },
        {
          $set: { ...parsed.data, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
      request.log.info({ slug }, "template saved");
      return parsed.data;
    }
  );

  app.delete(
    "/templates/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const db = await getDb();
      const col = db.collection("templates");
      await col.deleteOne({ slug });
      request.log.info({ slug }, "template deleted");
      return { message: "Deleted" };
    }
  );
}
