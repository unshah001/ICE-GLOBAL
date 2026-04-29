export type CoFounderProfile = {
  name: string;
  track: "IGE" | "IGN" | "IGE & IGN";
  title: string;
  focus: string;
  image: string;
  highlight: string;
  href?: string;

};

export const coFounders: CoFounderProfile[] = [
  // {
  //   name: "Priyanshi Jha",
  //   track: "IGE & IGN",
  //   title: "Co-Founder, ICE 2.0",
  //   focus: "Product + Program",
  //   image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
  //   highlight: "Bridges on-ground playbooks with digital programming for both IGE and IGN.",
  //   href: "/cofounders/priyanshi-jha",
  // },
  {
    name: "Sanjay Shah",
    track: "IGE & IGN",
    title: "Co-Founder, ICE 2.0",
    focus: "Growth + Partnerships",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    highlight: "Scaled the hybrid network—brand sponsors, city partners, and streaming collaborators.",
    href: "/cofounders/sanjay-shah",
  },
  {
    name: "Rohit Kumar",
    track: "IGE",
    title: "Co-Founder, IGE",
    focus: "Live Streams + Creator Ops",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop",
    highlight: "Built the broadcast lanes for IGE with creator pipelines and live ops.",
    href: "/cofounders/rohit-kumar",
  },
  {
    name: "Ritu Anand",
    track: "IGN",
    title: "Co-Founder, IGN",
    focus: "Network + Community",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop",
    highlight: "Grew IGN’s community channels and buyer programs for digital-first drops.",
    href: "/cofounders/ritu-anand",
  },
];
