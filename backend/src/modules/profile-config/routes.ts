import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const extraFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  placeholder: z.string().optional(),
});

const profileConfigSchema = z
  .object({
    labels: z
      .object({
        name: z.string().default("Name"),
        company: z.string().default("Company"),
        address: z.string().default("Professional address"),
        bio: z.string().default("Bio"),
        notes: z.string().default("Notes"),
      })
      .default({}),
    header: z
      .object({
        title: z.string().default("Your profile"),
        description: z.string().default("Update your details used for likes and comments."),
      })
      .default({ title: "Your profile", description: "Update your details used for likes and comments." }),
    extraFields: z.array(extraFieldSchema).default([]),
  })
  .default({});

export default async function profileConfigRoutes(app: FastifyInstance) {
  app.get("/profile/config", { preHandler: async (request) => {
    // swallow expired/invalid tokens to keep this endpoint public
    if (request.headers.authorization) {
      try {
        await request.jwtVerify({ ignoreExpiration: true });
      } catch {
        // ignore
      }
    }
  } }, async () => {
    const db = await getDb();
    const col = db.collection("profile_config");
    const stored = await col.findOne({ _id: "default" });
    if (!stored) return profileConfigSchema.parse({});
    const parsed = profileConfigSchema.safeParse(stored);
    if (!parsed.success) return profileConfigSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/profile/config",
    { preHandler: [app.authenticateAdmin] },
    async (request, reply) => {
      const parsed = profileConfigSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: "Invalid profile config" });
      const db = await getDb();
      const col = db.collection("profile_config");
      await col.updateOne(
        { _id: "default" },
        { $set: { _id: "default", ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      return parsed.data;
    }
  );
}
