import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const contactSchema = z.object({
  hero: z
    .object({
      badge: z.string().default("Contact"),
      title: z.string().default("Let's design your next show-stopping moment"),
      subheading: z
        .string()
        .default("Tell us what you want to launch, celebrate, or showcase. We'll shape a tailored experience—stage, booth, VR zone, and media ops included."),
      chips: z.array(z.string()).default(["Production + AV", "Experience Design", "Media & Streaming"]),
    })
    .default({}),
  cards: z
    .array(
      z.object({
        icon: z.enum(["mail", "phone", "map", "clock"]).default("mail"),
        title: z.string(),
        value: z.string(),
        hint: z.string().default(""),
      })
    )
    .default([
      { icon: "mail", title: "Email", value: "hello@ICEglobal.com", hint: "We reply within one business day" },
      { icon: "phone", title: "Phone", value: "+91 98765 43210", hint: "Mon–Fri, 9:30 AM – 6:30 PM IST" },
      { icon: "map", title: "Studio", value: "Bangalore, India", hint: "Visit by appointment only" },
      { icon: "clock", title: "Turnaround", value: "2–3 days for proposals", hint: "Faster for returning partners" },
    ]),
  form: z
    .object({
      title: z.string().default("Tell us about your goals"),
      description: z
        .string()
        .default("Share what success looks like—launch metrics, lead targets, or the vibe you want to create. We’ll respond with a tailored plan and a call slot."),
      ctaLabel: z.string().default("Send message"),
      replyNote: z.string().default("We usually reply in 24–48 hours."),
    })
    .default({}),
  howWeWork: z
    .object({
      title: z.string().default("How we work"),
      items: z
        .array(z.string())
        .default([
          "Discovery call to define goals and the feeling you want guests to have.",
          "Experience blueprint: stage, booth, XR, wayfinding, lounges, and media ops.",
          "Production plan with timelines, budgets, and measurement framework.",
          "Onsite execution with live dashboards for dwell time, sentiment, and leads.",
        ]),
    })
    .default({}),
  whatToBring: z
    .object({
      title: z.string().default("What to bring"),
      items: z
        .array(z.string())
        .default([
          "Your brand story, launch goals, and any must-show products.",
          "Target audience, expected footfall, and desired vibe (concert, lounge, gallery).",
          "Timelines, budget range, and any existing assets (logos, media, 3D).",
        ]),
    })
    .default({}),
});

export default async function contactRoutes(app: FastifyInstance) {
  app.get("/contact", async () => {
    const db = await getDb();
    const col = db.collection("contact");
    const stored = await col.findOne({ key: "default" });
    if (!stored) return contactSchema.parse({});
    const parsed = contactSchema.safeParse(stored);
    if (!parsed.success) return contactSchema.parse({});
    return parsed.data;
  });

  app.put(
    "/contact",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = contactSchema.safeParse(request.body);
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "contact.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("contact");
      await col.updateOne({ key: "default" }, { $set: { key: "default", ...parsed.data } }, { upsert: true });
      request.log.info("contact.update success");
      return parsed.data;
    }
  );
}
