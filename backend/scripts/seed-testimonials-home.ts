import { getDb } from "../src/db/mongo";

/**
 * Seeds the home-page testimonials block used by the testimonials editor (/testimonials API).
 * Run with:  tsx scripts/seed-testimonials-home.ts
 */
const seed = {
  key: "default",
  hero: {
    badge: "Testimonials",
    title: "What our partners say",
    intro: "Snapshots from brands, buyers, and founders who have built on ICE.",
    ctaLabel: "Send feedback",
    ctaHref: "/feedback",
  },
  testimonials: [
    {
      id: "t-ignite",
      name: "Ananya Patel",
      role: "Founder",
      company: "Ignite Labs",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      quote: "ICE gave us a launch runway with broadcast-quality stages and fast lead capture.",
    },
    {
      id: "t-northstar",
      name: "Rohit Desai",
      role: "CMO",
      company: "Northstar",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      quote: "We closed marquee buyers because of the curated walk-throughs and live demos.",
    },
    {
      id: "t-buyer",
      name: "Meera Joshi",
      role: "Head of Buyer Programs",
      company: "ICE",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
      rating: 4,
      quote: "Routes, lounges, and media drops kept our buyers engaged through every edition.",
    },
    {
      id: "t-investor",
      name: "Kabir Shah",
      role: "Investor",
      company: "Helix Capital",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      quote: "The deal flow and stage craft here are unmatched for consumer launches.",
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("testimonials");
    await col.updateOne({ key: "default" }, { $set: seed }, { upsert: true });
    console.log("Testimonials home block seeded.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
