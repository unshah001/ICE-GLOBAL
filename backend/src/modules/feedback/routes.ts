import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const ratingOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const feedbackSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Feedback"),
      title: z.string().default("Share your experience"),
      subheading: z
        .string()
        .default("Tell us what you loved and what we can improve. Your input shapes the next INDIA GLOBAL EXPO."),
    })
    .default({}),
  form: z
    .object({
      nameLabel: z.string().default("Name"),
      emailLabel: z.string().default("Email"),
      roleLabel: z.string().default("Role"),
      ratingLabel: z.string().default("Rating"),
      feedbackLabel: z.string().default("Feedback"),
      buttonLabel: z.string().default("Submit feedback"),
      note: z.string().default("We read every response."),
      rolePlaceholder: z.string().default("Attendee, partner, sponsor..."),
      feedbackPlaceholder: z.string().default("Share highlights, suggestions, or issues you faced."),
      successMessage: z.string().default("Thanks for your feedback! We appreciate your time."),
    })
    .default({}),
  ratingOptions: z
    .array(ratingOptionSchema)
    .default([
      { value: "5", label: "5 - Excellent" },
      { value: "4", label: "4 - Good" },
      { value: "3", label: "3 - Fair" },
      { value: "2", label: "2 - Needs improvement" },
      { value: "1", label: "1 - Poor" },
    ]),
});

export default async function feedbackRoutes(app: FastifyInstance) {
  app.get("/feedback", async () => {
    const db = await getDb();
    const col = db.collection("feedback");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return feedbackSchema.parse({});
    const parsed = feedbackSchema.safeParse(stored);
    if (!parsed.success) return feedbackSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/feedback",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = feedbackSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "feedback.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("feedback");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("feedback.update success");
      return parsed.data;
    }
  );
}
