// import { getDb } from "../src/db/mongo";

// type Highlight = { title: string; body: string };
// type Metric = { label: string; value: string };

// type Brand = {
//   slug: string;
//   name: string;
//   logo: string;
//   relationship: string;
//   category: string;
//   image: string;
//   summary?: string;
//   detail?: {
//     headline?: string;
//     summary?: string;
//     heroImage?: string;
//     highlights?: Highlight[];
//     metrics?: Metric[];
//     pullQuote?: string;
//   };
//   createdAt?: Date;
//   updatedAt?: Date;
// };

// export const brands: Brand[] = [
//   {
//     slug: "techvision-labs",
//     name: "TechVision Labs",
//     logo: "TV",
//     relationship: "3-Year Partner",
//     category: "Technology",
//     image: "https://i.ibb.co/4Zmh1Tvk/ICE-Top-Brands-06.png",
//     summary: "Spatial-first launches that felt like a blockbuster premiere.",
//     detail: {
//       headline: "Spatial launches that stole the show",
//       summary: "Mixed reality demos scripted with light cues and live orchestra beats.",
//       heroImage: "https://i.ibb.co/4Zmh1Tvk/ICE-Top-Brands-06.png",
//       highlights: [
//         { title: "Live spatial lab", body: "VR alleys with haptics ran 20 guided walkthroughs per hour." },
//         { title: "Data-backed buzz", body: "Dwell times up 42% YoY; social mentions spiked in first 3 hours." },
//       ],
//       metrics: [
//         { label: "Live demos", value: "600+" },
//         { label: "SDK signups", value: "1.8K" },
//       ],
//       pullQuote: "The launch felt like a premiere, not a product demo.",
//     },
//   },
//   {
//     slug: "innovatecorp",
//     name: "InnovateCorp",
//     logo: "IC",
//     relationship: "Headline Sponsor",
//     category: "Innovation",
//     image: "https://i.ibb.co/3YvDyJFm/ICE-Top-Brands-05.png",
//     summary: "Cinematic keynote with orchestra cues and holograms.",
//     detail: {
//       headline: "Cinematic headline keynote",
//       summary: "Story beats aligned to lighting cues with audience participation wristbands.",
//       heroImage: "https://i.ibb.co/3YvDyJFm/ICE-Top-Brands-05.png",
//       highlights: [
//         { title: "Scripted for emotion", body: "Lighting and music synced to every reveal chord." },
//         { title: "Participation moments", body: "Interactive wristbands pulsed in sync with stage lighting." },
//       ],
//       metrics: [
//         { label: "Live viewers", value: "30K" },
//         { label: "PR hits", value: "120+" },
//       ],
//       pullQuote: "Production matched our biggest global shows without chaos.",
//     },
//   },
//   {
//     slug: "futurebrand",
//     name: "FutureBrand",
//     logo: "FB",
//     relationship: "5-Year Partner",
//     category: "Branding",
//     image: "https://i.ibb.co/5xxf2d6Y/ICE-Top-Brands-07.png",
//     summary: "Signature kinetic entrance tunnel that dominated social feeds.",
//     detail: {
//       headline: "Signature entry experience",
//       summary: "Adaptive lighting and shareable vantage points turned arrivals into content.",
//       heroImage: "https://i.ibb.co/5xxf2d6Y/ICE-Top-Brands-07.png",
//       highlights: [
//         { title: "Adaptive lighting", body: "Sensors drove gradient ripples across 3,000 LEDs." },
//         { title: "Shareability by design", body: "Marked photo vantage points multiplied social reach." },
//       ],
//       metrics: [
//         { label: "Social shares", value: "15K+" },
//         { label: "Brand recall", value: "92%" },
//       ],
//       pullQuote: "Guests pulled phones out the moment they stepped in.",
//     },
//   },
//   {
//     slug: "globaltech",
//     name: "GlobalTech",
//     logo: "GT",
//     relationship: "Premium Partner",
//     category: "Enterprise",
//     image: "https://i.ibb.co/jS6SBDs/ICE-Top-Brands-03.png",
//     summary: "Enterprise demos turned into festival moments with hybrid streaming.",
//     detail: {
//       headline: "Festival-grade enterprise demos",
//       summary: "Hybrid demos with lounge seating and instant media handoffs.",
//       heroImage: "https://i.ibb.co/jS6SBDs/ICE-Top-Brands-03.png",
//       highlights: [
//         { title: "Hybrid lounge", body: "Tiered lounges plus remote streams balanced intimacy and reach." },
//         { title: "Press-ready", body: "Editors got lower thirds and stills in minutes post-keynote." },
//       ],
//       metrics: [
//         { label: "Engagement", value: "2.4x" },
//         { label: "Media turnaround", value: "Minutes" },
//       ],
//       pullQuote: "Felt like a festival, performed like an enterprise launch.",
//     },
//   },
//   {
//     slug: "northwind",
//     name: "Northwind Mobility",
//     logo: "NM",
//     relationship: "Launch Partner",
//     category: "Automotive",
//     image: "https://i.ibb.co/DDVMY5db/ICE-Top-Brands-027.png",
//     summary: "EV concept reveal with synchronized drone swarm visuals.",
//     detail: {
//       headline: "EV reveal with a drone halo",
//       summary: "Choreographed drones painted motion graphics above the main stage.",
//       heroImage: "https://i.ibb.co/DDVMY5db/ICE-Top-Brands-027.png",
//       highlights: [
//         { title: "Aerial storytelling", body: "Drone swarm mirrored the on-stage 3D renders live." },
//         { title: "Charging alley", body: "Interactive charging pods let guests test the UX hands-on." },
//       ],
//       metrics: [
//         { label: "Orders", value: "3.1K" },
//         { label: "Waitlist", value: "22K" },
//       ],
//       pullQuote: "The sky became part of the product story.",
//     },
//   },
//   {
//     slug: "aurora-health",
//     name: "Aurora Health",
//     logo: "AH",
//     relationship: "Innovation Track",
//     category: "Healthcare",
//     image: "https://i.ibb.co/s9G38xvV/ICE-Top-Brands-04.png",
//     summary: "Clinician-led demos with calm, clinic-inspired set design.",
//     detail: {
//       headline: "Human-first health tech demos",
//       summary: "Set design mirrored a calm clinic, with hands-on biometric kiosks.",
//       heroImage: "https://i.ibb.co/s9G38xvV/ICE-Top-Brands-04.png",
//       highlights: [
//         { title: "Guided trials", body: "Clinicians led 1:1 demos to reduce tech intimidation." },
//         { title: "Ambient calm", body: "Soft gradients and soundscapes lowered perceived wait times." },
//       ],
//       metrics: [
//         { label: "Avg dwell", value: "8m 10s" },
//         { label: "Trial signups", value: "4.2K" },
//       ],
//       pullQuote: "It felt like care, not a trade show booth.",
//     },
//   },
//   {
//     slug: "helios-energy",
//     name: "Helios Energy",
//     logo: "HE",
//     relationship: "Sustainability Partner",
//     category: "Energy",
//     image: "https://i.ibb.co/3YvDyJFm/ICE-Top-Brands-05.png",
//     summary: "Solar canopies with live yield dashboards and shaded lounges.",
//     detail: {
//       headline: "Solar runway with live telemetry",
//       summary: "Canopies powered the lounge and streamed live yield data to guests.",
//       heroImage: "https://i.ibb.co/3YvDyJFm/ICE-Top-Brands-05.png",
//       highlights: [
//         { title: "Live data", body: "Transparent displays showed realtime wattage and carbon offset." },
//         { title: "Shaded comfort", body: "Cooling misters and seating kept dwell times high." },
//       ],
//       metrics: [
//         { label: "Energy generated", value: "1.8 MWh" },
//         { label: "Carbon offset", value: "2.1T" },
//       ],
//       pullQuote: "Sustainability was felt, not just spoken.",
//     },
//   },
//   {
//     slug: "pixelcraft",
//     name: "PixelCraft",
//     logo: "PX",
//     relationship: "Design Partner",
//     category: "Creative",
//     image: "https://i.ibb.co/jS6SBDs/ICE-Top-Brands-03.png",
//     summary: "Interactive art wall with motion-reactive gradients.",
//     detail: {
//       headline: "Reactive art wall",
//       summary: "Motion sensors and projection mapping turned visitors into brush strokes.",
//       heroImage: "https://i.ibb.co/jS6SBDs/ICE-Top-Brands-03.png",
//       highlights: [
//         { title: "Visitor-powered", body: "Body tracking generated brush strokes in real time." },
//         { title: "Shareable loops", body: "Auto-captured 10s clips for social sharing." },
//       ],
//       metrics: [
//         { label: "Clips shared", value: "9.4K" },
//         { label: "Avg session", value: "3m 20s" },
//       ],
//       pullQuote: "Guests became the art.",
//     },
//   },
//   {
//     slug: "skyline-finance",
//     name: "Skyline Finance",
//     logo: "SF",
//     relationship: "FinTech Pavilion",
//     category: "Finance",
//     image: "https://i.ibb.co/5xxf2d6Y/ICE-Top-Brands-07.png",
//     summary: "Immersive fintech pavilion with AR wealth simulations.",
//     detail: {
//       headline: "Fintech you can walk through",
//       summary: "AR overlays walked buyers through portfolios and risk in 3D.",
//       heroImage: "https://i.ibb.co/5xxf2d6Y/ICE-Top-Brands-07.png",
//       highlights: [
//         { title: "AR guidance", body: "Personalized overlays guided decisions in under 2 minutes." },
//         { title: "Trust by design", body: "Warm lighting and concierge hosts softened complexity." },
//       ],
//       metrics: [
//         { label: "Signups", value: "5.6K" },
//         { label: "Session time", value: "6m+" },
//       ],
//       pullQuote: "Finance felt understandable and welcoming.",
//     },
//   },
//   {
//     slug: "vertex-ai",
//     name: "Vertex AI",
//     logo: "VA",
//     relationship: "AI Partner",
//     category: "Artificial Intelligence",
//     image: "https://i.ibb.co/DDVMY5db/ICE-Top-Brands-027.png",
//     summary: "Live AI co-creation labs with guided prompts and demos.",
//     detail: {
//       headline: "AI co-creation labs",
//       summary: "Guests tried prompt recipes on large screens with facilitators.",
//       heroImage: "https://i.ibb.co/DDVMY5db/ICE-Top-Brands-027.png",
//       highlights: [
//         { title: "Guided prompts", body: "Facilitators helped craft prompts for design, code, and ops." },
//         { title: "Responsible AI", body: "Safety patterns and guardrails explained alongside demos." },
//       ],
//       metrics: [
//         { label: "Sessions", value: "1.1K" },
//         { label: "Avg output time", value: "90s" },
//       ],
//       pullQuote: "People left with working prompts, not just theory.",
//     },
//   },
//   {
//     slug: "harbor-logistics",
//     name: "Harbor Logistics",
//     logo: "HL",
//     relationship: "Ops Partner",
//     category: "Logistics",
//     image: "https://i.ibb.co/4Zmh1Tvk/ICE-Top-Brands-06.png",
//     summary: "Live control room for supply chain visualizations.",
//     detail: {
//       headline: "Ops control room on the floor",
//       summary: "Digital twins and live routing screens showed same-day optimizations.",
//       heroImage: "https://i.ibb.co/4Zmh1Tvk/ICE-Top-Brands-06.png",
//       highlights: [
//         { title: "Digital twin", body: "Realtime routes and loads displayed like a newsroom." },
//         { title: "Operator Q&A", body: "Ops leads answered live questions with data on screen." },
//       ],
//       metrics: [
//         { label: "Route optimizations", value: "180+" },
//         { label: "Avg dwell", value: "7m" },
//       ],
//       pullQuote: "Ops was finally visible to the C-suite.",
//     },
//   },
//   {
//     slug: "atlas-cloud",
//     name: "Atlas Cloud",
//     logo: "AC",
//     relationship: "Cloud Partner",
//     category: "Cloud",
//     image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
//     summary: "Hands-on labs with portable data centers and edge demos.",
//     detail: {
//       headline: "Edge to cloud, hands-on",
//       summary: "Portable racks and edge demos let teams deploy in minutes on-site.",
//       heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Portable racks", body: "Guests racked and stacked minis to see edge setups live." },
//         { title: "Observability wall", body: "Dashboards showed latency and failover in real time." },
//       ],
//       metrics: [
//         { label: "Lab completions", value: "2.4K" },
//         { label: "Failover demos", value: "150" },
//       ],
//       pullQuote: "Hands-on made cloud tangible.",
//     },
//   },
//   {
//     slug: "lumen-creative",
//     name: "Lumen Creative",
//     logo: "LC",
//     relationship: "Experience Partner",
//     category: "Creative",
//     image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
//     summary: "Lighting and scenography partner for immersive sets.",
//     detail: {
//       headline: "Lighting that paints stories",
//       summary: "Custom gradients and kinetic rigs tailored to each keynote narrative.",
//       heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Kinetic rigs", body: "Rigging pre-programmed to story beats reduced tech risk." },
//         { title: "Gradient palettes", body: "Signature looks matched each brand’s identity." },
//       ],
//       metrics: [
//         { label: "Shows lit", value: "90+" },
//         { label: "Cue accuracy", value: "99.8%" },
//       ],
//       pullQuote: "We painted with light, not just illuminated.",
//     },
//   },
//   {
//     slug: "pulse-audio",
//     name: "Pulse Audio",
//     logo: "PA",
//     relationship: "Sound Partner",
//     category: "Audio",
//     image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop&q=80",
//     summary: "Spatial audio partner for immersive zones and keynotes.",
//     detail: {
//       headline: "Sound you can move through",
//       summary: "Spatial beds and live mixing wrapped guests without overpowering talks.",
//       heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Spatial beds", body: "Multi-channel mixes adapted to room density in real time." },
//         { title: "Clarity-first", body: "Dialogue remained crisp even during musical swells." },
//       ],
//       metrics: [
//         { label: "Zones tuned", value: "40+" },
//         { label: "Avg SPL", value: "Comfortable" },
//       ],
//       pullQuote: "Immersion without fatigue.",
//     },
//   },
//   {
//     slug: "civic-media",
//     name: "Civic Media",
//     logo: "CM",
//     relationship: "Media Partner",
//     category: "Media",
//     image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
//     summary: "Live press studio with instant lower thirds and remote feeds.",
//     detail: {
//       headline: "Newsroom on-site",
//       summary: "Editors cut reels in real time; remote feeds piped to global desks.",
//       heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Instant graphics", body: "Lower-thirds templates made edits lightning fast." },
//         { title: "Remote desks", body: "Satellite kits sent clean feeds to newsrooms worldwide." },
//       ],
//       metrics: [
//         { label: "Clips delivered", value: "1,200" },
//         { label: "Global reach", value: "42 countries" },
//       ],
//       pullQuote: "Press could publish in minutes, not hours.",
//     },
//   },
//   {
//     slug: "spectrum-networks",
//     name: "Spectrum Networks",
//     logo: "SN",
//     relationship: "Connectivity Partner",
//     category: "Networks",
//     image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
//     summary: "Fiber + private 5G rollout with live uptime dashboards.",
//     detail: {
//       headline: "Connectivity as a showpiece",
//       summary: "Uptime dashboards and speed tests were part of the visitor journey.",
//       heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Private 5G", body: "Pop-up 5G kept demos smooth and telemetry flowing." },
//         { title: "Observable uptime", body: "Visitors saw live latency and throughput stats." },
//       ],
//       metrics: [
//         { label: "Uptime", value: "99.99%" },
//         { label: "Avg throughput", value: "1.2 Gbps" },
//       ],
//       pullQuote: "Network became a feature, not a risk.",
//     },
//   },
//   {
//     slug: "evergreen-foods",
//     name: "Evergreen Foods",
//     logo: "EF",
//     relationship: "Culinary Partner",
//     category: "Food",
//     image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
//     summary: "Farm-to-table tasting lane with rotating chefs.",
//     detail: {
//       headline: "Tasting lane that kept crowds",
//       summary: "Rotating chefs every 3 hours with pairings tied to partner booths.",
//       heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Rotation rhythm", body: "Kept discovery high and lines moving." },
//         { title: "Pairings", body: "Snacks matched nearby demos to cross-pollinate traffic." },
//       ],
//       metrics: [
//         { label: "Tastings served", value: "18K" },
//         { label: "Avg wait", value: "4m" },
//       ],
//       pullQuote: "Guests came back between sessions just to taste.",
//     },
//   },
//   {
//     slug: "arcade-sports",
//     name: "Arcade Sports",
//     logo: "AS",
//     relationship: "Entertainment Partner",
//     category: "Sports",
//     image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
//     summary: "Interactive sports arcade with motion tracking.",
//     detail: {
//       headline: "Sports arcade with motion capture",
//       summary: "Guests competed on leaderboards powered by motion tracking.",
//       heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Leaderboards", body: "Live rankings kept dwell and repeat visits high." },
//         { title: "Safe motion", body: "Calibrated zones minimized fatigue and collisions." },
//       ],
//       metrics: [
//         { label: "Players", value: "9.8K" },
//         { label: "Repeat plays", value: "2.1x" },
//       ],
//       pullQuote: "Competition made the brand unforgettable.",
//     },
//   },
//   {
//     slug: "zenith-hospitality",
//     name: "Zenith Hospitality",
//     logo: "ZH",
//     relationship: "Hospitality Partner",
//     category: "Hospitality",
//     image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
//     summary: "Executive lounges and concierge routing for VIPs.",
//     detail: {
//       headline: "VIP flow without friction",
//       summary: "Concierge hosts routed VIPs through curated paths and private lounges.",
//       heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Private pods", body: "Acoustic pods for quick meetings and resets." },
//         { title: "Routing", body: "Concierge routes minimized time-in-transit for VIPs." },
//       ],
//       metrics: [
//         { label: "VIP sessions", value: "420" },
//         { label: "NPS", value: "92" },
//       ],
//       pullQuote: "VIPs flowed without ever feeling managed.",
//     },
//   },
//   {
//     slug: "metro-public",
//     name: "Metro Public",
//     logo: "MP",
//     relationship: "Public Sector Partner",
//     category: "Public Sector",
//     image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&auto=format&fit=crop&q=80",
//     summary: "Civic pavilion showcasing smart city stacks.",
//     detail: {
//       headline: "Smart city in a pavilion",
//       summary: "Digital twins and IoT street nodes recreated a smart block on-site.",
//       heroImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "IoT street", body: "Live sensors fed dashboards visitors could tweak." },
//         { title: "Civic co-lab", body: "Policy makers and vendors co-designed micro pilots." },
//       ],
//       metrics: [
//         { label: "Pilots drafted", value: "36" },
//         { label: "Stakeholder sessions", value: "75" },
//       ],
//       pullQuote: "Policy met product in one walkable block.",
//     },
//   },
//   {
//     slug: "stellar-media",
//     name: "Stellar Media",
//     logo: "SM",
//     relationship: "Broadcast Partner",
//     category: "Media",
//     image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&auto=format&fit=crop&q=80",
//     summary: "Broadcast booth with live anchors and remote feeds.",
//     detail: {
//       headline: "Broadcast in the heart of the floor",
//       summary: "Anchors went live hourly; feeds simulcast to digital audiences.",
//       heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop&q=80",
//       highlights: [
//         { title: "Hourly hits", body: "Anchors hit live segments every hour on the hour." },
//         { title: "Remote sync", body: "Live feeds piped to remote stages for cross-over moments." },
//       ],
//       metrics: [
//         { label: "Live segments", value: "48" },
//         { label: "Remote stages", value: "6" },
//       ],
//       pullQuote: "Our floor became the broadcast set.",
//     },
//   },
// ];
// const run = async () => {
//   try {
//     const db = await getDb();

