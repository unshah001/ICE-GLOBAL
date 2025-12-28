import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const archSchema = z.object({
  city: z.string().min(1),
  year: z.string().min(1),
  highlight: z.string().default(""),
  image: z.string().url(),
  href: z.string().default(""),
});

const payloadSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  arches: z.array(archSchema),
});

export default async function archesRoutes(app: FastifyInstance) {
  app.get("/arches", async () => {
    const db = await getDb();
    const col = db.collection("arches");
    const stored = await col.findOne<{ eyebrow: string; title: string; description: string; ctaLabel?: string; ctaHref?: string; arches: any[] }>({
      key: "default",
    });
    if (!stored) {
      return { eyebrow: "", title: "", description: "", ctaLabel: "", ctaHref: "", arches: [] };
    }
    return {
      eyebrow: stored.eyebrow ?? "",
      title: stored.title ?? "",
      description: stored.description ?? "",
      ctaLabel: stored.ctaLabel ?? "",
      ctaHref: stored.ctaHref ?? "",
      arches: stored.arches ?? [],
    };
  });

  app.put(
    "/arches",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = payloadSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "arches.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("arches");
      await col.updateOne(
        { key: "default" },
        {
          $set: {
            eyebrow: parse.data.eyebrow,
            title: parse.data.title,
            description: parse.data.description,
            ctaLabel: parse.data.ctaLabel,
            ctaHref: parse.data.ctaHref,
            arches: parse.data.arches,
          },
        },
        { upsert: true }
      );
      request.log.info("arches.update success");
      return parse.data;
    }
  );

  app.post(
    "/arches/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = { eyebrow: "", title: "", description: "", ctaLabel: "", ctaHref: "", arches: [] as any[] };
      const db = await getDb();
      const col = db.collection("arches");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );
}
