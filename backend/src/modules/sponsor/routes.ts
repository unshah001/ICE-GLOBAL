import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const sponsorSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Sponsorships"),
      title: z.string().default("Sponsor an Event"),
      subheading: z
        .string()
        .default("Put your brand at the center of the expo. Tell us your objectives and budget so we can tailor a sponsorship that delivers attention and ROI."),
    })
    .default({}),
  form: z
    .object({
      nameLabel: z.string().default("Name"),
      emailLabel: z.string().default("Email"),
      companyLabel: z.string().default("Company"),
      budgetLabel: z.string().default("Budget range"),
      goalsLabel: z.string().default("What do you want to achieve?"),
      namePlaceholder: z.string().default("Your name"),
      emailPlaceholder: z.string().default("you@company.com"),
      companyPlaceholder: z.string().default("Brand or organization"),
      budgetPlaceholder: z.string().default("e.g., $25k–$75k"),
      goalsPlaceholder: z
        .string()
        .default("Share goals like reach, leads, categories, or specific placements."),
      ctaLabel: z.string().default("Submit"),
      note: z.string().default("We reply within 1–2 business days."),
      successMessage: z.string().default("Thanks for your interest in sponsoring. We'll contact you soon."),
    })
    .default({}),
});

export default async function sponsorRoutes(app: FastifyInstance) {
  app.get("/sponsor", async () => {
    const db = await getDb();
    const col = db.collection("sponsor");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return sponsorSchema.parse({});
    const parsed = sponsorSchema.safeParse(stored);
    if (!parsed.success) return sponsorSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/sponsor",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = sponsorSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "sponsor.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("sponsor");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("sponsor.update success");
      return parsed.data;
    }
  );
}
