import { expoImages } from "./expo-data";

export interface GalleryComment {
  id: string;
  author: string;
  message: string;
  date: string;
}

export interface GalleryArticleSection {
  heading: string;
  body: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  year: string;
  category: string;
  brand: string;
  image: string;
  variants?: { key: string; path: string; fileName?: string; format?: string }[];
  excerpt: string;
  article: GalleryArticleSection[];
  likes: number;
  comments: GalleryComment[];
  tags: string[];
}

export const galleryItems: GalleryItem[] = [
  {
    id: "main-stage-2024",
    title: "Main Stage 2024",
    year: "2024",
    category: "Stage",
    brand: "ICEGLOBAL",
    image: expoImages.stage,
    excerpt:
      "A cinematic keynote that combined holograms, laser choreography, and a live orchestra to set the tone for the expo.",
    article: [
      {
        heading: "Immersive Production",
        body: "We built a 270-degree projection surface and layered volumetric lighting to make every keynote feel alive. Speakers rehearsed inside a virtual mock so cues, lighting, and sound landed in sync.",
      },
      {
        heading: "Audience Energy",
        body: "Over 12,000 attendees packed the arena. The lighting chased the beat of the music, and the crowd response created a feedback loop that pushed the presenters to deliver their best.",
      },
    ],
    likes: 428,
    comments: [
      {
        id: "c1",
        author: "Aarav",
        message: "The lighting design was next-level. Felt like a stadium concert.",
        date: "2024-03-14",
      },
      {
        id: "c2",
        author: "Priya",
        message: "Loved the live orchestra cueing the keynote transitions.",
        date: "2024-03-16",
      },
    ],
    tags: ["keynote", "stage", "production"],
  },
  {
    id: "vr-experience-zone",
    title: "VR Experience Zone",
    year: "2024",
    category: "VR Zone",
    brand: "MetaVR Labs",
    image: expoImages.vrZone,
    excerpt:
      "Visitors queued for hours to try collaborative VR demos and spatial audio lounges built with our partners.",
    article: [
      {
        heading: "Spatial Storytelling",
        body: "The zone was mapped into themed pods—education, health, and entertainment—each with haptic rigs and positional audio. We measured a 40% longer dwell time versus last year.",
      },
      {
        heading: "Community-Led Demos",
        body: "Makers and indie studios had a dedicated alley. Their prototypes drew as much attention as the headline brands, proving the appetite for grassroots innovation.",
      },
    ],
    likes: 312,
    comments: [
      {
        id: "c3",
        author: "Riya",
        message: "Haptics on the health pod were surprisingly convincing.",
        date: "2024-02-02",
      },
    ],
    tags: ["vr", "immersive", "innovation"],
  },
  {
    id: "aerial-view-2023",
    title: "Aerial View 2023",
    year: "2023",
    category: "Crowds",
    brand: "ICEGLOBAL",
    image: expoImages.aerial,
    excerpt:
      "A sunset drone sweep showing the sheer scale of our exhibition footprint and the multi-level experience zones.",
    article: [
      {
        heading: "Crowd Flow",
        body: "We redesigned the floor with wider arterials and micro-hubs. Queue times dropped 18% while average booth visits increased.",
      },
      {
        heading: "Energy At Dusk",
        body: "Golden hour lighting plus dynamic LED fascia made the campus feel like a city festival rather than a trade show.",
      },
    ],
    likes: 221,
    comments: [
      {
        id: "c4",
        author: "Dev",
        message: "This overhead shot convinced our board to sponsor 2024.",
        date: "2023-09-18",
      },
    ],
    tags: ["crowd", "operations", "design"],
  },
  {
    id: "grand-entrance",
    title: "Grand Entrance",
    year: "2022",
    category: "Installations",
    brand: "FutureBrand",
    image: expoImages.entrance,
    excerpt:
      "A kinetic light tunnel welcomed visitors with real-time visuals responding to movement and audio cues.",
    article: [
      {
        heading: "Adaptive Greeting",
        body: "Motion sensors drove gradient ripples across 3,000 LED nodes. The more people in the tunnel, the brighter the trail became.",
      },
      {
        heading: "Brand Moments",
        body: "Partners could trigger branded sequences. FutureBrand used a coral-to-violet sweep that guests kept filming and sharing.",
      },
    ],
    likes: 198,
    comments: [
      {
        id: "c5",
        author: "Nikhil",
        message: "Great first impression—set the mood instantly.",
        date: "2022-07-04",
      },
    ],
    tags: ["installation", "lighting", "entry"],
  },
  {
    id: "innovation-booth",
    title: "Innovation Booth",
    year: "2023",
    category: "Booths",
    brand: "TechVision Labs",
    image: expoImages.booth,
    excerpt:
      "A modular booth that rotated products every two hours, keeping the space fresh and traffic steady throughout the day.",
    article: [
      {
        heading: "Modular Build",
        body: "Magnetic walls and ceiling-mounted rails let the team reconfigure the booth quickly. Over the expo they ran 16 micro-launches.",
      },
      {
        heading: "Live Analytics",
        body: "Heatmaps from overhead sensors showed where visitors lingered. Layout tweaks improved engagement by 22% by day three.",
      },
    ],
    likes: 167,
    comments: [
      {
        id: "c6",
        author: "Ananya",
        message: "Loved the rotating showcase—it rewarded repeat visits.",
        date: "2023-11-10",
      },
    ],
    tags: ["booth", "design", "engagement"],
  },
  {
    id: "night-arena",
    title: "Night Arena",
    year: "2021",
    category: "Stage",
    brand: "GlobalTech",
    image: expoImages.hero,
    excerpt:
      "Late-night talks and live performances transformed the arena into a festival-like lounge after dark.",
    article: [
      {
        heading: "Hybrid Format",
        body: "Talks streamed to a remote audience while on-site guests relaxed in tiered lounges. Ambient soundscapes kept the vibe warm without overpowering conversations.",
      },
      {
        heading: "Programming Mix",
        body: "From acoustic sets to founder firesides, the schedule was intentionally varied to keep people lingering past 11 PM.",
      },
    ],
    likes: 184,
    comments: [
      {
        id: "c7",
        author: "Meera",
        message: "Best networking happened here once the lights dimmed.",
        date: "2021-09-22",
      },
    ],
    tags: ["stage", "evening", "community"],
  },
  {
    id: "immersive-demo",
    title: "Immersive Demo",
    year: "2022",
    category: "Installations",
    brand: "StartupX",
    image: expoImages.vrZone,
    excerpt:
      "A mixed reality product walk-through that merged physical props with spatial overlays and haptics.",
    article: [
      {
        heading: "Phygital Layering",
        body: "Physical props were tracked so virtual overlays aligned perfectly. Guests could touch, feel, and see contextual data pop up live.",
      },
      {
        heading: "Repeatability",
        body: "Scenes were short and looped every 6 minutes, allowing 3,000+ visitors to experience the demo without long queues.",
      },
    ],
    likes: 145,
    comments: [
      {
        id: "c8",
        author: "Isha",
        message: "The spatial overlays were crisp—zero nausea even after 10 minutes.",
        date: "2022-08-02",
      },
    ],
    tags: ["installation", "mixed-reality"],
  },
  {
    id: "panel-discussion",
    title: "Panel Discussion",
    year: "2020",
    category: "Stage",
    brand: "InnovateCorp",
    image: expoImages.stage,
    excerpt:
      "A candid founder panel on building resilient products, streamed to 30K remote viewers during our first hybrid year.",
    article: [
      {
        heading: "Human Stories",
        body: "Founders shared failures more than wins, which resonated with the audience and sparked honest Q&A sessions.",
      },
      {
        heading: "Hybrid Learnings",
        body: "We introduced live captioning and a moderated chat. Engagement from remote viewers matched the in-room crowd.",
      },
    ],
    likes: 132,
    comments: [
      {
        id: "c9",
        author: "Kabir",
        message: "Favorite session. The honesty was refreshing.",
        date: "2020-12-11",
      },
    ],
    tags: ["panel", "hybrid", "founders"],
  },
  {
    id: "workshop-zone",
    title: "Workshop Zone",
    year: "2019",
    category: "Workshops",
    brand: "ICEGLOBAL",
    image: expoImages.stage,
    excerpt:
      "Hands-on sessions with mentors guiding teams through rapid prototyping and pitch practice.",
    article: [
      {
        heading: "Mentor Density",
        body: "We maintained a 1:6 mentor-to-team ratio so every table got direct feedback. Sessions were oversubscribed within hours.",
      },
      {
        heading: "Outcomes",
        body: "Thirty teams pitched on the final day; five secured POCs with enterprise partners on the spot.",
      },
    ],
    likes: 118,
    comments: [
      {
        id: "c10",
        author: "Tanvi",
        message: "Workshops were well-paced—no fluff, just practical advice.",
        date: "2019-05-09",
      },
    ],
    tags: ["workshop", "mentorship"],
  },
  {
    id: "evening-lights",
    title: "Evening Lights",
    year: "2018",
    category: "Crowds",
    brand: "ICEGLOBAL",
    image: expoImages.hero,
    excerpt:
      "After-hours lighting brought out the architecture of the venue and created photo-worthy backdrops for visitors.",
    article: [
      {
        heading: "Layered Glow",
        body: "We blended warm uplighting with cool moving beams to sculpt depth across the concourse and exterior facade.",
      },
      {
        heading: "Shareability",
        body: "Designated photo spots with subtle markers encouraged visitors to frame shots that showcased the venue scale.",
      },
    ],
    likes: 104,
    comments: [
      {
        id: "c11",
        author: "Neel",
        message: "Lighting team deserves a raise—every corner was Instagram-ready.",
        date: "2018-06-18",
      },
    ],
    tags: ["lighting", "crowd"],
  },
  {
    id: "product-launch",
    title: "Product Launch",
    year: "2017",
    category: "Booths",
    brand: "NexGen",
    image: expoImages.booth,
    excerpt:
      "A choreographed product unveil using synchronized LED columns and a timed CO₂ burst at the climax.",
    article: [
      {
        heading: "Timing Is Everything",
        body: "We rehearsed a 90-second show to align lighting, audio cues, and the reveal. The clip trended on social for two days.",
      },
      {
        heading: "Partner ROI",
        body: "NexGen reported a 3x increase in qualified leads compared to the previous year.",
      },
    ],
    likes: 95,
    comments: [
      {
        id: "c12",
        author: "Aditi",
        message: "The countdown sequence built real suspense. Fantastic production.",
        date: "2017-04-27",
      },
    ],
    tags: ["launch", "booth", "show"],
  },
  {
    id: "media-zone",
    title: "Media Zone",
    year: "2016",
    category: "Media",
    brand: "ICEGLOBAL",
    image: expoImages.aerial,
    excerpt:
      "A dedicated broadcasting center with soundproof pods and plug-and-play uplinks for partner media houses.",
    article: [
      {
        heading: "Seamless Setup",
        body: "We pre-wired pods with switching, intercom, and lighting presets. Crews could go live within minutes of arrival.",
      },
      {
        heading: "Content Velocity",
        body: "Over 200 live hits were produced across three days, giving partners real-time content without sacrificing quality.",
      },
    ],
    likes: 82,
    comments: [
      {
        id: "c13",
        author: "Rohan",
        message: "Loved how easy it was to get on-air. Zero tech hiccups.",
        date: "2016-03-02",
      },
    ],
    tags: ["media", "broadcast"],
  },
  {
    id: "opening-night",
    title: "Opening Night",
    year: "2015",
    category: "Stage",
    brand: "ICEGLOBAL",
    image: expoImages.entrance,
    excerpt:
      "Our first-ever opening night, featuring a live drone show and projection-mapped history of the expo.",
    article: [
      {
        heading: "Setting the Tradition",
        body: "The projection mapped the venue history while drones formed the expo logo. It set a precedent for every edition that followed.",
      },
      {
        heading: "Community Roots",
        body: "Local artists co-created the soundtrack. It grounded the event in the city and built immediate goodwill.",
      },
    ],
    likes: 76,
    comments: [
      {
        id: "c14",
        author: "Sana",
        message: "The projection mapping was magical. Goosebumps!",
        date: "2015-01-15",
      },
    ],
    tags: ["opening", "legacy"],
  },
];

export const galleryYears = [
  "All Years",
  ...Array.from(new Set(galleryItems.map((item) => item.year))).sort(
    (a, b) => Number(b) - Number(a),
  ),
];
export const galleryCategories = ["All", ...new Set(galleryItems.map((item) => item.category))];
