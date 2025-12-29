import heroExpo from "@/assets/hero-expo-1.jpg";
import expoVrZone from "@/assets/expo-vr-zone.jpg";
import expoAerial from "@/assets/expo-aerial.jpg";
import expoStage from "@/assets/expo-stage.jpg";
import expoBooth from "@/assets/expo-booth.jpg";
import expoEntrance from "@/assets/expo-entrance.jpg";

export const expoImages = {
  hero: heroExpo,
  vrZone: expoVrZone,
  aerial: expoAerial,
  stage: expoStage,
  booth: expoBooth,
  entrance: expoEntrance,
};

export const heroProducts = [
  { title: "Main Stage 2024", link: "/gallery", thumbnail: expoStage },
  { title: "VR Experience Zone", link: "/gallery", thumbnail: expoVrZone },
  { title: "Exhibition Hall", link: "/gallery", thumbnail: expoAerial },
  { title: "Grand Entrance", link: "/gallery", thumbnail: expoEntrance },
  { title: "Brand Showcase", link: "/gallery", thumbnail: expoBooth },
  { title: "Tech Innovation Hub", link: "/gallery", thumbnail: expoStage },
  { title: "Interactive Displays", link: "/gallery", thumbnail: expoVrZone },
  { title: "Crowd Experience", link: "/gallery", thumbnail: heroExpo },
  { title: "Partner Pavilion", link: "/gallery", thumbnail: expoAerial },
  { title: "Innovation Center", link: "/gallery", thumbnail: expoBooth },
  { title: "Night Event", link: "/gallery", thumbnail: expoEntrance },
  { title: "Main Arena", link: "/gallery", thumbnail: heroExpo },
  { title: "Workshop Zone", link: "/gallery", thumbnail: expoStage },
  { title: "Demo Area", link: "/gallery", thumbnail: expoVrZone },
  { title: "Networking Lounge", link: "/gallery", thumbnail: expoBooth },
];

export const timelineContent = [
  {
    title: "1994 — The First Arch",
    description:
      "ICE Exhibitions opens with a single city showcase and a landmark entrance arch that becomes the template for the next three decades.",
    image: expoEntrance,
  },
  {
    title: "2004 — Multi-city Momentum",
    description:
      "We expand to five cities, standardizing production playbooks for stages, lounges, and media pods to keep quality consistent everywhere.",
    image: expoAerial,
  },
  {
    title: "2014 — Digital Layer",
    description:
      "Hybrid kiosks and interactive displays debut; visitors navigate with digital wayfinding and on-site app drops.",
    image: expoVrZone,
  },
  {
    title: "2019 — Immersive Entrances",
    description:
      "Kinetic light tunnels and responsive arches set a new benchmark for arrival moments across all venues.",
    image: expoEntrance,
  },
  {
    title: "2022 — Hybrid at Scale",
    description:
      "Full hybrid broadcasts, press-ready assets, and CRM-linked lead capture become default; international brands join the circuit.",
    image: expoAerial,
  },
  {
    title: "2024 — Legacy in Motion",
    description:
      "10 cities, 10,000+ brands, 20M+ buyers later—ICE runs like a festival and performs like an enterprise-grade launch pad.",
    image: heroExpo,
  },
];

export const brandHighlights = [
  {
    slug: "techvision-labs",
    name: "TechVision Labs",
    logo: "TV",
    relationship: "3-Year Partner",
    category: "Technology",
    image: expoVrZone,
  },
  {
    slug: "innovatecorp",
    name: "InnovateCorp",
    logo: "IC",
    relationship: "Headline Sponsor",
    category: "Innovation",
    image: expoStage,
  },
  {
    slug: "futurebrand",
    name: "FutureBrand",
    logo: "FB",
    relationship: "5-Year Partner",
    category: "Branding",
    image: expoBooth,
  },
  {
    slug: "globaltech",
    name: "GlobalTech",
    logo: "GT",
    relationship: "Premium Partner",
    category: "Enterprise",
    image: expoAerial,
  },
];

export const brandStories: Record<
  string,
  {
    headline: string;
    summary: string;
    heroImage: string;
    highlights: { title: string; body: string }[];
    metrics: { label: string; value: string }[];
    pullQuote: string;
  }
