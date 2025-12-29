import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const sectionSchema = z.object({
  title: z.string(),
  body: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

const privacySchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Legal"),
      title: z.string().default("Privacy Policy"),
      intro: z
        .string()
        .default("We respect your privacy. This policy explains what data we collect, how we use it, and the choices you have."),
      updated: z.string().default("2024"),
    })
    .default({}),
  sections: z
    .array(sectionSchema)
    .default([
      {
        title: "Information we collect",
        body: "",
        bullets: [
          "Contact details you provide (name, email, company) via forms.",
          "Usage data (pages viewed, interactions) through analytics.",
          "Device and browser information (IP, user agent) for security and analytics.",
        ],
      },
      {
        title: "How we use information",
        body: "",
        bullets: [
          "To respond to inquiries and manage event participation.",
          "To improve our site experience and content.",
          "To secure our services, prevent abuse, and comply with legal obligations.",
          "To send updates you opt into; you can opt out anytime.",
        ],
      },
      {
        title: "Data sharing",
        body:
          "We do not sell your data. We share it only with service providers who help us operate the site (hosting, analytics, email) under confidentiality terms, or when required by law.",
        bullets: [],
      },
      {
        title: "Data retention",
        body:
          "We keep data only as long as needed for the purposes above or to meet legal requirements. You can request deletion of your personal data unless we must keep it for legal reasons.",
        bullets: [],
      },
      {
        title: "Your rights",
        body: "",
        bullets: [
          "Access, correct, or delete your personal data.",
          "Withdraw consent for communications.",
          "Contact us to exercise these rights: privacy@indiaglobalexpo.com.",
        ],
      },
      {
        title: "Contact",
        body:
          "For privacy inquiries, email privacy@indiaglobalexpo.com or write to us at Bangalore, India.",
        bullets: [],
      },
    ]),
});

export default async function privacyRoutes(app: FastifyInstance) {
  app.get("/privacy", async () => {
    const db = await getDb();
    const col = db.collection("privacy");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return privacySchema.parse({});
    const parsed = privacySchema.safeParse(stored);
    if (!parsed.success) return privacySchema.parse({});
    return parsed.data;
  });

  app.put(
    "/privacy",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = privacySchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "privacy.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("privacy");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("privacy.update success");
      return parsed.data;
    }
  );
}
