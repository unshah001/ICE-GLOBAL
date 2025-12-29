import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const sectionSchema = z.object({
  title: z.string(),
  body: z.string().default(""),
});

const termsSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Legal"),
      title: z.string().default("Terms of Service"),
      intro: z
        .string()
        .default("These terms govern your use of our website and services. By accessing the site, you agree to these terms."),
      updated: z.string().default("2024"),
    })
    .default({}),
  sections: z
    .array(sectionSchema)
    .default([
      {
        title: "Use of the site",
        body: "You may browse and use the site for lawful purposes. Do not disrupt, attempt to breach security, or misuse content.",
      },
      {
        title: "Content & IP",
        body: "All branding, media, and copy are owned by India Global Expo or our partners. Do not reproduce without permission.",
      },
      {
        title: "Links to third parties",
        body: "External links are provided for convenience. We are not responsible for third-party content or practices.",
      },
      {
        title: "Disclaimers",
        body:
          "The site is provided “as is.” We do not guarantee uninterrupted access. To the extent permitted by law, we exclude liability for indirect or consequential damages.",
      },
      {
        title: "Changes",
        body: "We may update these terms. Continued use after changes means you accept the updated terms.",
      },
      {
        title: "Governing law",
        body: "These terms are governed by the laws of India. Disputes will be handled in Bangalore jurisdiction.",
      },
    ]),
});

export default async function termsRoutes(app: FastifyInstance) {
  app.get("/terms", async () => {
    const db = await getDb();
    const col = db.collection("terms");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return termsSchema.parse({});
    const parsed = termsSchema.safeParse(stored);
    if (!parsed.success) return termsSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/terms",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = termsSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "terms.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("terms");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("terms.update success");
      return parsed.data;
    }
  );
}
