import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";
import { ObjectId } from "mongodb";
import { queueEmail } from "../../services/email";
import { env } from "../../config/env";
import { isNotificationEnabled } from "../../services/notifications";

const baseFields = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
];

const defaultDefinitions = [
  {
    slug: "contact",
    title: "Contact",
    description: "General inquiry",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "message", label: "Project details", type: "textarea", required: true },
    ],
  },
  {
    slug: "partner",
    title: "Partner inquiry",
    description: "Partnership goals",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "goals", label: "Goals", type: "textarea", required: true },
    ],
  },
  {
    slug: "sponsor",
    title: "Sponsor inquiry",
    description: "Sponsorship objectives",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "budget", label: "Budget range", type: "text", required: true },
      { id: "goals", label: "Objectives", type: "textarea", required: true },
    ],
  },
  {
    slug: "brand-guidelines",
    title: "Brand guidelines request",
    description: "Asset request",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "intent", label: "Intended use", type: "textarea", required: true },
    ],
  },
  {
    slug: "feedback",
    title: "Feedback",
    description: "Experience feedback",
    fields: [
      ...baseFields,
      { id: "role", label: "Role", type: "text", required: false },
      { id: "rating", label: "Rating (1-5)", type: "number", required: true },
      { id: "message", label: "Feedback", type: "textarea", required: true },
    ],
  },
];

const fieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "textarea", "select", "number"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

const formSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  fields: z.array(fieldSchema),
});

const ensureBaseFields = (fields: z.infer<typeof fieldSchema>[]) => {
  const map = new Map(fields.map((f) => [f.id, f]));
  for (const base of baseFields) {
    const existing = map.get(base.id);
    if (existing) {
      map.set(base.id, { ...existing, ...base }); // enforce required/label/type
    } else {
      map.set(base.id, base);
    }
  }
  return Array.from(map.values());
};

