import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const partnerSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Partner with us"),
      title: z.string().default("Become a Partner"),
      subheading: z
        .string()
        .default("Co-create immersive experiences at INDIA GLOBAL EXPO. Tell us about your brand and the outcomes you want—we'll design a presence that people remember."),
    })
    .default({}),
  form: z
    .object({
      nameLabel: z.string().default("Name"),
      emailLabel: z.string().default("Email"),
      companyLabel: z.string().default("Company"),
      goalsLabel: z.string().default("Goals & vision"),
      goalsPlaceholder: z
        .string()
        .default("What do you want to showcase? What does success look like?"),
      namePlaceholder: z.string().default("Your name"),
      companyPlaceholder: z.string().default("Brand or organization"),
      emailPlaceholder: z.string().default("you@company.com"),
      ctaLabel: z.string().default("Submit"),
      note: z.string().default("We reply within 1–2 business days."),
      successMessage: z.string().default("Thanks for your interest in partnering. We'll reach out soon."),
    })
    .default({}),
});

export default async function partnerRoutes(app: FastifyInstance) {
  app.get("/partner", async () => {
    const db = await getDb();
    const col = db.collection("partner");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return partnerSchema.parse({});
    const parsed = partnerSchema.safeParse(stored);
    if (!parsed.success) return partnerSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/partner",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = partnerSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "partner.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("partner");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("partner.update success");
      return parsed.data;
    }
  );
}