> = {
  "techvision-labs": {
    headline: "Spatial-first product launches that stole the show",
    summary:
      "TechVision Labs used our expo to debut their mixed reality stack, staging synchronized demos that turned a technical feature set into an immersive story.",
    heroImage: expoVrZone,
    highlights: [
      {
        title: "Live spatial lab",
        body: "We built a VR alley with guided routes and haptics. Their team orchestrated 20 live walkthroughs per hour without breaking presence.",
      },
      {
        title: "Data-backed buzz",
        body: "Heatmaps showed dwell times up 42% versus last year. Social mentions spiked within the first three hours of opening.",
      },
      {
        title: "Community runway",
        body: "Makerspace sessions let devs prototype with TechVision’s SDK on-site, seeding a developer community before the official launch.",
      },
    ],
    metrics: [
      { label: "Live demos", value: "600+" },
      { label: "Avg. dwell time", value: "7m 10s" },
      { label: "SDK signups", value: "1.8K" },
    ],
    pullQuote: "“The expo made our launch feel like a blockbuster premiere rather than a product demo.”",
  },
  innovatecorp: {
    headline: "A headline sponsor with a cinematic keynote",
    summary:
      "InnovateCorp took over the main stage with a narrative-driven keynote that blended live orchestra cues, holograms, and audience participation.",
    heroImage: expoStage,
    highlights: [
      {
        title: "Scripted for emotion",
        body: "We co-wrote story beats that aligned to live lighting cues. Audience sentiment peaked on every product reveal chord.",
      },
      {
        title: "Participation moments",
        body: "Interactive wristbands pulsed in sync with stage lighting so the crowd became part of the show.",
      },
      {
        title: "Press-ready assets",
        body: "Editors got real-time stills and lower-third templates, cutting turnaround to minutes post-keynote.",
      },
    ],
    metrics: [
      { label: "Live viewers", value: "30K" },
      { label: "PR hits", value: "120+" },
      { label: "Engagement", value: "2.4x" },
    ],
    pullQuote: "“Production quality matched our biggest global shows—without the usual chaos.”",
  },
  futurebrand: {
    headline: "Building a signature entry experience",
    summary:
      "FutureBrand’s kinetic entrance tunnel became the most shared visual of the expo, turning first impressions into shareable content.",
    heroImage: expoEntrance,
    highlights: [
      {
        title: "Adaptive lighting",
        body: "Sensors tracked movement density and shifted gradients in real time, giving every wave of visitors a unique look.",
      },
      {
        title: "Shareability by design",
        body: "We marked photo vantage points with subtle cues. The resulting shots filled feeds all weekend.",
      },
      {
        title: "Low-lift ops",
        body: "Pre-programmed sequences let the brand trigger campaigns on the fly without touching a lighting desk.",
      },
    ],
    metrics: [
      { label: "Social shares", value: "15K+" },
      { label: "Avg. entry time", value: "3m" },
      { label: "Brand recall", value: "92%" },
    ],
    pullQuote: "“Guests pulled phones out the moment they stepped in—that’s priceless attention.”",
  },
  globaltech: {
    headline: "Turning enterprise demos into festival moments",
    summary:
      "GlobalTech transformed complex enterprise solutions into festival-friendly experiences with lounge seating and live guided tours.",
    heroImage: expoAerial,
    highlights: [
      {
        title: "Guided walkthroughs",
        body: "We ran scheduled tours every 20 minutes, pairing solution architects with hosts to keep it punchy and human.",
      },
      {
        title: "Evening lounge",
        body: "After dark, the booth morphed into a lounge with ambient sets—keeping decision-makers on-site past 10 PM.",
      },
      {
        title: "Follow-up pipeline",
        body: "Leads fed directly into a CRM kiosk; SDRs booked 210 meetings before the expo closed.",
      },
    ],
    metrics: [
      { label: "Tours hosted", value: "150+" },
      { label: "Meetings booked", value: "210" },
      { label: "Avg. session rating", value: "4.8/5" },
    ],
    pullQuote: "“Prospects finally understood our platform without a slide deck.”",
  },
};

export const testimonials = [
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    name: "Blake Sterling",
    role: "Marketing Director",
    company: "TechVision Labs",
    rating: 5,
  },
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    name: "Sarah Chen",
    role: "CEO",
    company: "InnovateCorp",
    rating: 5,
  },
  {
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
    name: "Marcus Johnson",
    role: "Brand Manager",
    company: "FutureBrand",
    rating: 5,
  },
  {
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    name: "Emily Rodriguez",
    role: "VP Marketing",
    company: "GlobalTech",
    rating: 4,
  },
  {
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop",
    name: "David Kim",
    role: "Founder",
    company: "StartupX",
    rating: 5,
  },
];

export const stats = [
  { value: 10, suffix: "+", label: "Years of Expos" },
  { value: 1000, suffix: "+", label: "Curated Images" },
  { value: 500, suffix: "+", label: "Exhibitors" },
  { value: 100, suffix: "K+", label: "Visitors" },
];

export const galleryImages = [
  expoStage,
  expoVrZone,
  expoAerial,
  expoEntrance,
  expoBooth,
  heroExpo,
  expoStage,
  expoVrZone,
  expoAerial,
];

export const navItems = [
  { name: "Home", href: "/" },
  { name: "Gallery", href: "/gallery" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];