export default async function formsRoutes(app: FastifyInstance) {
  const eventMap: Record<string, string> = {
    contact: "contact-submitted",
    partner: "partner-submitted",
    sponsor: "sponsor-submitted",
    "brand-guidelines": "brand-guidelines",
    feedback: "feedback-submitted",
  };

  const renderTemplate = (content: string, placeholders: Record<string, string>) =>
    Object.entries(placeholders).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), content || "");

  const maybeSendEmail = async (slug: string, email: string, placeholders: Record<string, string>) => {
    const event = eventMap[slug];
    if (!event || !email) return;
    const db = await getDb();

    // Check notification settings
    const enabled = await isNotificationEnabled(event);
    if (!enabled) return;

    const tpl = await db.collection("templates").findOne<{ subject?: string; body?: string }>({ slug: event });
    if (!tpl) return;

    const subject = renderTemplate(tpl.subject || "Thanks for your submission", placeholders);
    const html = renderTemplate(tpl.body || "<p>Thanks for reaching out.</p>", placeholders);
    const text = html.replace(/<[^>]+>/g, "");

    await queueEmail({
      to: email,
      subject,
      html,
      text,
      event,
      meta: { slug, placeholders },
    });
  };

  app.get("/forms", async () => {
    const db = await getDb();
    const col = db.collection("forms_definitions");
    const defs = await col.find({}, { projection: { _id: 0 } }).toArray();
    const mapped: any[] = [];
    for (const def of defaultDefinitions) {
      const match = defs.find((d) => d.slug === def.slug);
      mapped.push(match || def);
    }
    return mapped.map((d) => ({ ...d, fields: ensureBaseFields(d.fields || []) }));
  });

  app.get("/forms/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const db = await getDb();
    const col = db.collection("forms_definitions");
    const def = await col.findOne({ slug }, { projection: { _id: 0 } });
    const fallback = defaultDefinitions.find((d) => d.slug === slug);
    if (!def && !fallback) return reply.code(404).send({ message: "Form not found" });
    return { ...(fallback || {}), ...(def || {}), fields: ensureBaseFields((def?.fields || fallback?.fields) || []) };
  });

  app.put(
    "/forms/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const parsed = formSchema.safeParse({ ...(request.body as object), slug });
      if (!parsed.success) {
        request.log.warn({ issues: parsed.error.issues }, "forms.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const withBase = ensureBaseFields(parsed.data.fields);
      const db = await getDb();
      const col = db.collection("forms_definitions");
      await col.updateOne(
        { slug },
        { $set: { ...parsed.data, fields: withBase, key: slug, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      request.log.info({ slug }, "form definition saved");
      return { ...parsed.data, fields: withBase };
    }
  );

  app.post("/forms/:slug/submit", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const db = await getDb();
    const defCol = db.collection("forms_definitions");
    const def = await defCol.findOne<{ fields: z.infer<typeof fieldSchema>[] }>({ slug });
    const fallback = defaultDefinitions.find((d) => d.slug === slug);
    if (!def && !fallback) return reply.code(404).send({ message: "Form not found" });

    const fields = ensureBaseFields((def?.fields || fallback?.fields) || []);
    const body = request.body as Record<string, unknown>;

    // Validate required base fields
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return reply.code(400).send({ message: "Name is required" });
    }
    if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
      return reply.code(400).send({ message: "Email is required" });
    }

    // Basic validation for other required fields
    for (const field of fields) {
      if (field.required) {
        const val = body[field.id];
        if (val === undefined || val === null || (typeof val === "string" && !val.trim())) {
          return reply.code(400).send({ message: `${field.label} is required` });
        }
      }
    }

    const submissions = db.collection("forms_submissions");
    await submissions.insertOne({
      slug,
      data: fields.map((f) => ({ id: f.id, label: f.label, value: body[f.id] })),
      createdAt: new Date(),
    });

    const placeholders: Record<string, string> = {};
    fields.forEach((f) => {
      const val = body[f.id];
      if (typeof val === "string") placeholders[f.id] = val;
    });
    const email = typeof body.email === "string" ? body.email : "";
    if (email) {
      await maybeSendEmail(slug, email, placeholders);
    }

    return { message: "Submitted" };
  });

  app.get(
    "/forms/submissions",
    { preHandler: [app.authenticate] },
    async (request) => {
      const params = request.query as {
        slug?: string;
        limit?: string;
        cursor?: string;
        q?: string;
        from?: string;
        to?: string;
        order?: "asc" | "desc";
      };
      const limit = Math.min(parseInt(params.limit || "20", 10) || 20, 100);
      const db = await getDb();
      const col = db.collection("forms_submissions");
      const filter: any = {};
      const order = params.order === "asc" ? 1 : -1;
      if (params.slug) filter.slug = params.slug;
      if (params.cursor) {
        try {
          filter._id = order === -1 ? { $lt: new ObjectId(params.cursor) } : { $gt: new ObjectId(params.cursor) };
        } catch {
          // ignore invalid cursor
        }
      }
      if (params.from || params.to) {
        filter.createdAt = {};
        if (params.from) filter.createdAt.$gte = new Date(params.from);
        if (params.to) filter.createdAt.$lte = new Date(params.to);
      }
      if (params.q) {
        filter.$or = [
          { "data.value": { $regex: params.q, $options: "i" } },
          { "data.label": { $regex: params.q, $options: "i" } },
        ];
      }
      const docs = await col.find(filter).sort({ _id: order }).limit(limit + 1).toArray();
      const hasMore = docs.length > limit;
      const sliced = docs.slice(0, limit);
      const items = sliced.map((d) => ({
        id: d._id?.toString(),
        slug: d.slug,
        createdAt: d.createdAt,
        data: d.data,
      }));
      const nextCursor = hasMore ? docs[limit]._id?.toString() : null;
      const defsCol = db.collection("forms_definitions");
      const defs = await defsCol.find({}, { projection: { _id: 0, slug: 1, title: 1 } }).toArray();
      return {
        data: items,
        cursor: { next: nextCursor, limit },
        filters: {
          slug: params.slug || null,
          q: params.q || null,
          from: params.from || null,
          to: params.to || null,
          order: order === 1 ? "asc" : "desc",
          forms: defs,
        },
      };
    }
  );

  app.get(
    "/forms/submissions/export",
    { preHandler: [app.authenticate] },
    async (request) => {
      const params = request.query as {
        slug?: string;
        q?: string;
        from?: string;
        to?: string;
        order?: "asc" | "desc";
        limit?: string;
      };
      const limit = Math.min(parseInt(params.limit || "1000", 10) || 1000, 5000);
      const db = await getDb();
      const col = db.collection("forms_submissions");
      const filter: any = {};
      const order = params.order === "asc" ? 1 : -1;
      if (params.slug) filter.slug = params.slug;
      if (params.from || params.to) {
        filter.createdAt = {};
        if (params.from) filter.createdAt.$gte = new Date(params.from);
        if (params.to) filter.createdAt.$lte = new Date(params.to);
      }
      if (params.q) {
        filter.$or = [
          { "data.value": { $regex: params.q, $options: "i" } },
          { "data.label": { $regex: params.q, $options: "i" } },
        ];
      }
      const docs = await col.find(filter).sort({ _id: order }).limit(limit).toArray();
      const items = docs.map((d) => ({
        id: d._id?.toString(),
        slug: d.slug,
        createdAt: d.createdAt,
        data: d.data,
      }));
      return {
        data: items,
        filters: {
          slug: params.slug || null,
          q: params.q || null,
          from: params.from || null,
          to: params.to || null,
          order: order === 1 ? "asc" : "desc",
          limit,
        },
      };
    }
  );
}
