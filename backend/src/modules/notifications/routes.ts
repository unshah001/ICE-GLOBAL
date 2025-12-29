import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { queueEmail } from "../../services/email";
import { env } from "../../config/env";

const eventCatalog = [
  { key: "otp", title: "OTP verification", description: "One-time password for secure logins." },
  { key: "contact-submitted", title: "Contact form", description: "Trigger when a contact form is submitted." },
  { key: "partner-submitted", title: "Partner inquiry", description: "Trigger on partner inquiry submission." },
  { key: "sponsor-submitted", title: "Sponsor inquiry", description: "Trigger on sponsor inquiry submission." },
  { key: "brand-guidelines", title: "Brand guidelines request", description: "Send assets link for brand guidelines." },
  { key: "feedback-submitted", title: "Feedback received", description: "Trigger when feedback form is submitted." },
];

const settingsSchema = z.object({
  settings: z
    .array(
      z.object({
        event: z.string(),
        enabled: z.boolean(),
      })
    )
    .default([]),
});

export default async function notificationsRoutes(app: FastifyInstance) {
  app.get("/notifications/settings", async () => {
    const db = await getDb();
    const col = db.collection("notification_settings");
    const doc = await col.findOne({ _id: "global" });
    const map: Record<string, { enabled: boolean }> = doc?.map || {};

    const data = eventCatalog.map((event) => {
      const cfg = map[event.key];
      return {
        ...event,
        enabled: cfg?.enabled ?? true, // default ON
      };
    });

    return { data };
  });

  app.put(
    "/notifications/settings",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = settingsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: "Invalid payload" });
      }

      const incoming = parsed.data.settings.reduce((acc, item) => {
        acc[item.event] = { enabled: item.enabled };
        return acc;
      }, {} as Record<string, { enabled: boolean }>);

      const db = await getDb();
      const col = db.collection("notification_settings");
      await col.updateOne(
        { _id: "global" },
        { $set: { map: incoming, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      return { message: "Saved" };
    }
  );

  app.post(
    "/notifications/test",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = request.body as { event?: string; to?: string; placeholders?: Record<string, string> };
      const event = eventCatalog.find((e) => e.key === body.event);
      if (!event) return reply.code(400).send({ message: "Unknown event" });
      const to = (body.to || "").trim() || env.emailFrom;
      const placeholders = body.placeholders || {};
      const db = await getDb();
      const tpl = await db.collection("templates").findOne({ slug: event.key });
      if (!tpl) return reply.code(404).send({ message: "Template not found for this event" });

      const render = (content: string) =>
        Object.entries(placeholders).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), content || "");

      const subject = render(tpl.subject || event.title);
      const html = render(tpl.body || `<p>${event.title}</p>`);
      const text = html.replace(/<[^>]+>/g, "");

      await queueEmail({
        to,
        subject,
        html,
        text,
        event: event.key,
        meta: { test: true, placeholders },
      });
      return { message: "Queued" };
    }
  );
}
