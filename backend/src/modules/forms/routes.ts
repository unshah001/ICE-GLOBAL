import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const baseFields = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
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
  app.get("/forms", async () => {
    const db = await getDb();
    const col = db.collection("forms_definitions");
    const defs = await col.find({}, { projection: { _id: 0 } }).toArray();
    return defs;
  });

  app.get("/forms/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const db = await getDb();
    const col = db.collection("forms_definitions");
    const def = await col.findOne({ slug }, { projection: { _id: 0 } });
    if (!def) return reply.code(404).send({ message: "Form not found" });
    return def;
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
    if (!def) return reply.code(404).send({ message: "Form not found" });

    const fields = ensureBaseFields(def.fields || []);
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

    return { message: "Submitted" };
  });
}
