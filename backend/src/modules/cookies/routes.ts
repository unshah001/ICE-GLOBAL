import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const sectionSchema = z.object({
  title: z.string(),
  body: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

const cookiesSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Legal"),
      title: z.string().default("Cookie Policy"),
      intro: z.string().default("This policy explains how we use cookies and similar technologies on our site."),
      updated: z.string().default("2024"),
    })
    .default({}),
  sections: z
    .array(sectionSchema)
    .default([
      {
        title: "What are cookies?",
        body: "Cookies are small text files stored on your device to improve site experience and remember preferences.",
        bullets: [],
      },
      {
        title: "How we use cookies",
        body: "",
        bullets: [
          "Essential: to keep the site functioning (navigation, forms).",
          "Analytics: to understand traffic and improve content.",
          "Preferences: to remember language/theme choices.",
        ],
      },
      {
        title: "Managing cookies",
        body: "You can adjust browser settings to block or delete cookies. Some features may not work without essential cookies.",
        bullets: [],
      },
      {
        title: "Third-party cookies",
        body: "Services like analytics or media embeds may set their own cookies. Review their policies for details.",
        bullets: [],
      },
    ]),
});

export default async function cookiesRoutes(app: FastifyInstance) {
  app.get("/cookies", async () => {
    const db = await getDb();
    const col = db.collection("cookies");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return cookiesSchema.parse({});
    const parsed = cookiesSchema.safeParse(stored);
    if (!parsed.success) return cookiesSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/cookies",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = cookiesSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "cookies.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("cookies");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("cookies.update success");
      return parsed.data;
    }
  );
}
