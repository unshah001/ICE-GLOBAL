import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDb } from "../../db/mongo";

const linkSchema = z.object({
  name: z.string().min(1),
  href: z.string().default("#"),
});

const socialSchema = z.object({
  label: z.string().min(1),
  href: z.string().default(""),
});

const payloadSchema = z.object({
  ctaTitle: z.string().default(""),
  ctaDescription: z.string().default(""),
  partnerHref: z.string().default(""),
  sponsorHref: z.string().default(""),
  copyright: z.string().default(""),
  exploreLinks: z.array(linkSchema),
  partnersLinks: z.array(linkSchema),
  legalLinks: z.array(linkSchema),
  contact: z.object({
    location: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
  }),
  socials: z.array(socialSchema),
});

export default async function footerRoutes(app: FastifyInstance) {
  app.get("/footer", async () => {
    const db = await getDb();
    const col = db.collection("footer");
    const stored = await col.findOne<any>({ key: "default" });
    if (!stored) {
      return {
        ctaTitle: "",
        ctaDescription: "",
        partnerHref: "",
        sponsorHref: "",
        copyright: "",
        exploreLinks: [],
        partnersLinks: [],
        legalLinks: [],
        contact: { location: "", email: "", phone: "" },
        socials: [],
      };
    }
    return {
      ctaTitle: stored.ctaTitle ?? "",
      ctaDescription: stored.ctaDescription ?? "",
      partnerHref: stored.partnerHref ?? "",
      sponsorHref: stored.sponsorHref ?? "",
      copyright: stored.copyright ?? "",
      exploreLinks: stored.exploreLinks ?? [],
      partnersLinks: stored.partnersLinks ?? [],
      legalLinks: stored.legalLinks ?? [],
      contact: stored.contact ?? { location: "", email: "", phone: "" },
      socials: stored.socials ?? [],
    };
  });

  app.put(
    "/footer",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parse = payloadSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn({ issues: parse.error.issues }, "footer.update validation failed");
        return reply.code(400).send({ message: "Invalid payload" });
      }
      const db = await getDb();
      const col = db.collection("footer");
      await col.updateOne({ key: "default" }, { $set: parse.data }, { upsert: true });
      request.log.info("footer.update success");
      return parse.data;
    }
  );

  app.post(
    "/footer/restore",
    { preHandler: [app.authenticate] },
    async () => {
      const empty = {
        ctaTitle: "",
        ctaDescription: "",
        partnerHref: "",
        sponsorHref: "",
        copyright: "",
        exploreLinks: [] as any[],
        partnersLinks: [] as any[],
        legalLinks: [] as any[],
        contact: { location: "", email: "", phone: "" },
        socials: [] as any[],
      };
      const db = await getDb();
      const col = db.collection("footer");
      await col.updateOne({ key: "default" }, { $set: empty }, { upsert: true });
      return empty;
    }
  );
}
