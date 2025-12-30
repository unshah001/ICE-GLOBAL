import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const sectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean().default(true),
});

const payloadSchema = z.object({
  sections: z.array(sectionSchema),
});

const defaultSections = [
  { id: "hero", label: "Hero", enabled: true },
  { id: "review", label: "Review Moments", enabled: true },
  { id: "brands", label: "Brand Highlights", enabled: true },
  { id: "celebs", label: "Celebrities", enabled: true },
  { id: "sellers", label: "Seller Voices", enabled: true },
  { id: "buyers", label: "Buyer Voices", enabled: true },
  { id: "timeline", label: "Timeline", enabled: true },
  { id: "arches", label: "Entrance Arches", enabled: true },
  { id: "stalls", label: "Stalls Mosaic", enabled: true },
  { id: "buyerMosaic", label: "Buyer Mosaic", enabled: true },
  { id: "vvips", label: "VVIPs", enabled: true },
  { id: "founders", label: "Founders", enabled: true },
  { id: "cofounders", label: "Co-Founders", enabled: true },
  { id: "counts", label: "Counts", enabled: true },
  { id: "dualCta", label: "Dual CTA", enabled: true },
  { id: "footer", label: "Footer", enabled: true },
];

export default async function homeLayoutRoutes(app: FastifyInstance) {
  const db = await getDb();
  const col = db.collection("home_layout");

  app.get("/home-layout", async () => {
    const stored = await col.findOne({ _id: "default" });
    if (!stored) {
      return { sections: defaultSections };
    }
    const parsed = payloadSchema.safeParse(stored);
    if (!parsed.success) return { sections: defaultSections };
    return parsed.data;
  });

  app.put(
    "/home-layout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = payloadSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "home-layout.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      await col.updateOne(
        { _id: "default" },
        { $set: { _id: "default", sections: parsed.data.sections, updatedAt: new Date() } },
        { upsert: true }
      );
      return parsed.data;
    }
  );

  app.post(
    "/home-layout/restore",
    { preHandler: [app.authenticate] },
    async () => {
      await col.updateOne(
        { _id: "default" },
        { $set: { _id: "default", sections: defaultSections, updatedAt: new Date() } },
        { upsert: true }
      );
      return { sections: defaultSections };
    }
  );
}
