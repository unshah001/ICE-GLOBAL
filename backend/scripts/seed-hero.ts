import { getDb } from "../src/db/mongo";

const defaultHero = {
  key: "default",
  navItems: [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  heroContent: {
    title: "India's Biggest International Consumer Exhibition",
    subtitle: "Discover top global brands, live product demos, and exclusive expo deals all under one roof.",
    description: "30+ Years | 1000+ Brands | Millions of Visitors",
    ctaButtons: [
      { label: "Visit Expo", href: "/gallery" },
      { label: "Become Exhibitor", href: "/contact" },
    ],
  },
  heroProducts: [
    {
      title: "Main Stage 2024",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/60sFxbb4/Warm-Blue-Exhibition-Poster-with-Parallelograms.png",
    },
    {
      title: "VR Experience Zone",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/fdT04szD/Interactive-Exhibition-Poster-with-Arrow-Panels-1.png",
    },
    {
      title: "Grand Entrance",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/B20jqdnp/Modern-Promotional-Poster-for-Exhibition-4.png",
    },
    {
      title: "Innovation Booths",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/5gWSK50N/Get-your-brand-to-experience-the.png",
    },
    {
      title: "Networking Lounge",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/LdddgPV2/iceinfog-CC4.png",
    },
    {
      title: "Night Arena",
      link: "/gallery",
      thumbnail: "https://i.ibb.co/jkM5kJzP/iceinfog-CC2.png",
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("hero");
    await col.updateOne({ key: "default" }, { $set: defaultHero }, { upsert: true });
    console.log("Hero seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
