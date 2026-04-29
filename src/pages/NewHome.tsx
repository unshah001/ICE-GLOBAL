import { useEffect, useState, useMemo } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
// import { BackgroundBeams } from "@/components/ui/background-effects";
import ReviewMomentsSection from "@/components/ReviewMomentsSection";
import BrandHighlightsSection from "@/components/BrandHighlightsSection";
import CelebritySpotlightSection from "@/components/CelebritySpotlightSection";
import SellerSignalsSection from "@/components/SellerSignalsSection";
import BuyerVoicesSection from "@/components/BuyerVoicesSection";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import EntranceArchesSection from "@/components/EntranceArchesSection";
import StallsMosaicSection from "@/components/StallsMosaicSection";
import VvipSpotlightSection from "@/components/VvipSpotlightSection"
import CountingSection from "@/components/CountingSection";
import DualCtaSection from "@/components/DualCtaSection";
import FoundersSpotlightSection from "@/components/FoundersSpotlightSection";
import CoFoundersSection from "@/components/CoFoundersSection";
import Footer, { type FooterData } from "@/components/Footer";
import { TestimonialsCarousel } from "@/components/ui/testimonials-carousel";
import { galleryImages, heroProducts as fallbackHero, navItems as staticNav, brandHighlights as fallbackBrands } from "@/data/expo-data";
import { celebritySpotlights } from "@/data/celebrity-data";
import { sellerTestimonials } from "@/data/seller-testimonials";
import { buyerTestimonials } from "@/data/buyer-testimonials";
import { timelineContent } from "@/data/expo-data";
import { entranceArches } from "@/data/entrance-arches";
import { vvipGuests } from "@/data/vvip-data";
import { founders } from "@/data/founders";
import { coFounders } from "@/data/cofounders";
import { celebritySpotlights as fallbackCelebs } from "@/data/celebrity-data";
import { galleryImages as fallbackGalleryImages } from "@/data/expo-data";

type HeroItem = { title: string; link: string; thumbnail: string };
type HeroContent = { title: string; subtitle: string; description: string };
type HeroResponse = {
  heroProducts: HeroItem[];
  navItems: { name: string; href: string }[];
  heroContent?: HeroContent;
};
type ReviewImage = { src: string; href: string };
type ReviewData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  images: ReviewImage[];
};
type ReviewResponse = ReviewData;
type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
};
type BrandsResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  brands: BrandItem[];
};
type CelebItem = {
  name: string;
  title: string;
  quote: string;
  image: string;
  badge: string;
};
type CelebResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  celebrities: CelebItem[];
};
type SellerItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  outcome: string;
  image: string;
  href?: string;
};
type SellersResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  sellers: SellerItem[];
};
type BuyerItem = {
  id: string;
  name: string;
  city: string;
  segment: string;
  quote: string;
  spend: string;
  visits: string;
  image: string;
  href?: string;
};
type BuyersResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  buyers: BuyerItem[];
};
type TimelineItem = {
  title: string;
  description: string;
  image?: string;
};
type TimelineResponse = {
  eyebrow: string;
  title: string;
  description: string;
  milestones: TimelineItem[];
};
type ArchesItem = {
  city: string;
  year: string;
  highlight: string;
  image: string;
  href?: string;
};
type ArchesResponse = {
  eyebrow: string;
  title: string;
  description: string;
  arches: ArchesItem[];
};
type StallsImage = { src: string; href?: string } | string;
type StallsResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  images: StallsImage[];
  stats?: { label: string; value: string; icon?: "grid" | "users" }[];
};
type BuyerMosaicResponse = StallsResponse;
type VvipGuest = Vvip & { href?: string };
type VvipResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  guests: VvipGuest[];
};
type FounderItem = {
  name: string;
  title: string;
  era: "ICE 1.0" | "ICE 2.0";
  focus: string;
  image: string;
  highlight: string;
  href?: string;
};
type FoundersResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  founders: FounderItem[];
};
type CoFounderItem = {
  name: string;
  track: "IGE" | "IGN" | "IGE & IGN";
  title: string;
  focus: string;
  image: string;
  highlight: string;
  href?: string;
};
type CoFoundersResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  cofounders: CoFounderItem[];
};
type CountsResponse = { stats: { value: number; suffix?: string; label: string }[] };
type DualCtaCard = {
  eyebrow?: string;
  title: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};
