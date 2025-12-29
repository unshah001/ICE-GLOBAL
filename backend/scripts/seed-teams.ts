import { getDb } from "../src/db/mongo";

const defaultTeam = {
  key: "default",
  eyebrow: "Meet the team",
  title: "People who run ICE end-to-end",
  description: "Producers, ops, media, design, and data teams who keep the circuits live.",
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
      highlight: "Runs the master show-calls and ops handoffs across cities.",
      href: "/teams/priya-menon",
      social: { linkedin: "https://linkedin.com/in/priya-menon" },
    },
    {
      id: "team-ops-tech",
      name: "Kabir Shah",
      role: "CTO, Telemetry",
      department: "Technology",
      focus: "Infra, telemetry, automation",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
      highlight: "Keeps XR and stages healthy with live dashboards and runbooks.",
      href: "/teams/kabir-shah",
      social: { linkedin: "https://linkedin.com/in/kabirshah" },
    },
    {
      id: "team-media",
      name: "Rhea Menon",
      role: "Experience & Hospitality",
      department: "Experience",
      focus: "Guest journey, lounges, service design",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      highlight: "Designs lounges, wayfinding, and service scripts across venues.",
      href: "/teams/rhea-menon",
      social: { linkedin: "https://linkedin.com/in/rheamenon" },
    },
    {
      id: "team-media-labs",
      name: "Ishaan Verma",
      role: "Head of Media Labs",
      department: "Media",
      focus: "Content pipelines, templates",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop",
      highlight: "Leads clip factories for sponsors and partners across tracks.",
      href: "/teams/ishaan-verma",
      social: { linkedin: "https://linkedin.com/in/ishaanverma" },
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("teams");
    await col.updateOne({ key: "default" }, { $set: defaultTeam }, { upsert: true });
    console.log("Team seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
