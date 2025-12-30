import { getDb } from "../src/db/mongo";

/**
 * Seeds the home-page team block used by the Team Editor (/teams API).
 * Run with:  ts-node backend/scripts/seed-team-home.ts
 */
const seed = {
  key: "default",
  eyebrow: "Meet the team",
  title: "People who keep ICE running",
  description: "Production, media, growth, and design leaders behind the circuit.",
  ctaLabel: "See all team members",
  ctaHref: "/teams",
  team: [
    {
      id: "team-ops-lead",
      name: "Priya Menon",
      role: "Head of Production",
      department: "Production",
      focus: "Stage ops, lighting, crew",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
      href: "/teams/priya-menon",
    },
    {
      id: "team-tech",
      name: "Kabir Shah",
      role: "CTO, Telemetry",
      department: "Technology",
      focus: "Infra, telemetry, automation",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
      href: "/teams/kabir-shah",
    },
    {
      id: "team-experience",
      name: "Rhea Menon",
      role: "Experience & Hospitality",
      department: "Experience",
      focus: "Guest journey, lounges, service design",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      href: "/teams/rhea-menon",
    },
    {
      id: "team-media",
      name: "Ishaan Verma",
      role: "Head of Media Labs",
      department: "Media",
      focus: "Content pipelines & highlights",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop",
      href: "/teams/ishaan-verma",
    },
    {
      id: "team-growth",
      name: "Ayesha Khan",
      role: "Director, Buyer Programs",
      department: "Growth",
      focus: "Routes, buyer experience",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      href: "/teams/ayesha-khan",
    },
    {
      id: "team-design",
      name: "Vikram Shah",
      role: "Design Director",
      department: "Design",
      focus: "Spatial & visual systems",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      href: "/teams/vikram-shah",
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("teams");
    await col.updateOne({ key: "default" }, { $set: seed }, { upsert: true });
    console.log("Team home block seeded.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