type DualCtaResponse = { sellers: DualCtaCard; buyers: DualCtaCard };
type FooterResponse = FooterData;
type LayoutSection = { id: string; label: string; enabled: boolean };
type TeamMember = {
  id: string;
  name: string;
  role: string;
  department?: string;
  focus?: string;
  image: string;
  href?: string;
};
type TeamsResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  team: TeamMember[];
};
type HomeTestimonial = {
  image: string;
  name: string;
  role: string;
  company: string;
  rating: number;
};
type TestimonialsResponse = {
  hero: { badge?: string; title?: string; intro?: string };
  testimonials: HomeTestimonial[];
};

const NewHome = () => {
  // const [heroData, setHeroData] = useState<HeroItem[]>(fallbackHero);
  const [heroData, setHeroData] = useState<HeroItem[] | null>(null);
const [heroLoading, setHeroLoading] = useState(true);
  const [navItems, setNavItems] = useState(staticNav);
  // const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
//   const [heroContent, setHeroContent] = useState<HeroContent>({
//   title: "India's Biggest International Consumer Exhibition",
//   subtitle: "A decade of immersive expos, captured in over 1,000 moments.",
//   description: "Where brands connect, innovate, and inspire. Explore our visual archive of unforgettable experiences.",
// });
const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({
    eyebrow: "What is ICE Exhibitions",
    title: "Infographics & Photos",
    description:
      "A quick visual walkthrough of the ICE Exhibitions universe—immersive entrances, grand stages, VR zones, and the community moments that define the brand.",
    ctaLabel: "Explore Full Gallery",
    ctaHref: "/gallery",
    images: galleryImages.map((src) => ({ src, href: "/gallery" })),
  });
  const [brandsData, setBrandsData] = useState<BrandsResponse>({
    eyebrow: "Trustworthy Leaders",
    title: "Brands that trust ICE Exhibitions",
    description: "Logos and stories from partners who have built standout moments on our platform.",
    ctaLabel: "View all partner brands",
    ctaHref: "/gallery",
    brands: fallbackBrands,
  });
  const [celebsData, setCelebsData] = useState<CelebResponse>({
    eyebrow: "Celebrity Photos",
    title: "Faces that amplify the spotlight",
    description: "A rotating showcase of performers, hosts, and investors who bring star power to ICE Exhibitions.",
    ctaLabel: "See all appearances",
    ctaHref: "/gallery",
    celebrities: fallbackCelebs,
  });
  const [sellersData, setSellersData] = useState<SellersResponse>({
    eyebrow: "Seller Voices",
    title: "Proof from the sellers’ side",
    description: "Momentum snapshots instead of long testimonials—outcomes, conversion lifts, and the playbook that made them happen.",
    ctaLabel: "See all sellers",
    ctaHref: "/gallery",
    sellers: sellerTestimonials,
  });
  const [buyersData, setBuyersData] = useState<BuyersResponse>({
    eyebrow: "Buyer Voices",
    title: "Why buyers keep coming back",
    description: "Decision-makers and superfans sharing how they navigate ICE—curated lanes, late-night sets, and baskets that keep growing.",
    ctaLabel: "See all buyer stories",
    ctaHref: "/buyers",
    buyers: buyerTestimonials,
  });
  const [timelineData, setTimelineData] = useState<TimelineResponse>({
    eyebrow: "30 Years • Legacy in Motion",
    title: "ICE Exhibitions Journey Timeline",
    description: "From the first city arch to a 10-city hybrid circuit—milestones that shaped our platform.",
    milestones: timelineContent,
  });
  const [archesData, setArchesData] = useState<ArchesResponse>({
    eyebrow: "Review the moment",
    title: "Mega Entrance Arches across 10 cities",
    description: "Three decades of arches engineered for arrivals—kinetic light tunnels, climate-smart canopies, and city-inspired silhouettes.",
    arches: entranceArches,
  });
  const [stallsData, setStallsData] = useState<StallsResponse>({
    eyebrow: "Review the moment",
    title: "10,000+ brands & seller stalls",
    description: "A visual atlas of the booths and showcases that defined ICE Exhibitions over 30 years.",
    ctaLabel: "See the full archive",
    ctaHref: "/gallery",
    images: fallbackGalleryImages.map((src) => ({ src, href: "/gallery" })),
    stats: [
      { value: "10,000+", label: "brands & sellers", icon: "grid" },
      { value: "20M+", label: "buyers witnessed", icon: "users" },
    ],
  });
  const [buyerMosaicData, setBuyerMosaicData] = useState<BuyerMosaicResponse>({
    eyebrow: "Review the moment",
    title: "20 million loyal buyers",
    description: "Faces and crowds from three decades of ICE—loyal buyers returning for the launches, workshops, and night sets they love.",
    ctaLabel: "Browse buyer moments",
    ctaHref: "/gallery",
    images: fallbackGalleryImages.map((src, idx) => ({ src, href: `/gallery#buyer-${idx + 1}` })),
    stats: [
      { value: "20M+", label: "buyers over 30 years", icon: "users" },
      { value: "10 cities", label: "across India", icon: "grid" },
    ],
  });
  const [vvipData, setVvipData] = useState<VvipResponse>({
    eyebrow: "VVIPs",
    title: "Leaders who shaped the ICE stage",
    description: "Keynote guests, cultural envoys, and investors who elevated each edition.",
    ctaLabel: "See all VVIPs",
    ctaHref: "/gallery",
    guests: vvipGuests,
  });
  const [foundersData, setFoundersData] = useState<FoundersResponse>({
    eyebrow: "Review the moment",
    title: "Founders of ICE 1.0 & ICE 2.0",
    description: "From offline arches to hybrid broadcasts—meet the founders who evolved ICE from city expos to a national platform.",
    ctaLabel: "See all founders",
    ctaHref: "/founders",
    founders,
  });
  const [cofoundersData, setCofoundersData] = useState<CoFoundersResponse>({
    eyebrow: "Review the moment",
    title: "Co-founding team of ICE 2.0 (IGE & IGN)",
    description: "Builders behind the hybrid platform—linking on-ground showcases with digital broadcast networks.",
    ctaLabel: "See all co-founders",
    ctaHref: "/cofounders",
    cofounders: coFounders,
  });
  const [countsData, setCountsData] = useState<CountsResponse>({
    stats: [
      { value: 20, suffix: "M+", label: "buyers" },
      { value: 10000, suffix: "+", label: "brands & sellers" },
      { value: 10, label: "cities across India" },
      { value: 30, suffix: "+", label: "years of mega exhibitions" },
    ],
  });
  const [dualCtaData, setDualCtaData] = useState<DualCtaResponse>({
    sellers: {
      eyebrow: "CTA • Sellers",
      title: "Showcase your brand at ICE Exhibitions",
      description: "Book a pavilion, plan your launch, and let our production team handle staging, media, and lead capture.",
      primary: { label: "Plan my showcase", href: "/partner" },
      secondary: { label: "Talk to production", href: "/contact" },
    },
    buyers: {
      eyebrow: "CTA • Buyers",
      title: "Be first to the next ICE edition",
      description: "Unlock schedules, early access drops, and curated routes tailored to what you want to see.",
      primary: { label: "Get buyer access", href: "/sponsor" },
      secondary: { label: "View full program", href: "/gallery" },
    },
  });
  const [teamData, setTeamData] = useState<TeamsResponse>({
    eyebrow: "Team",
    title: "The team behind ICE",
    description: "Producers, ops, media, design, and data—meet the people keeping the circuit running.",
    ctaLabel: "Meet the full team",
    ctaHref: "/teams",
    team: [
      {
        id: "team-1",
        name: "Priya Menon",
        role: "Production Lead",
        department: "Operations",
        focus: "Large-format builds",
        image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "team-2",
        name: "Rahul Iyer",
        role: "Media & Broadcast",
        department: "Media",
        focus: "Live stream & highlights",
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "team-3",
        name: "Ayesha Khan",
        role: "Buyer Programs",
        department: "Growth",
        focus: "Curation & routes",
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "team-4",
        name: "Vikram Shah",
        role: "Design Director",
        department: "Design",
        focus: "Staging & visual systems",
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      },
    ],
  });
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsResponse>({
    hero: { badge: "Testimonials", title: "What our partners say", intro: "Snapshots from brands, buyers, and founders." },
    testimonials: [
      {
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        name: "Ananya Patel",
        role: "Founder",
        company: "Ignite Labs",
        rating: 5,
      },
      {
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
        name: "Rohit Desai",
        role: "CMO",
        company: "Northstar",
        rating: 5,
      },
      {
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
        name: "Meera Joshi",
        role: "Head of Buyer Programs",
        company: "ICE",
        rating: 4,
      },
    ],
  });
  const [footerData, setFooterData] = useState<FooterResponse | null>(null);
  const [layout, setLayout] = useState<LayoutSection[]>([
    { id: "hero", label: "Hero", enabled: true },
    { id: "review", label: "Review Moments", enabled: true },
    { id: "brands", label: "Brand Highlights", enabled: true },
    { id: "celebs", label: "Celebrities", enabled: true },
    { id: "sellers", label: "Sellers", enabled: true },
    { id: "buyers", label: "Buyers", enabled: true },
    { id: "team", label: "Team", enabled: true },
    { id: "testimonials", label: "Testimonials", enabled: true },
    { id: "timeline", label: "Timeline", enabled: true },
    { id: "arches", label: "Arches", enabled: true },
    { id: "stalls", label: "Stalls", enabled: true },
    { id: "buyerMosaic", label: "Buyer Mosaic", enabled: true },
    { id: "vvips", label: "VVIPs", enabled: true },
    { id: "founders", label: "Founders", enabled: true },
    { id: "cofounders", label: "Co-Founders", enabled: true },
    { id: "counts", label: "Counts", enabled: true },
    { id: "dualCta", label: "Dual CTA", enabled: true },
    { id: "footer", label: "Footer", enabled: true },
  ]);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";

    const fetchHero = async () => {
  try {
    const res = await fetch(`${base}/hero`);
    if (!res.ok) throw new Error("Hero fetch failed");
    const data = (await res.json()) as HeroResponse;
    // setHeroData(data.heroProducts ?? fallbackHero);
    // setNavItems(data.navItems ?? staticNav);
    // setHeroContent(data.heroContent ?? {
    //   title: "India's Biggest International Consumer Exhibition",
    //   subtitle: "A decade of immersive expos, captured in over 1,000 moments.",
    //   description: "Where brands connect, innovate, and inspire. Explore our visual archive of unforgettable experiences.",
    // });
    setHeroData(data.heroProducts ?? []);
setNavItems(data.navItems ?? staticNav);
setHeroContent(data.heroContent ?? null);
  // } catch {
  //   setHeroData(fallbackHero);
  //   setNavItems(staticNav);

  }catch {
  setHeroData([]);
  setHeroContent(null);
}
   finally {
    setHeroLoading(false);  // ← always runs
  }
};
    const fetchReview = async () => {
      try {
        const res = await fetch(`${base}/review`);
        if (!res.ok) throw new Error("Review fetch failed");
        const data = (await res.json()) as ReviewResponse;
        setReviewData({
          eyebrow: data.eyebrow || "What is ICE Exhibitions",
          title: data.title || "Infographics & Photos",
          description:
            data.description ||
            "A quick visual walkthrough of the ICE Exhibitions universe—immersive entrances, grand stages, VR zones, and the community moments that define the brand.",
          ctaLabel: data.ctaLabel || "Explore Full Gallery",
          ctaHref: data.ctaHref || "/gallery",
          images: data.images?.length
            ? data.images
            : galleryImages.map((src) => ({ src, href: "/gallery" })),
        });
      } catch {
        setReviewData((prev) => prev);
      }
    };
    

const fetchBrands = async () => {
  try {
    const res = await fetch(`${base}/brands`);
    if (!res.ok) throw new Error("Brands fetch failed");

    const data = await res.json();
    console.log("Brands API response:", data);

    setBrandsData({
      eyebrow: data.eyebrow || "Trustworthy Leaders",
      title: data.title || "Brands that trust ICE Exhibitions",
      description: data.description || "Logos and stories...",
      ctaLabel: data.ctaLabel || "View all partner brands",
      ctaHref: data.ctaHref || "/sellers",
      brands: data.data ?? [], // 👈 important change
    });
  } catch (err) {
    console.error(err);
  }
};
    const fetchCelebs = async () => {
      try {
        const res = await fetch(`${base}/celebrities`);
        if (!res.ok) throw new Error("Celebs fetch failed");
        const data = (await res.json()) as CelebResponse;
        setCelebsData({
          eyebrow: data.eyebrow || "Celebrity Photos",
          title: data.title || "Faces that amplify the spotlight",
          description: data.description || "A rotating showcase of performers, hosts, and investors who bring star power to ICE Exhibitions.",
          ctaLabel: data.ctaLabel || "See all appearances",
          ctaHref: data.ctaHref || "/gallery",
          celebrities: data.celebrities?.length ? data.celebrities : fallbackCelebs,
        });
      } catch {
        setCelebsData((prev) => prev);
      }
    };
    const fetchSellers = async () => {
      try {
        const res = await fetch(`${base}/sellers`);
        if (!res.ok) throw new Error("Sellers fetch failed");
        const data = (await res.json()) as SellersResponse;
        setSellersData({
          eyebrow: data.eyebrow || "Seller Voices",
          title: data.title || "Proof from the sellers’ side",
          description:
            data.description ||
            "Momentum snapshots instead of long testimonials—outcomes, conversion lifts, and the playbook that made them happen.",
          ctaLabel: data.ctaLabel || "See all sellers",
          ctaHref: data.ctaHref || "/gallery",
          sellers: data.sellers?.length ? data.sellers : sellerTestimonials,
        });
      } catch {
        setSellersData((prev) => prev);
      }
    };
    const fetchBuyers = async () => {
      try {
        const res = await fetch(`${base}/buyers`);
        if (!res.ok) throw new Error("Buyers fetch failed");
        const data = (await res.json()) as BuyersResponse;
        setBuyersData({
          eyebrow: data.eyebrow || "Buyer Voices",
          title: data.title || "Why buyers keep coming back",
          description:
            data.description ||
            "Decision-makers and superfans sharing how they navigate ICE—curated lanes, late-night sets, and baskets that keep growing.",
          ctaLabel: data.ctaLabel || "See all buyer stories",
          ctaHref: data.ctaHref || "/buyers",
          buyers: data.buyers?.length ? data.buyers : buyerTestimonials,
        });
      } catch {
        setBuyersData((prev) => prev);
      }
    };
    // const fetchTeam = async () => {
    //   try {
    //     const res = await fetch(`${base}/teams`);
    //     if (!res.ok) throw new Error("Team fetch failed");
    //     const data = (await res.json()) as TeamsResponse;
    //     setTeamData({
    //       eyebrow: data.eyebrow || "Team",
    //       title: data.title || "The team behind ICE",
    //       description:
    //         data.description ||
    //         "Producers, ops, media, design, and data—meet the people keeping the circuit running.",
    //       ctaLabel: data.ctaLabel || "Meet the full team",
    //       ctaHref: data.ctaHref || "/teams",
    //       team: data.team?.length ? data.team : teamData.team,
    //     });
    //   } catch {
    //     setTeamData((prev) => prev);
    //   }
    // };
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${base}/testimonials`);
        if (!res.ok) throw new Error("Testimonials fetch failed");
        const data = (await res.json()) as TestimonialsResponse;
        setTestimonialsData({
          hero: {
            badge: data.hero?.badge || "Testimonials",
            title: data.hero?.title || "What our partners say",
            intro:
              data.hero?.intro ||
              "Hear from brands, buyers, and founders who experienced ICE—from the floor to the main stage.",
          },
          testimonials: data.testimonials?.length ? data.testimonials : testimonialsData.testimonials,
        });
      } catch {
        setTestimonialsData((prev) => prev);
      }
    };
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`${base}/timeline`);
        if (!res.ok) throw new Error("Timeline fetch failed");
        const data = (await res.json()) as TimelineResponse;
        setTimelineData({
          eyebrow: data.eyebrow || "30 Years • Legacy in Motion",
          title: data.title || "ICE Exhibitions Journey Timeline",
          description:
            data.description ||
            "From the first city arch to a 10-city hybrid circuit—milestones that shaped our platform.",
          milestones: data.milestones?.length ? data.milestones : timelineContent,
        });
      } catch {
        setTimelineData((prev) => prev);
      }
    };
    const fetchArches = async () => {
      try {
        const res = await fetch(`${base}/arches`);
        if (!res.ok) throw new Error("Arches fetch failed");
        const data = (await res.json()) as ArchesResponse;
        setArchesData({
          eyebrow: data.eyebrow || "Review the moment",
          title: data.title || "Mega Entrance Arches across 10 cities",
          description:
            data.description ||
            "Three decades of arches engineered for arrivals—kinetic light tunnels, climate-smart canopies, and city-inspired silhouettes.",
          arches: data.arches?.length ? data.arches : entranceArches,
        });
      } catch {
        setArchesData((prev) => prev);
      }
    };
    const fetchStalls = async () => {
      try {
        const res = await fetch(`${base}/stalls`);
        if (!res.ok) throw new Error("Stalls fetch failed");
        const data = (await res.json()) as StallsResponse;
        setStallsData({
          eyebrow: data.eyebrow || "Review the moment",
          title: data.title || "10,000+ brands & seller stalls",
          description: data.description || "A visual atlas of the booths and showcases that defined ICE Exhibitions over 30 years.",
          ctaLabel: data.ctaLabel || "See the full archive",
          ctaHref: data.ctaHref || "/gallery",
          images: data.images?.length
            ? data.images
            : fallbackGalleryImages.map((src) => ({ src, href: "/gallery" })),
          stats:
            data.stats && data.stats.length
              ? data.stats
              : [
                  { value: "10,000+", label: "brands & sellers", icon: "grid" },
                  { value: "20M+", label: "buyers witnessed", icon: "users" },
                ],
        });
      } catch {
        setStallsData((prev) => prev);
      }
    };
    const fetchBuyerMosaic = async () => {
      try {
        const res = await fetch(`${base}/buyer-mosaic`);
        if (!res.ok) throw new Error("Buyer mosaic fetch failed");
        const data = (await res.json()) as BuyerMosaicResponse;
        setBuyerMosaicData({
          eyebrow: data.eyebrow || "Review the moment",
          title: data.title || "20 million loyal buyers",
          description:
            data.description ||
            "Faces and crowds from three decades of ICE—loyal buyers returning for the launches, workshops, and night sets they love.",
          ctaLabel: data.ctaLabel || "Browse buyer moments",
          ctaHref: data.ctaHref || "/gallery",
          images: data.images?.length
            ? data.images
            : fallbackGalleryImages.map((src, idx) => ({ src, href: `/gallery#buyer-${idx + 1}` })),
          stats:
            data.stats && data.stats.length
              ? data.stats
              : [
                  { value: "20M+", label: "buyers over 30 years", icon: "users" },
                  { value: "10 cities", label: "across India", icon: "grid" },
                ],
        });
      } catch {
        setBuyerMosaicData((prev) => prev);
      }
    };
    const fetchVvips = async () => {
      try {
        const res = await fetch(`${base}/vvips`);
        if (!res.ok) throw new Error("VVIP fetch failed");
        const data = (await res.json()) as VvipResponse;
        setVvipData({
          eyebrow: data.eyebrow || "VVIPs",
          title: data.title || "Leaders who shaped the ICE stage",
          description: data.description || "Keynote guests, cultural envoys, and investors who elevated each edition.",
          ctaLabel: data.ctaLabel || "See all VVIPs",
          ctaHref: data.ctaHref || "/gallery",
          guests: data.guests?.length ? data.guests : vvipGuests,
        });
      } catch {
        setVvipData((prev) => prev);
      }
    };
    const fetchFounders = async () => {
      try {
        const res = await fetch(`${base}/founders`);
        if (!res.ok) throw new Error("Founders fetch failed");
        const data = (await res.json()) as FoundersResponse;
        setFoundersData({
          eyebrow: data.eyebrow || "Review the moment",
          title: data.title || "Founders of ICE 1.0 & ICE 2.0",
          description:
            data.description ||
            "From offline arches to hybrid broadcasts—meet the founders who evolved ICE from city expos to a national platform.",
          ctaLabel: data.ctaLabel || "See all founders",
          ctaHref: data.ctaHref || "/founders",
          founders: data.founders?.length ? data.founders : founders,
        });
      } catch {
        setFoundersData((prev) => prev);
      }
    };
    const fetchCofounders = async () => {
      try {
        const res = await fetch(`${base}/cofounders`);
        if (!res.ok) throw new Error("Co-founders fetch failed");
        const data = (await res.json()) as CoFoundersResponse;
        setCofoundersData({
          eyebrow: data.eyebrow || "Review the moment",
          title: data.title || "Co-founding team of ICE 2.0 (IGE & IGN)",
          description:
            data.description ||
            "Builders behind the hybrid platform—linking on-ground showcases with digital broadcast networks.",
          ctaLabel: data.ctaLabel || "See all co-founders",
          ctaHref: data.ctaHref || "/cofounders",
          cofounders: data.cofounders?.length ? data.cofounders : coFounders,
        });
      } catch {
        setCofoundersData((prev) => prev);
      }
    };
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${base}/counts`);
        if (!res.ok) throw new Error("Counts fetch failed");
        const data = (await res.json()) as CountsResponse;
        setCountsData({
          stats:
            data.stats && data.stats.length
              ? data.stats
              : [
                  { value: 20, suffix: "M+", label: "buyers" },
                  { value: 10000, suffix: "+", label: "brands & sellers" },
                  { value: 10, label: "cities across India" },
                  { value: 30, suffix: "+", label: "years of mega exhibitions" },
                ],
        });
      } catch {
        setCountsData((prev) => prev);
      }
    };
    const fetchDualCta = async () => {
      try {
        const res = await fetch(`${base}/dual-cta`);
        if (!res.ok) throw new Error("Dual CTA fetch failed");
        const data = (await res.json()) as DualCtaResponse;
        setDualCtaData({
          sellers: data.sellers || dualCtaData.sellers,
          buyers: data.buyers || dualCtaData.buyers,
        });
      } catch {
        setDualCtaData((prev) => prev);
      }
    };
    const fetchFooter = async () => {
      try {
        const res = await fetch(`${base}/footer`);
        if (!res.ok) throw new Error("Footer fetch failed");
        const data = (await res.json()) as FooterResponse;
        setFooterData(data);
      } catch {
        setFooterData((prev) => prev);
      }
    };
    fetchHero();
    fetchReview();
    fetchBrands();
    fetchCelebs();
    fetchSellers();
    fetchBuyers();
    // fetchTeam();
    fetchTestimonials();
    fetchTimeline();
    fetchArches();
    fetchStalls();
    fetchBuyerMosaic();
    fetchVvips();
    fetchFounders();
    fetchCofounders();
    fetchCounts();
    fetchDualCta();
    fetchFooter();
    fetch(`${base}/home-layout`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.sections) && data.sections.length) {
          setLayout(data.sections as LayoutSection[]);
        }
      })
      .catch(() => {});
  }, []);

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <section className="relative" key="hero">
        {/* <BackgroundBeams className="z-0" /> */}
        <HeroParallax
          products={heroData}
          heroTitle={heroContent?.title}
          heroHighlight={heroContent?.subtitle}
          heroSubtitle={heroContent?.description}
        />
      </section>
    ),
    review: (
      <ReviewMomentsSection
        key="review"
        className="-mt-10 md:-mt-20"
        eyebrow={reviewData.eyebrow}
        title={reviewData.title}
        description={reviewData.description}
        images={reviewData.images}
        cta={{ label: reviewData.ctaLabel, href: reviewData.ctaHref }}
      />
    ),
    brands: (
      <BrandHighlightsSection
        key="brands"
        eyebrow={brandsData.eyebrow}
        title={brandsData.title}
        description={brandsData.description}
        ctaLabel={brandsData.ctaLabel}
        ctaHref={brandsData.ctaHref}
        brands={brandsData.brands}
      />
    ),


    celebs: (
      <CelebritySpotlightSection
        key="celebs"
        eyebrow={celebsData.eyebrow}
        title={celebsData.title}
        description={celebsData.description}
        celebrities={celebsData.celebrities}
        cta={{ label: celebsData.ctaLabel || "See all appearances", href: celebsData.ctaHref || "/gallery" }}
      />
    ),
    sellers: (
      <SellerSignalsSection
        key="sellers"
        eyebrow={sellersData.eyebrow}
        title={sellersData.title}
        description={sellersData.description}
        sellers={sellersData.sellers}
        cta={{ label: sellersData.ctaLabel || "See all sellers", href: sellersData.ctaHref || "/gallery" }}
      />
    ),
    buyers: (
      <BuyerVoicesSection
        key="buyers"
        eyebrow={buyersData.eyebrow}
        title={buyersData.title}
        description={buyersData.description}
        buyers={buyersData.buyers}
        cta={{ label: buyersData.ctaLabel || "See all buyer stories", href: buyersData.ctaHref || "/buyers" }}
      />
    ),
//     team: (
//       <section key="team" className="section-padding bg-muted/40 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_30%)]" />
//         <div className="container-custom relative">
         
// <div className="flex flex-col items-center text-center gap-4 mb-12">
//   <div className="max-w-2xl">
//     <span className="text-primary font-medium text-sm uppercase tracking-wider">{teamData.eyebrow || "Team"}</span>
//     <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2">{teamData.title}</h2>
//     <p className="text-muted-foreground mt-4">{teamData.description}</p>
//   </div>
//   {teamData.ctaHref && (
//     <a href={teamData.ctaHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
//       {teamData.ctaLabel || "Meet the full team"}
//     </a>
//   )}
// </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {(teamData.team || []).slice(0, 6).map((member, idx) => {
//               const CardWrapper = member.href ? "a" : "div";
//               return (
//                 <CardWrapper
//                   key={member.id || idx}
//                   href={member.href}
//                   className="group relative block rounded-3xl border border-border/70 bg-gradient-to-b from-background/90 via-background/70 to-background/90 overflow-hidden shadow-[0_10px_60px_-25px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_70px_-25px_rgba(0,0,0,0.65)]"
//                 >
//                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-emerald-200/10" />
//                   <div className="aspect-[4/3] overflow-hidden">
//                     <img
//                       src={member.image}
//                       alt={member.name}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                     />
//                   </div>
//                   <div className="absolute top-4 left-4">
//                     <span className="inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary shadow-sm">
//                       {member.department || "Team"}
//                     </span>
//                   </div>
//                   <div className="p-5 relative space-y-2">
//                     <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
//                     <p className="text-sm text-muted-foreground">{member.role}</p>
//                     {member.focus && <p className="text-sm text-muted-foreground">{member.focus}</p>}
//                     {member.href && (
//                       <div className="pt-2 text-sm font-medium text-primary inline-flex items-center gap-1">
//                         View profile <span aria-hidden>→</span>
//                       </div>
//                     )}
//                   </div>
//                 </CardWrapper>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     ),
    testimonials: (
      <TestimonialsCarousel
        key="testimonials"
        testimonials={testimonialsData.testimonials}
        title={testimonialsData.hero.title || "What our partners say"}
        subtitle={testimonialsData.hero.intro}
      />
    ),
    timeline: (
      <section className="relative" key="timeline">
        <div className="container-custom py-16">
          <div className="text-center mb-8">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {timelineData.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2">
              {timelineData.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
              {timelineData.description}
            </p>
          </div>
        </div>
        <StickyScrollReveal content={timelineData.milestones.length ? timelineData.milestones : timelineContent} />
      </section>
    ),
    arches: (
      <EntranceArchesSection
        key="arches"
        eyebrow={archesData.eyebrow}
        title={archesData.title}
        description={archesData.description}
        arches={archesData.arches}
      />
    ),
    stalls: (
      <StallsMosaicSection
        key="stalls"
        eyebrow={stallsData.eyebrow}
        title={stallsData.title}
        description={stallsData.description}
        images={stallsData.images}
        stats={stallsData.stats}
        cta={{ label: stallsData.ctaLabel || "See the full archive", href: stallsData.ctaHref || "/gallery" }}
      />
    ),
    buyerMosaic: (
      <StallsMosaicSection
        key="buyerMosaic"
        eyebrow={buyerMosaicData.eyebrow}
        title={buyerMosaicData.title}
        description={buyerMosaicData.description}
        images={buyerMosaicData.images}
        stats={buyerMosaicData.stats}
        cta={{ label: buyerMosaicData.ctaLabel || "Browse buyer moments", href: buyerMosaicData.ctaHref || "/gallery" }}
      />
    ),
    vvips: (
      <VvipSpotlightSection
        key="vvips"
        eyebrow={vvipData.eyebrow}
        title={vvipData.title}
        description={vvipData.description}
        guests={vvipData.guests}
        cta={{ label: vvipData.ctaLabel || "See all VVIPs", href: vvipData.ctaHref || "/gallery" }}
      />
    ),
    founders: (
      <FoundersSpotlightSection
        key="founders"
        eyebrow={foundersData.eyebrow}
        title={foundersData.title}
        description={foundersData.description}
        founders={foundersData.founders}
        cta={{ label: foundersData.ctaLabel || "See all founders", href: foundersData.ctaHref || "/founders" }}
      />
    ),
    cofounders: (
      <CoFoundersSection
        key="cofounders"
        eyebrow={cofoundersData.eyebrow}
        title={cofoundersData.title}
        description={cofoundersData.description}
        cofounders={cofoundersData.cofounders}
        cta={{ label: cofoundersData.ctaLabel || "See all co-founders", href: cofoundersData.ctaHref || "/cofounders" }}
      />
    ),
    counts: <CountingSection key="counts" stats={countsData.stats} />,
    dualCta: <DualCtaSection key="dualCta" sellers={dualCtaData.sellers} buyers={dualCtaData.buyers} />,
    footer: <Footer key="footer" data={footerData || undefined} />,
  };

  const ordered = layout.filter((s) => s.enabled && sectionMap[s.id]);
  const renderSections = ordered.length ? ordered.map((s) => sectionMap[s.id]) : Object.values(sectionMap);

  return (
    <main className="min-h-screen bg-background ">
      <FloatingNavbar navItems={navItems} />
      {renderSections}
    </main>
  );
};

export default NewHome;


