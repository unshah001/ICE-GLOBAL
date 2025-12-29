import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const themeSchema = z.object({
  current: z.string().min(1).default("theme-minimal"),
});

export default async function themeRoutes(app: FastifyInstance) {
  app.get("/theme", async () => {
    const db = await getDb();
    const col = db.collection("theme");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return themeSchema.parse({});
    const parsed = themeSchema.safeParse(stored);
    if (!parsed.success) return themeSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/theme",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = themeSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "theme.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("theme");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("theme updated");
      return parsed.data;
    }
  );
}
