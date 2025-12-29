import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const brandingSchema = z.object({
  logoUrl: z.string().default(""),
  darkLogoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  navLogoUrl: z.string().default(""),
  navDarkLogoUrl: z.string().default(""),
  navWidth: z.number().int().nonnegative().default(160),
  navHeight: z.number().int().nonnegative().default(48),
  footerLogoUrl: z.string().default(""),
  footerDarkLogoUrl: z.string().default(""),
  footerWidth: z.number().int().nonnegative().default(160),
  footerHeight: z.number().int().nonnegative().default(48),
  logoType: z.string().default("horizontal"),
  width: z.number().int().nonnegative().default(160),
  height: z.number().int().nonnegative().default(48),
  padding: z.string().default("6px 10px"),
  background: z.string().default("transparent"),
  href: z.string().default("/"),
  alt: z.string().default("ICE Exhibitions"),
});

export default async function brandingRoutes(app: FastifyInstance) {
  app.get("/branding", async () => {
    const db = await getDb();
    const col = db.collection("branding");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return brandingSchema.parse({});
    const parsed = brandingSchema.safeParse(stored);
    if (!parsed.success) return brandingSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/branding",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = brandingSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "branding.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("branding");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("branding updated");
      return parsed.data;
    }
  );
}
