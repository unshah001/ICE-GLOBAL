import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const detailCopySchema = z.object({
  badge: z.string().default("Gallery"),
  backLabel: z.string().default("Back to gallery"),
  spreadTitle: z.string().default("Spread the word"),
  spreadBody: z.string().default("Share this moment with your team or friends. Every repost helps the community grow."),
  commentTitle: z.string().default("Comments"),
  commentPlaceholderName: z.string().default("Your name"),
  commentPlaceholderMessage: z.string().default("Share your thoughts..."),
  commentButton: z.string().default("Post Comment"),
  emptyComments: z.string().default("Be the first to start the conversation."),
  shareLabel: z.string().default("Share"),
  likesLabel: z.string().default("Likes"),
  storyLabelPrefix: z.string().default("Story"),
});

export default async function galleryDetailRoutes(app: FastifyInstance) {
  app.get("/gallery-detail/copy", async () => {
    const db = await getDb();
    const col = db.collection("gallery_detail_copy");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return detailCopySchema.parse({});
    const parsed = detailCopySchema.safeParse(stored);
    if (!parsed.success) return detailCopySchema.parse({});
    return parsed.data;
  });

  app.put(
    "/gallery-detail/copy",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = detailCopySchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "gallery-detail.copy validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("gallery_detail_copy");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("gallery-detail.copy updated");
      return parsed.data;
    }
  );
}
