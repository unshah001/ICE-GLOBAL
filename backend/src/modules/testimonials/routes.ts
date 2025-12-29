import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const testimonialSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1),
  role: z.string().default(""),
  company: z.string().default(""),
  image: z.string().url(),
  rating: z.number().int().min(1).max(5).default(5),
  quote: z.string().default(""),
});

const payloadSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Voices"),
      title: z.string().default("Testimonials"),
      intro: z
        .string()
        .default("What our partners, founders, and attendees say about INDIA GLOBAL EXPO. Animated stories from the floor to the main stage."),
      ctaLabel: z.string().default("Send feedback"),
      ctaHref: z.string().default("/feedback"),
      ctaBadge: z.string().default("Share yours"),
      ctaTitle: z.string().default("Were you at the expo?"),
      ctaBody: z
        .string()
        .default("Tell us what you loved, what you’d improve, and what you want to see next year. Your feedback shapes the next edition."),
    })
    .default({}),
  testimonials: z.array(testimonialSchema),
});

export default async function testimonialsRoutes(app: FastifyInstance) {
  app.get("/testimonials", async () => {
    const db = await getDb();
    const col = db.collection("testimonials");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return payloadSchema.parse({ testimonials: [] });
    const parsed = payloadSchema.safeParse(stored);
    if (!parsed.success) return payloadSchema.parse({ testimonials: [] });
    return parsed.data;
  });

  app.put(
    "/testimonials",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = payloadSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "testimonials.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("testimonials");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("testimonials.update success");
      return parsed.data;
    }
  );
}
