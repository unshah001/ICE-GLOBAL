import { getDb } from "../src/db/mongo";

type Highlight = { title: string; body: string };
type Metric = { label: string; value: string };

type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  focus: string;
  image: string;
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: {
    headline?: string;
    summary?: string;
    heroImage?: string;
    highlights?: Highlight[];
    metrics?: Metric[];
    pullQuote?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

const team: TeamMember[] = [
  {
    id: "team-priya",
    name: "Priya Menon",
    role: "Head of Production",
    department: "Production",
    focus: "Stage ops, lighting, crew",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80",
    highlight: "Runs master show-calls and ops handoffs across cities.",
    href: "/teams/priya-menon",
    social: { linkedin: "https://linkedin.com/in/priya-menon" },
    detail: {
      headline: "Show-calls that keep the circuit on time",
      summary: "Built a playbook for stage ops, crew calls, and city handoffs.",
      heroImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Run-of-show", body: "Master show-calls aligned with XR, camera, and lighting cues." },
        { title: "City handoffs", body: "Handoff kits for every city to standardize ops." },
      ],
      metrics: [
        { label: "Cities", value: "10" },
        { label: "Shows led", value: "200+" },
      ],
      ctaLabel: "View ops profile",
      ctaHref: "/teams/priya-menon",
    },
  },
  {
    id: "team-kabir",
    name: "Kabir Shah",
    role: "CTO, Telemetry",
    department: "Technology",
    focus: "Infra, telemetry, automation",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=80",
    highlight: "Keeps XR and stages healthy with live dashboards and runbooks.",
    href: "/teams/kabir-shah",
    social: { linkedin: "https://linkedin.com/in/kabirshah" },
    detail: {
      headline: "Telemetry-first stage health",
      summary: "Live dashboards and automation reduce downtime across tracks.",
      heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Health checks", body: "Pre-flight checks on XR, audio, and cameras before each block." },
        { title: "Automation", body: "Alerting and runbooks that auto-resolve common incidents." },
      ],
      metrics: [
        { label: "Downtime", value: "-24%" },
        { label: "Incidents auto-resolved", value: "68%" },
      ],
    },
  },
  {
    id: "team-rhea",
    name: "Rhea Menon",
    role: "Experience & Hospitality",
    department: "Experience",
    focus: "Guest journey, lounges, service design",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80",
    highlight: "Designs lounges, wayfinding, and service scripts across venues.",
    href: "/teams/rhea-menon",
    social: { linkedin: "https://linkedin.com/in/rheamenon" },
    detail: {
      headline: "Hospitality as product",
      summary: "Lounge playbooks, signage, and service scripts that lift NPS.",
      heroImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Service scripts", body: "Unified host scripts across venues." },
        { title: "Wayfinding OS", body: "Signage + app routing reduce guest friction." },
      ],
      metrics: [
        { label: "NPS lift", value: "+18" },
        { label: "Avg dwell", value: "7.5h" },
      ],
    },
  },
  {
    id: "team-ishaan",
    name: "Ishaan Verma",
    role: "Head of Media Labs",
    department: "Media",
    focus: "Content pipelines, templates",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&auto=format&fit=crop&q=80",
    highlight: "Leads clip factories for sponsors and partners across tracks.",
    href: "/teams/ishaan-verma",
    social: { linkedin: "https://linkedin.com/in/ishaanverma" },
    detail: {
      headline: "Media labs at show pace",
      summary: "Template libraries and dual pipelines for IGE and IGN coverage.",
      heroImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80",
      highlights: [
        { title: "Template stack", body: "Lower-thirds, bumpers, and overlays baked for speed." },
        { title: "Dual pipelines", body: "Parallel streams for XR segments and partner coverage." },
      ],
      metrics: [
        { label: "Clips/day", value: "280" },
        { label: "Turnaround", value: "<12 min" },
      ],
    },
  },
  {
    id: "team-meera",
    name: "Meera Kulkarni",
    role: "Head of Ops, IGN",
    department: "Operations",
    focus: "Routing, lounges, partner ops",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80",
    highlight: "Designs routing for IGN to keep decision-makers in flow.",
    href: "/teams/meera-kulkarni",
    social: { linkedin: "https://linkedin.com/in/meerakulkarni" },
  },
  {
    id: "team-zoya",
    name: "Zoya Merchant",
    role: "Chief Experience Officer",
    department: "Experience",
    focus: "Experience, hospitality, service design",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&auto=format&fit=crop&q=80",
    highlight: "Merges IGE showcraft with IGN hospitality to lift NPS.",
    href: "/teams/zoya-merchant",
    social: { linkedin: "https://linkedin.com/in/zoyamerchant" },
  },
  {
    id: "team-data",
    name: "Arjun Nair",
    role: "Head of Data & Insights",
    department: "Data",
    focus: "Signals, routing, partner insights",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80",
    highlight: "Builds the intent graph that powers routing and partner performance.",
    href: "/teams/arjun-nair",
    social: { linkedin: "https://linkedin.com/in/arjun-nair" },
  },
  {
    id: "team-design",
    name: "Ritika Iyer",
    role: "Design Director",
    department: "Design",
    focus: "Visual systems, signage, UI",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80",
    highlight: "Owns visual system for signage, apps, and sponsor templates.",
    href: "/teams/ritika-iyer",
    social: { linkedin: "https://linkedin.com/in/ritika-iyer" },
  },
  {
    id: "team-creator",
    name: "Rohit Kumar",
    role: "Creator Ops Lead",
    department: "Media",
    focus: "Creators, live ops",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&auto=format&fit=crop&q=80",
    highlight: "Runs creator integrations and live handoffs for IGE.",
    href: "/teams/rohit-kumar",
    social: { linkedin: "https://linkedin.com/in/rohitkumar" },
  },
  {
    id: "team-growth",
    name: "Sanjay Shah",
    role: "Growth & Partnerships",
    department: "Growth",
    focus: "Sponsors, partners, city programs",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80",
    highlight: "Grows the hybrid network across cities and digital partners.",
    href: "/teams/sanjay-shah",
    social: { linkedin: "https://linkedin.com/in/sanjayshah" },
  },
  {
    id: "team-program",
    name: "Ritu Anand",
    role: "Programming Lead",
    department: "Programming",
    focus: "Schedules, drops, curation",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&auto=format&fit=crop&q=80",
    highlight: "Curates schedules and timed drops for buyer and partner lanes.",
    href: "/teams/ritu-anand",
    social: { linkedin: "https://linkedin.com/in/rituanand" },
  },
  {
    id: "team-support",
    name: "Aanya Singh",
    role: "Support & Helpdesk",
    department: "Support",
    focus: "Helpdesk, comms, guest recovery",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80",
    highlight: "Runs helpdesk and guest recovery playbooks during show days.",
    href: "/teams/aanya-singh",
    social: { linkedin: "https://linkedin.com/in/aanyasingh" },
  },
];

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection<TeamMember>("teams_list");
    await col.deleteMany({});
    const now = new Date();
    await col.insertMany(team.map((t) => ({ ...t, createdAt: now, updatedAt: now })));
    console.log(`Seeded ${team.length} team members.`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
