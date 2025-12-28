import { getDb } from "../src/db/mongo";
import { brands as fullBrands } from "./seed-brands-full";

const defaultBrands = {
  key: "default",
  eyebrow: "Trustworthy Leaders",
  title: "Brands that trust ICE Exhibitions",
  description: "Logos and stories from partners who have built standout moments on our platform.",
  ctaLabel: "View all partner brands",
  ctaHref: "/brands",
  brands: fullBrands.slice(0, 6).map((b) => ({
    slug: b.slug,
    name: b.name,
    logo: b.logo,
    relationship: b.relationship,
    category: b.category,
    image: b.image,
  })),
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("brands_highlights");
    await col.updateOne({ key: "default" }, { $set: defaultBrands }, { upsert: true });
    console.log("Brands highlights seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