//     // Seed brands collection
//     const col = db.collection<Brand>("brands");
//     await col.deleteMany({});
//     const now = new Date();
//     const normalized = brands.map((b) => {
//       const detail = b.detail || {};
//       const impactDescription = (detail as any).impactDescription || detail.summary || b.summary || "";
//       return {
//         ...b,
//         detail: {
//           ...detail,
//           impactDescription,
//           ctaLabel: (detail as any).ctaLabel || "Plan a showcase with us",
//           ctaHref: (detail as any).ctaHref || "/contact",
//         },
//         createdAt: now,
//         updatedAt: now,
//       };
//     });
//     await col.insertMany(normalized);
//     console.log(`Seeded ${brands.length} brands.`);

//     // Seed brands_highlights collection
//     const highlightsCol = db.collection("brands_highlights");
//     await highlightsCol.deleteMany({ key: "default" });
//     await highlightsCol.insertOne({
//       key: "default",
//       eyebrow: "Our Partners",
//       title: "Trusted by Industry Leaders",
//       description: "From startups to Fortune 500 companies, our expo has been the launchpad for brands that shape the future.",
//       ctaLabel: "View all partner brands",
//       ctaHref: "/brands",
//       brands: normalized.slice(0, 4).map((b) => ({
//         slug: b.slug,
//         name: b.name,
//         logo: b.logo,
//         relationship: b.relationship,
//         category: b.category,
//         image: b.image,
//       })),
//     });
//     console.log("Seeded brands_highlights with 4 brands.");

//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   } finally {
//     process.exit(0);
//   }
// };

// run();


