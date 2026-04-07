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
      thumbnail: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "VR Experience Zone",
      link: "/gallery",
      thumbnail: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Grand Entrance",
      link: "/gallery",
      thumbnail: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Innovation Booths",
      link: "/gallery",
      thumbnail: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Networking Lounge",
      link: "/gallery",
      thumbnail: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Night Arena",
      link: "/gallery",
      thumbnail: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&auto=format&fit=crop&q=80",
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
