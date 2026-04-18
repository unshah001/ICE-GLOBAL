import { getDb } from "../src/db/mongo";

const defaultReview = {
  key: "default",
  eyebrow: "What is ICE Exhibitions",
  title: "Infographics & Photos",
  description:
    "A quick visual walkthrough of the ICE Exhibitions universe—immersive entrances, grand stages, VR zones, and the community moments that define the brand.",
  ctaLabel: "Explore Full Gallery",
  ctaHref: "/gallery",
  images: [
    {
      src: "https://i.ibb.co/jkM5kJzP/iceinfog-CC2.png",
      href: "/gallery",
    },
    {
      src: "https://i.ibb.co/60sFxbb4/Warm-Blue-Exhibition-Poster-with-Parallelograms.png",
      href: "/gallery/ice-megaexpo-premium-shopping-exhibition",
    },
    {
      src: "https://i.ibb.co/fdT04szD/Interactive-Exhibition-Poster-with-Arrow-Panels-1.png",
      href: "/gallery/ice-megaexpo-international-consumer-exhibition",
    },
    {
      src: "https://i.ibb.co/B20jqdnp/Modern-Promotional-Poster-for-Exhibition-4.png",
      href: "/gallery/ice-megaexpo-shopping-exhibition-highlights",
    },
    {
      src: "https://i.ibb.co/5gWSK50N/Get-your-brand-to-experience-the.png",
      href: "/gallery/indias-biggest-shopping-exhibition",
    },
    {
      src: "https://i.ibb.co/LdddgPV2/iceinfog-CC4.png",
      href: "/gallery",
    },
  ],
};

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("review");
    await col.updateOne({ key: "default" }, { $set: defaultReview }, { upsert: true });
    console.log("Review seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
