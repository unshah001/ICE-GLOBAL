import { getDb } from "../src/db/mongo";

const defaultArches = {
  key: "default",
  eyebrow: "Review the moment",
  title: "Mega Entrance Arches across 10 cities",
  description: "Three decades of arches engineered for arrivals—kinetic light tunnels, climate-smart canopies, and city-inspired silhouettes.",
  ctaLabel: "View entrance arches",
  ctaHref: "/gallery#arches",
  arches: [
    {
      city: "Mumbai",
      year: "1994",
      highlight: "The very first arch—set the silhouette that defined ICE.",
      image: "https://images.unsplash.com/photo-1473951574080-01fe45ec8643?w=900&h=700&fit=crop",
      href: "/gallery/mumbai-arch",
    },
    {
      city: "Delhi",
      year: "1998",
      highlight: "LED fascia debuted, drawing crowds from the metro station.",
      image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=900&h=700&fit=crop",
      href: "/gallery/delhi-arch",
    },
    {
      city: "Bengaluru",
      year: "2004",
      highlight: "First dual-lane entry to handle tech summit traffic.",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900&h=700&fit=crop",
      href: "/gallery/bengaluru-arch",
    },
    {
      city: "Hyderabad",
      year: "2008",
      highlight: "Audio-reactive lights synced with opening night sets.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&h=700&fit=crop",
      href: "/gallery/hyderabad-arch",
    },
    {
      city: "Chennai",
      year: "2012",
      highlight: "Climate-smart canopies for monsoon season launches.",
      image: "https://images.unsplash.com/photo-1418431163163-73743707d86a?w=900&h=700&fit=crop",
      href: "/gallery/chennai-arch",
    },
    {
      city: "Kolkata",
      year: "2014",
      highlight: "Art deco motifs inspired by the city’s heritage districts.",
      image: "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=900&h=700&fit=crop",
      href: "/gallery/kolkata-arch",
    },
    {
      city: "Ahmedabad",
      year: "2016",
      highlight: "Solar-lit arches powering signage and welcome pods.",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900&h=700&fit=crop",
      href: "/gallery/ahmedabad-arch",
    },
    {
      city: "Pune",
      year: "2018",
      highlight: "Immersive fog + light corridor designed for selfies.",
      image: "https://images.unsplash.com/photo-1475543403517-58a5ffcd1cf5?w=900&h=700&fit=crop",
      href: "/gallery/pune-arch",
    },
    {
      city: "Jaipur",
      year: "2021",
      highlight: "Jaali-inspired patterns with projection-mapped textures.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&h=700&fit=crop",
      href: "/gallery/jaipur-arch",
    },
    {
      city: "Goa",
      year: "2024",
      highlight: "Sunset-ready arch with gradient sails for beachside edition.",
      image: "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=900&h=700&fit=crop",
      href: "/gallery/goa-arch",
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("arches");
    await col.updateOne({ key: "default" }, { $set: defaultArches }, { upsert: true });
    console.log("Entrance arches seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
