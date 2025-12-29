import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const copySchema = z.object({
  title: z.string().default("404"),
  subtitle: z.string().default("Oops! Page not found"),
  ctaLabel: z.string().default("Return to Home"),
  ctaHref: z.string().default("/"),
  message: z.string().default("The page you're looking for doesn't exist or was moved."),
  badge: z.string().default("Not found"),
});

export default async function notFoundRoutes(app: FastifyInstance) {
  app.get("/not-found", async () => {
    const db = await getDb();
    const col = db.collection("not_found");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return copySchema.parse({});
    const parsed = copySchema.safeParse(stored);
    if (!parsed.success) return copySchema.parse({});
    return parsed.data;
  });

  app.put(
    "/not-found",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = copySchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "not-found.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("not_found");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("not-found.update success");
      return parsed.data;
    }
  );
}
