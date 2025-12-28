import { getDb } from "../src/db/mongo";

type Seller = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  outcome: string;
  image: string;
  href?: string;
  detail?: {
    headline?: string;
    summary?: string;
    heroImage?: string;
    highlights?: { title: string; body: string }[];
    metrics?: { label: string; value: string }[];
    pullQuote?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

const sellers: Seller[] = [
  {
    id: "seller-1",
    name: "Priya Menon",
    role: "Founder",
    company: "Studio Meridian",
    quote: "We sold out inventory by day two—footfall stayed consistent because the booth schedule was choreographed for us.",
    outcome: "+42% repeat visits vs. last expo",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=800&fit=crop",
    href: "/stories/seller-1",
    detail: {
      headline: "Launch that sold out in two days",
      summary: "Choreographed booth schedule kept traffic steady while live demos converted.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Choreographed drops", body: "Every two hours we rotated demos; ICE production timed queues and lighting." },
        { title: "Conversion coaching", body: "Sales team rehearsed pitches on a mock booth with real-time feedback." },
      ],
      metrics: [
        { label: "Repeat visits", value: "+42%" },
        { label: "Inventory sold", value: "100%" },
      ],
      pullQuote: "It felt like a mini-launch every two hours.",
      ctaLabel: "See Priya's playbook",
      ctaHref: "/contact",
    },
  },
  {
    id: "seller-2",
    name: "Rajat Verma",
    role: "Director of Sales",
    company: "NovaCraft",
    quote: "Lead capture, live demos, and media hits happened in one lane. ICE made us feel like a headline act, not a booth number.",
    outcome: "210 meetings booked on-site",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    href: "/stories/seller-2",
    detail: {
      headline: "Headline act treatment",
      summary: "Lead capture and demos ran in a single lane; PR hits baked into the run-of-show.",
      heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Single-lane ops", body: "Demo, capture, and press lined up in one flow; no context switching." },
        { title: "Media baked in", body: "Press desk clipped soundbites on the spot with templated lower-thirds." },
      ],
      metrics: [
        { label: "Meetings booked", value: "210" },
        { label: "PR hits", value: "18" },
      ],
      pullQuote: "We felt like the headline, not a row number.",
      ctaLabel: "Book a headline lane",
      ctaHref: "/contact",
    },
  },
  {
    id: "seller-3",
    name: "Nisha Kapoor",
    role: "COO",
    company: "Arka Living",
    quote: "They coached our team on storytelling and timing. Every two-hour drop felt like a mini-launch.",
    outcome: "3.1x lift in qualified leads",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    href: "/stories/seller-3",
    detail: {
      headline: "Story-first drops",
      summary: "Story arcs mapped to drops; ops rehearsed timing to the beat.",
      heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Narrative beats", body: "Each drop had a hook, proof, and CTA rehearsed with lighting cues." },
        { title: "Ops discipline", body: "Clockwork timing reduced idle time and lifted qualified leads." },
      ],
      metrics: [
        { label: "Qualified leads", value: "3.1x" },
        { label: "Drops per day", value: "6" },
      ],
      pullQuote: "Every drop felt like a launch premiere.",
    },
  },
  {
    id: "seller-4",
    name: "Aditya Rao",
    role: "Head of Growth",
    company: "Lumio",
    quote: "The night programming kept decision-makers around. We closed deals at the lounge, not the booth.",
    outcome: "5 enterprise pilots signed",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop",
    href: "/stories/seller-4",
    detail: {
      headline: "Night deals, lounge wins",
      summary: "Night programming retained execs; lounge ops closed pilots off-booth.",
      heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Exec retention", body: "VIP routing kept decision-makers on-site through night sessions." },
        { title: "Deal lounge", body: "Dedicated lounge hosts prepped materials for quick sign-off." },
      ],
      metrics: [
        { label: "Pilots signed", value: "5" },
        { label: "Execs retained", value: "90%" },
      ],
      pullQuote: "We closed in the lounge, not in line.",
    },
  },
  {
    id: "seller-5",
    name: "Meera Shah",
    role: "CMO",
    company: "BrightPeak Solar",
    quote: "The solar runway turned into our best lead magnet—people lined up to see the live telemetry.",
    outcome: "1.6x demo-to-lead conversion",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&h=800&fit=crop",
    detail: {
      headline: "Solar runway with telemetry",
      summary: "Transparent displays showed live wattage; the CTA was baked into the experience.",
      heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Live dashboards", body: "Guests watched real-time output while staff guided signups." },
        { title: "Cooling comfort", body: "Misters and shade kept dwell times high in peak hours." },
      ],
      metrics: [
        { label: "Conversion", value: "1.6x" },
        { label: "Avg dwell", value: "7m+" },
      ],
      pullQuote: "Data plus comfort turned demos into signups.",
    },
  },
  {
    id: "seller-6",
    name: "Kabir Singh",
    role: "Founder",
    company: "Orbit Robotics",
    quote: "Kids and execs queued together; the hands-on robotics loop never felt empty.",
    outcome: "Sold 320 kits on-site",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
    detail: {
      headline: "Hands-on robotics loop",
      summary: "Short guided builds and sign-and-go kiosks kept the line moving.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Guided builds", body: "8-minute builds with mentors; every slot captured an email." },
        { title: "Auto checkout", body: "QR checkout tied to demo slot; no sales desk backlog." },
      ],
      metrics: [
        { label: "Kits sold", value: "320" },
        { label: "Wait time", value: "<5 min" },
      ],
    },
  },
  {
    id: "seller-7",
    name: "Esha Rao",
    role: "VP Marketing",
    company: "Northwind Mobility",
    quote: "The drone halo launch made our EV reveal feel premium and cinematic.",
    outcome: "2.2x test-drive signups",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    detail: {
      headline: "Drone halo EV reveal",
      summary: "Choreographed drones mirrored stage content; test drives booked on the spot.",
      heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Aerial sync", body: "Drones painted arcs in sync with on-stage visuals." },
        { title: "Drive lane ops", body: "Test-drive queue managed with SMS nudges." },
      ],
      metrics: [
        { label: "Test drives", value: "2.2x" },
        { label: "Press hits", value: "24" },
      ],
    },
  },
  {
    id: "seller-8",
    name: "Arjun Desai",
    role: "Head of Product",
    company: "Vertex AI",
    quote: "We shipped SDK signups straight from the lounge; dev rel never slept.",
    outcome: "1.4K SDK signups",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
    detail: {
      headline: "Developer lounge engine",
      summary: "Code-along pods plus QR handoffs turned dwell into signups.",
      heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Code pods", body: "Guided SDK walkthroughs in 15-minute slots." },
        { title: "QR handoffs", body: "One QR linked tutorials, repo, and office-hours booking." },
      ],
      metrics: [
        { label: "SDK signups", value: "1.4K" },
        { label: "Sessions", value: "86" },
      ],
    },
  },
  {
    id: "seller-9",
    name: "Sana Iqbal",
    role: "CEO",
    company: "Aether Labs",
    quote: "The immersive entry became our biggest PR moment.",
    outcome: "92% brand recall in post-show survey",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    detail: {
      headline: "Immersive entry moment",
      summary: "Kinetic light tunnel synced to story beats; press captured from marked POVs.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "POV markers", body: "Photo markers ensured consistent shots for PR." },
        { title: "Beat-mapped lights", body: "Lighting changed with each chapter cue." },
      ],
      metrics: [
        { label: "Brand recall", value: "92%" },
        { label: "Shares", value: "15K+" },
      ],
    },
  },
  {
    id: "seller-10",
    name: "Varun Pillai",
    role: "Founder",
    company: "Helios Energy",
    quote: "We signed pilots while guests watched the energy dashboard climb.",
    outcome: "3 pilot MOUs",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop",
    detail: {
      headline: "Energy lounge with live impact",
      summary: "Solar canopies powered the lounge; telemetry fed straight into sales talk tracks.",
      heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Live impact", body: "Guests saw carbon offset numbers refresh in real time." },
        { title: "Comfort-first", body: "Cooling + seating kept execs present for longer." },
      ],
      metrics: [
        { label: "Pilots", value: "3" },
        { label: "Energy generated", value: "1.8 MWh" },
      ],
    },
  },
  {
    id: "seller-11",
    name: "Rhea Nambiar",
    role: "Head of Ops",
    company: "Stellar Media",
    quote: "Hourly live hits from the floor made advertisers call us first.",
    outcome: "48 live segments",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    detail: {
      headline: "Broadcast booth in the aisle",
      summary: "Anchors went live hourly; remote feeds mirrored the floor energy.",
      heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Hourly rhythm", body: "Every hour a new segment; schedules posted on LED to drive crowd." },
        { title: "Remote sync", body: "Remote stages joined for crossovers, multiplying reach." },
      ],
      metrics: [
        { label: "Live hits", value: "48" },
        { label: "Remote stages", value: "6" },
      ],
    },
  },
  {
    id: "seller-12",
    name: "Ankit Jain",
    role: "Growth Lead",
    company: "PixelCraft",
    quote: "The reactive art wall turned visitors into creators—our lead forms felt fun.",
    outcome: "9.4K clips shared",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
    detail: {
      headline: "Visitors became the art",
      summary: "Motion-reactive wall captured 10s clips for instant sharing.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Body tracking", body: "Motion sensors turned gestures into color strokes." },
        { title: "Auto capture", body: "Clips auto-exported with our branding." },
      ],
      metrics: [
        { label: "Clips shared", value: "9.4K" },
        { label: "Avg session", value: "3m 20s" },
      ],
    },
  },
  {
    id: "seller-13",
    name: "Farah Qureshi",
    role: "Founder",
    company: "AquaBloom",
    quote: "The hydro demo lane felt like a zen lab—people stayed to learn.",
    outcome: "+35% dwell time",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=800&fit=crop",
    detail: {
      headline: "Calm hydro lab",
      summary: "Soft gradients, water soundscapes, and live plant walls calmed the lane.",
      heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Ambient calm", body: "Soundscapes reduced perceived wait." },
        { title: "Guided trials", body: "Clinicians walked people through water tech benefits." },
      ],
      metrics: [
        { label: "Dwell", value: "+35%" },
        { label: "Trials", value: "540" },
      ],
    },
  },
  {
    id: "seller-14",
    name: "Zara Merchant",
    role: "Head of Retail",
    company: "Craftory",
    quote: "Pop-up retail felt premium with staged drops and mobile checkout.",
    outcome: "18% lift in AOV",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    detail: {
      headline: "Premium retail lane",
      summary: "Staged product drops with instant mobile checkout flows.",
      heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Drop cadence", body: "Scheduled reveals drove repeat footfall." },
        { title: "Tap-to-buy", body: "Every display had NFC checkout links." },
      ],
      metrics: [
        { label: "AOV lift", value: "18%" },
        { label: "Sell-through", value: "92%" },
      ],
    },
  },
  {
    id: "seller-15",
    name: "Dev Khanna",
    role: "COO",
    company: "QuickMed",
    quote: "Clinic-inspired booth eased patient signups for trials.",
    outcome: "1.9K trial signups",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    detail: {
      headline: "Clinic calm, expo speed",
      summary: "Clinical UI, soft lighting, and nurses as guides reduced anxiety.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Nurse guides", body: "Nurses handled intake; sales stayed focused on value." },
        { title: "Soft design", body: "Calming palette and sound lowered friction." },
      ],
      metrics: [
        { label: "Trial signups", value: "1.9K" },
        { label: "Wait time", value: "4m" },
      ],
    },
  },
  {
    id: "seller-16",
    name: "Ishan Patel",
    role: "Growth",
    company: "Glide Mobility",
    quote: "Ride lane plus content studio made every test ride sharable.",
    outcome: "3.4x social reach",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
    detail: {
      headline: "Ride lane + content studio",
      summary: "Every ride ended with a clip; QR pulled riders into funnels.",
      heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Clip capture", body: "Auto-shot clips handed to riders in seconds." },
        { title: "Queue SMS", body: "SMS nudges reduced drop-offs in line." },
      ],
      metrics: [
        { label: "Reach", value: "3.4x" },
        { label: "Rides/day", value: "480" },
      ],
    },
  },
  {
    id: "seller-17",
    name: "Tanya Kulkarni",
    role: "Marketing Lead",
    company: "Lumen Audio",
    quote: "Listening pods with timed drops turned demos into playlists.",
    outcome: "11K playlist saves",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=800&fit=crop",
    detail: {
      headline: "Immersive listening pods",
      summary: "Pods with soundproofing, mood lighting, and timed playlist drops.",
      heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Timed drops", body: "Playlists released every hour to refresh traffic." },
        { title: "Ambient pods", body: "Soundproof pods reduced fatigue and boosted completion." },
      ],
      metrics: [
        { label: "Playlist saves", value: "11K" },
        { label: "Avg session", value: "6m" },
      ],
    },
  },
  {
    id: "seller-18",
    name: "Rohit Shetty",
    role: "CEO",
    company: "CivicGrid",
    quote: "Policy meets product worked—city officials stayed for the walkthroughs.",
    outcome: "36 pilot drafts",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop",
    detail: {
      headline: "City block in a booth",
      summary: "Mini city grid with AR overlays showed outcomes in minutes.",
      heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "AR overlays", body: "Policy outcomes visualized over a physical model." },
        { title: "Stakeholder rooms", body: "Private nooks to draft pilots on-site." },
      ],
      metrics: [
        { label: "Pilots drafted", value: "36" },
        { label: "Sessions", value: "75" },
      ],
    },
  },
  {
    id: "seller-19",
    name: "Shreya Malhotra",
    role: "CMO",
    company: "Bloom Foods",
    quote: "Tasting lane plus nutrition kiosk made sampling feel premium.",
    outcome: "2.8x sample-to-cart",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    detail: {
      headline: "Premium tasting lane",
      summary: "Guided tastings with nutrition overlays and instant ordering.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Guided tastings", body: "Hosts guided flavor notes and benefits." },
        { title: "Instant cart", body: "QR carts pre-loaded after tasting." },
      ],
      metrics: [
        { label: "Sample→cart", value: "2.8x" },
        { label: "Orders", value: "1.2K" },
      ],
    },
  },
  {
    id: "seller-20",
    name: "Manav Arora",
    role: "Founder",
    company: "Skyline Finance",
    quote: "AR wealth walkthroughs made finance feel understandable and welcoming.",
    outcome: "5.6K signups",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    detail: {
      headline: "Walkable finance",
      summary: "AR overlays and concierge hosts guided visitors through risk and reward.",
      heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "AR guidance", body: "Personalized overlays demystified portfolios." },
        { title: "Concierge hosts", body: "Warm lighting and hosts kept trust high." },
      ],
      metrics: [
        { label: "Signups", value: "5.6K" },
        { label: "Session time", value: "6m+" },
      ],
    },
  },
];

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection<Seller>("sellers_list");
    await col.deleteMany({});
    const now = new Date();
    await col.insertMany(sellers.map((s) => ({ ...s, createdAt: now, updatedAt: now })));
    console.log(`Seeded ${sellers.length} sellers.`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
