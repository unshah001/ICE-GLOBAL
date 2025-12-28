import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { type AdminSectionLink } from "@/components/admin/AdminSidebar";
import HeroEditor from "@/components/admin/sections/HeroEditor";
import ReviewEditor from "@/components/admin/sections/ReviewEditor";
import BrandEditor from "@/components/admin/sections/BrandEditor";
import CelebEditor from "@/components/admin/sections/CelebEditor";
import SellerEditor from "@/components/admin/sections/SellerEditor";
import BuyerEditor from "@/components/admin/sections/BuyerEditor";
import TimelineEditor from "@/components/admin/sections/TimelineEditor";
import ArchesEditor from "@/components/admin/sections/ArchesEditor";
import StallsEditor from "@/components/admin/sections/StallsEditor";
import BuyerMosaicEditor from "@/components/admin/sections/BuyerMosaicEditor";
import VvipEditor from "@/components/admin/sections/VvipEditor";
import FoundersEditor from "@/components/admin/sections/FoundersEditor";
import CoFoundersEditor from "@/components/admin/sections/CoFoundersEditor";
import CountEditor from "@/components/admin/sections/CountEditor";
import DualCtaEditor from "@/components/admin/sections/DualCtaEditor";
import FooterEditor from "@/components/admin/sections/FooterEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { navItems as staticNav } from "@/data/expo-data";
import { AlertCircle, Plus, Save, Trash2, RotateCcw } from "lucide-react";

const makeId = () => Math.random().toString(36).slice(2, 10);

type NavItem = { name: string; href: string };
type HeroItem = { title: string; link: string; thumbnail: string };
type HeroContent = { title: string; subtitle: string; description: string };
type HeroResponse = { navItems: NavItem[]; heroProducts: HeroItem[]; heroContent?: HeroContent };
type ReviewData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  images: { src: string; href: string }[];
};
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
  brands: BrandItem[];
};
type CelebItem = {
  name: string;
  title: string;
  quote: string;
  image: string;
  badge: string;
  href?: string;
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
type TimelineItem = { title: string; description: string; image?: string };
type TimelineResponse = {
  eyebrow: string;
  title: string;
  description: string;
  milestones: TimelineItem[];
};
type ArchItem = {
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
  arches: ArchItem[];
};
type StallImage = { src: string; href?: string };
type StallsResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  images: StallImage[];
  stats?: { label: string; value: string; icon?: "grid" | "users" }[];
};
type BuyerMosaicResponse = StallsResponse;
type VvipItem = {
  name: string;
  title: string;
  role: string;
  image: string;
  highlight: string;
  href?: string;
};
type VvipResponse = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  guests: VvipItem[];
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
type DualCtaCard = {
  eyebrow?: string;
  title: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};
type DualCtaResponse = {
  sellers: DualCtaCard;
  buyers: DualCtaCard;
};
type FooterResponse = {
  ctaTitle: string;
  ctaDescription: string;
  partnerHref: string;
  sponsorHref: string;
  exploreLinks: { name: string; href: string }[];
  partnersLinks: { name: string; href: string }[];
  legalLinks: { name: string; href: string }[];
  contact: { location: string; email: string; phone: string };
  socials: { label: string; href: string }[];
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState<NavItem[]>(staticNav);
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [heroContent, setHeroContent] = useState<HeroContent>({ title: "", subtitle: "", description: "" });
  const [reviewData, setReviewData] = useState<ReviewData>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    images: [],
  });
  const sections: AdminSectionLink[] = [
    { id: "hero", label: "Hero" },
    { id: "review", label: "Review Moments" },
    { id: "brands", label: "Brands" },
    { id: "celebs", label: "Celebrities" },
    { id: "sellers", label: "Sellers" },
    { id: "buyers", label: "Buyers" },
    { id: "timeline", label: "Timeline" },
    { id: "arches", label: "Entrance Arches" },
    { id: "stalls", label: "Stalls" },
    { id: "buyer-mosaic", label: "Buyer Mosaic" },
    { id: "vvips", label: "VVIPs" },
    { id: "founders", label: "Founders" },
    { id: "cofounders", label: "Co-founders" },
    { id: "counts", label: "Counting" },
    { id: "dual-cta", label: "Dual CTAs" },
    { id: "footer", label: "Footer" },
  ];
  const [brandsData, setBrandsData] = useState<BrandsResponse>({
    eyebrow: "",
    title: "",
    description: "",
    brands: [],
  });
  const [celebsData, setCelebsData] = useState<CelebResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    celebrities: [],
  });
  const [sellersData, setSellersData] = useState<SellersResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    sellers: [],
  });
  const [buyersData, setBuyersData] = useState<BuyersResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    buyers: [],
  });
  const [timelineData, setTimelineData] = useState<TimelineResponse>({
    eyebrow: "",
    title: "",
    description: "",
    milestones: [],
  });
  const [archesData, setArchesData] = useState<ArchesResponse>({
    eyebrow: "",
    title: "",
    description: "",
    arches: [],
  });
  const [stallsData, setStallsData] = useState<StallsResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    images: [],
    stats: [],
  });
  const [buyerMosaicData, setBuyerMosaicData] = useState<BuyerMosaicResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    images: [],
    stats: [],
  });
  const [vvipData, setVvipData] = useState<VvipResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    guests: [],
  });
  const [foundersData, setFoundersData] = useState<FoundersResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    founders: [],
  });
  const [cofoundersData, setCofoundersData] = useState<CoFoundersResponse>({
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    cofounders: [],
  });
  const [countsData, setCountsData] = useState<{ stats: { value: number; suffix?: string; label: string }[] }>({
    stats: [],
  });
  const [dualCtaData, setDualCtaData] = useState<DualCtaResponse>({
    sellers: { eyebrow: "", title: "", description: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
    buyers: { eyebrow: "", title: "", description: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
  });
  const [footerData, setFooterData] = useState<FooterResponse>({
    ctaTitle: "",
    ctaDescription: "",
    partnerHref: "",
    sponsorHref: "",
    exploreLinks: [],
    partnersLinks: [],
    legalLinks: [],
    contact: { location: "", email: "", phone: "" },
    socials: [],
  });

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const loadHero = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${base}/hero`);
        if (!res.ok) throw new Error("Failed to load hero data");
        const data = (await res.json()) as HeroResponse;
        setNavItems(data.navItems ?? staticNav);
        if (data.heroContent) {
          setHeroContent(data.heroContent);
        } else {
          setHeroContent({ title: "", subtitle: "", description: "" });
        }
        setHeroItems(data.heroProducts ?? []);
      } catch (err: any) {
        setError(err.message || "Unable to load hero data");
        setNavItems(staticNav);
      } finally {
        setLoading(false);
      }
    };
    const loadReview = async () => {
      try {
        const res = await fetch(`${base}/review`);
        if (!res.ok) throw new Error("Failed to load review data");
        const data = await res.json();
        setReviewData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          images: (data.images || []).map((img: any) => ({
            src: img?.src || "",
            href: img?.href || "",
          })),
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load review data");
      }
    };
    const loadBrands = async () => {
      try {
        const res = await fetch(`${base}/brands/highlights`);
        if (!res.ok) throw new Error("Failed to load brands data");
        const data = (await res.json()) as BrandsResponse;
        setBrandsData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          brands: data.brands || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load brands data");
      }
    };
    const loadCelebs = async () => {
      try {
        const res = await fetch(`${base}/celebrities`);
        if (!res.ok) throw new Error("Failed to load celebrity data");
        const data = (await res.json()) as CelebResponse;
        setCelebsData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          celebrities: data.celebrities || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load celebrity data");
      }
    };
    const loadSellers = async () => {
      try {
        const res = await fetch(`${base}/sellers`);
        if (!res.ok) throw new Error("Failed to load seller data");
        const data = (await res.json()) as SellersResponse;
        setSellersData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          sellers: data.sellers || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load seller data");
      }
    };
    const loadBuyers = async () => {
      try {
        const res = await fetch(`${base}/buyers`);
        if (!res.ok) throw new Error("Failed to load buyer data");
        const data = (await res.json()) as BuyersResponse;
        setBuyersData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          buyers: data.buyers || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load buyer data");
      }
    };
    const loadTimeline = async () => {
      try {
        const res = await fetch(`${base}/timeline`);
        if (!res.ok) throw new Error("Failed to load timeline data");
        const data = (await res.json()) as TimelineResponse;
        setTimelineData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          milestones: data.milestones || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load timeline data");
      }
    };
    const loadArches = async () => {
      try {
        const res = await fetch(`${base}/arches`);
        if (!res.ok) throw new Error("Failed to load arches data");
        const data = (await res.json()) as ArchesResponse;
        setArchesData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          arches: data.arches || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load arches data");
      }
    };
    const loadStalls = async () => {
      try {
        const res = await fetch(`${base}/stalls`);
        if (!res.ok) throw new Error("Failed to load stalls data");
        const data = (await res.json()) as StallsResponse;
        setStallsData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          images: data.images || [],
          stats: data.stats || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load stalls data");
      }
    };
    const loadBuyerMosaic = async () => {
      try {
        const res = await fetch(`${base}/buyer-mosaic`);
        if (!res.ok) throw new Error("Failed to load buyer mosaic data");
        const data = (await res.json()) as BuyerMosaicResponse;
        setBuyerMosaicData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          images: data.images || [],
          stats: data.stats || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load buyer mosaic data");
      }
    };
    const loadVvips = async () => {
      try {
        const res = await fetch(`${base}/vvips`);
        if (!res.ok) throw new Error("Failed to load VVIP data");
        const data = (await res.json()) as VvipResponse;
        setVvipData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          guests: data.guests || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load VVIP data");
      }
    };
    const loadFounders = async () => {
      try {
        const res = await fetch(`${base}/founders`);
        if (!res.ok) throw new Error("Failed to load founders data");
        const data = (await res.json()) as FoundersResponse;
        setFoundersData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          founders: data.founders || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load founders data");
      }
    };
    const loadCofounders = async () => {
      try {
        const res = await fetch(`${base}/cofounders`);
        if (!res.ok) throw new Error("Failed to load co-founders data");
        const data = (await res.json()) as CoFoundersResponse;
        setCofoundersData({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          ctaLabel: data.ctaLabel || "",
          ctaHref: data.ctaHref || "",
          cofounders: data.cofounders || [],
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load co-founders data");
      }
    };
    const loadCounts = async () => {
      try {
        const res = await fetch(`${base}/counts`);
        if (!res.ok) throw new Error("Failed to load counts data");
        const data = (await res.json()) as { stats: { value: number; suffix?: string; label: string }[] };
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
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load counts data");
      }
    };
    const loadDualCta = async () => {
      try {
        const res = await fetch(`${base}/dual-cta`);
        if (!res.ok) throw new Error("Failed to load dual CTA data");
        const data = (await res.json()) as DualCtaResponse;
        setDualCtaData({
          sellers: data.sellers || dualCtaData.sellers,
          buyers: data.buyers || dualCtaData.buyers,
        });
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load dual CTA data");
      }
    };
    const loadFooter = async () => {
      try {
        const res = await fetch(`${base}/footer`);
        if (!res.ok) throw new Error("Failed to load footer data");
        const data = (await res.json()) as FooterResponse;
        setFooterData(data);
      } catch (err: any) {
        setError((prev) => prev || err.message || "Unable to load footer data");
      }
    };
    loadHero();
    loadReview();
    loadBrands();
    loadCelebs();
    loadSellers();
    loadBuyers();
    loadTimeline();
    loadArches();
    loadStalls();
    loadBuyerMosaic();
    loadVvips();
    loadFounders();
    loadCofounders();
    loadCounts();
    loadDualCta();
    loadFooter();
  }, []);

  const updateNav = (idx: number, key: keyof NavItem, value: string) => {
    setNavItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const updateHero = (idx: number, key: keyof HeroItem, value: string) => {
    setHeroItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addNav = () => setNavItems((prev) => [...prev, { name: "", href: "" }]);
  const addHero = () =>
    setHeroItems((prev) => [
      ...prev,
      { title: "", link: "/gallery", thumbnail: "https://via.placeholder.com/800x600" },
    ]);

  const removeNav = (idx: number) =>
    setNavItems((prev) => prev.filter((_, i) => i !== idx));
  const removeHero = (idx: number) =>
    setHeroItems((prev) => prev.filter((_, i) => i !== idx));
  const addBrand = () =>
    setBrandsData((prev) => ({
      ...prev,
      brands: [
        ...prev.brands,
        { slug: "", name: "", logo: "", relationship: "", category: "", image: "https://via.placeholder.com/400x300" },
      ],
    }));
  const removeBrand = (idx: number) =>
    setBrandsData((prev) => ({ ...prev, brands: prev.brands.filter((_, i) => i !== idx) }));
  const addCeleb = () =>
    setCelebsData((prev) => ({
      ...prev,
      celebrities: [
        ...prev.celebrities,
        { name: "", title: "", quote: "", image: "https://via.placeholder.com/600x800", badge: "" },
      ],
    }));
  const removeCeleb = (idx: number) =>
    setCelebsData((prev) => ({ ...prev, celebrities: prev.celebrities.filter((_, i) => i !== idx) }));
  const addSeller = () =>
    setSellersData((prev) => ({
      ...prev,
      sellers: [
        ...prev.sellers,
        {
          id: makeId(),
          name: "",
          role: "",
          company: "",
          quote: "",
          outcome: "",
          image: "https://via.placeholder.com/400x500",
          href: "",
        },
      ],
    }));
  const removeSeller = (idx: number) =>
    setSellersData((prev) => ({ ...prev, sellers: prev.sellers.filter((_, i) => i !== idx) }));
  const addBuyer = () =>
    setBuyersData((prev) => ({
      ...prev,
      buyers: [
        ...prev.buyers,
        {
          id: makeId(),
          name: "",
          city: "",
          segment: "",
          quote: "",
          spend: "",
          visits: "",
          image: "https://via.placeholder.com/400x500",
          href: "",
        },
      ],
    }));
  const removeBuyer = (idx: number) =>
    setBuyersData((prev) => ({ ...prev, buyers: prev.buyers.filter((_, i) => i !== idx) }));
  const addMilestone = () =>
    setTimelineData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: "", description: "", image: "https://via.placeholder.com/800x600" },
      ],
    }));
  const removeMilestone = (idx: number) =>
    setTimelineData((prev) => ({ ...prev, milestones: prev.milestones.filter((_, i) => i !== idx) }));
  const addArch = () =>
    setArchesData((prev) => ({
      ...prev,
      arches: [
        ...prev.arches,
        {
          city: "",
          year: "",
          highlight: "",
          image: "https://via.placeholder.com/900x700",
          href: "",
        },
      ],
    }));
  const removeArch = (idx: number) =>
    setArchesData((prev) => ({ ...prev, arches: prev.arches.filter((_, i) => i !== idx) }));
  const addStallImage = () =>
    setStallsData((prev) => ({
      ...prev,
      images: [...prev.images, { src: "https://via.placeholder.com/900x700", href: "/gallery" }],
    }));
  const removeStallImage = (idx: number) =>
    setStallsData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const addBuyerImage = () =>
    setBuyerMosaicData((prev) => ({
      ...prev,
      images: [...prev.images, { src: "https://via.placeholder.com/900x700", href: "/gallery" }],
    }));
  const removeBuyerImage = (idx: number) =>
    setBuyerMosaicData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const addVvip = () =>
    setVvipData((prev) => ({
      ...prev,
      guests: [
        ...prev.guests,
        {
          name: "",
          title: "",
          role: "",
          image: "https://via.placeholder.com/600x800",
          highlight: "",
          href: "",
        },
      ],
    }));
  const removeVvip = (idx: number) =>
    setVvipData((prev) => ({ ...prev, guests: prev.guests.filter((_, i) => i !== idx) }));
  const addFounder = () =>
    setFoundersData((prev) => ({
      ...prev,
      founders: [
        ...prev.founders,
        {
          name: "",
          title: "",
          era: "ICE 1.0",
          focus: "",
          image: "https://via.placeholder.com/600x800",
          highlight: "",
          href: "",
        },
      ],
    }));
  const removeFounder = (idx: number) =>
    setFoundersData((prev) => ({ ...prev, founders: prev.founders.filter((_, i) => i !== idx) }));
  const addCofounder = () =>
    setCofoundersData((prev) => ({
      ...prev,
      cofounders: [
        ...prev.cofounders,
        {
          name: "",
          track: "IGE",
          title: "",
          focus: "",
          image: "https://via.placeholder.com/600x800",
          highlight: "",
          href: "",
        },
      ],
    }));
  const removeCofounder = (idx: number) =>
    setCofoundersData((prev) => ({ ...prev, cofounders: prev.cofounders.filter((_, i) => i !== idx) }));
  const addCount = () =>
    setCountsData((prev) => ({
      stats: [...prev.stats, { value: 0, suffix: "", label: "" }],
    }));
  const removeCount = (idx: number) =>
    setCountsData((prev) => ({ stats: prev.stats.filter((_, i) => i !== idx) }));

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/hero`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ navItems, heroProducts: heroItems, heroContent }),
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Hero section updated");
    } catch (err: any) {
      setError(err.message || "Unable to save hero");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/hero/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setNavItems(data.navItems ?? []);
      setHeroItems(data.heroProducts ?? []);
      if (data.heroContent) {
        setHeroContent(data.heroContent);
      } else {
        setHeroContent({ title: "", subtitle: "", description: "" });
      }
      setSuccess("Restored default hero content");
    } catch (err: any) {
      setError(err.message || "Unable to restore hero");
    } finally {
      setSaving(false);
    }
  };

  const saveReview = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/review`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewData),
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Review section updated");
    } catch (err: any) {
      setError(err.message || "Unable to save review");
    } finally {
      setSaving(false);
    }
  };

  const restoreReview = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/review/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setReviewData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        images: data.images || [],
      });
      setSuccess("Restored default review content");
    } catch (err: any) {
      setError(err.message || "Unable to restore review");
    } finally {
      setSaving(false);
    }
  };

  const saveCelebs = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/celebrities`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(celebsData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Celebrities updated");
    } catch (err: any) {
      setError(err.message || "Unable to save celebrities");
    } finally {
      setSaving(false);
    }
  };

  const restoreCelebs = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/celebrities/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setCelebsData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        celebrities: data.celebrities || [],
      });
      setSuccess("Restored celebrities");
    } catch (err: any) {
      setError(err.message || "Unable to restore celebrities");
    } finally {
      setSaving(false);
    }
  };

  const saveBrands = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/brands/highlights`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(brandsData),
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Brand highlights updated");
    } catch (err: any) {
      setError(err.message || "Unable to save brands");
    } finally {
      setSaving(false);
    }
  };

  const restoreBrands = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/brands/highlights/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setBrandsData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        brands: data.brands || [],
      });
      setSuccess("Restored brand highlights");
    } catch (err: any) {
      setError(err.message || "Unable to restore brands");
    } finally {
      setSaving(false);
    }
  };

  const getAccessToken = async (base: string) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    const refreshed = await refreshAccessToken(base);
    if (!refreshed) {
      setError("Not authenticated. Please login again.");
      navigate("/admin/login");
    }
    return refreshed;
  };

  const refreshAccessToken = async (base: string) => {
    const refresh = localStorage.getItem("admin_refresh_token");
    if (!refresh) return null;
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      return null;
    }
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("admin_access_token", data.accessToken);
      return data.accessToken as string;
    }
    return null;
  };

  const saveSellers = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/sellers`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sellersData),
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Sellers updated");
    } catch (err: any) {
      setError(err.message || "Unable to save sellers");
    } finally {
      setSaving(false);
    }
  };

  const restoreSellers = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/sellers/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setSellersData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        sellers: data.sellers || [],
      });
      setSuccess("Restored sellers");
    } catch (err: any) {
      setError(err.message || "Unable to restore sellers");
    } finally {
      setSaving(false);
    }
  };

  const saveBuyers = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/buyers`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buyersData),
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Buyers updated");
    } catch (err: any) {
      setError(err.message || "Unable to save buyers");
    } finally {
      setSaving(false);
    }
  };

  const restoreBuyers = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/buyers/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setBuyersData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        buyers: data.buyers || [],
      });
      setSuccess("Restored buyers");
    } catch (err: any) {
      setError(err.message || "Unable to restore buyers");
    } finally {
      setSaving(false);
    }
  };

  const saveTimeline = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/timeline`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(timelineData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Timeline updated");
    } catch (err: any) {
      setError(err.message || "Unable to save timeline");
    } finally {
      setSaving(false);
    }
  };

  const restoreTimeline = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/timeline/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setTimelineData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        milestones: data.milestones || [],
      });
      setSuccess("Restored timeline");
    } catch (err: any) {
      setError(err.message || "Unable to restore timeline");
    } finally {
      setSaving(false);
    }
  };

  const saveArches = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/arches`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(archesData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Entrance arches updated");
    } catch (err: any) {
      setError(err.message || "Unable to save entrance arches");
    } finally {
      setSaving(false);
    }
  };

  const saveStalls = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/stalls`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(stallsData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Stalls mosaic updated");
    } catch (err: any) {
      setError(err.message || "Unable to save stalls");
    } finally {
      setSaving(false);
    }
  };

  const restoreStalls = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/stalls/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setStallsData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        images: data.images || [],
        stats: data.stats || [],
      });
      setSuccess("Restored stalls mosaic");
    } catch (err: any) {
      setError(err.message || "Unable to restore stalls");
    } finally {
      setSaving(false);
    }
  };

  const saveBuyerMosaic = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/buyer-mosaic`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buyerMosaicData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Buyer mosaic updated");
    } catch (err: any) {
      setError(err.message || "Unable to save buyer mosaic");
    } finally {
      setSaving(false);
    }
  };

  const restoreBuyerMosaic = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/buyer-mosaic/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setBuyerMosaicData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        images: data.images || [],
        stats: data.stats || [],
      });
      setSuccess("Restored buyer mosaic");
    } catch (err: any) {
      setError(err.message || "Unable to restore buyer mosaic");
    } finally {
      setSaving(false);
    }
  };

  const saveVvips = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/vvips`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vvipData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("VVIPs updated");
    } catch (err: any) {
      setError(err.message || "Unable to save VVIPs");
    } finally {
      setSaving(false);
    }
  };

  const restoreVvips = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/vvips/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setVvipData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        guests: data.guests || [],
      });
      setSuccess("Restored VVIPs");
    } catch (err: any) {
      setError(err.message || "Unable to restore VVIPs");
    } finally {
      setSaving(false);
    }
  };

  const saveFounders = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/founders`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(foundersData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Founders updated");
    } catch (err: any) {
      setError(err.message || "Unable to save founders");
    } finally {
      setSaving(false);
    }
  };

  const restoreFounders = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/founders/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setFoundersData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        founders: data.founders || [],
      });
      setSuccess("Restored founders");
    } catch (err: any) {
      setError(err.message || "Unable to restore founders");
    } finally {
      setSaving(false);
    }
  };

  const saveCofounders = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/cofounders`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cofoundersData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Co-founders updated");
    } catch (err: any) {
      setError(err.message || "Unable to save co-founders");
    } finally {
      setSaving(false);
    }
  };

  const restoreCofounders = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/cofounders/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setCofoundersData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        ctaLabel: data.ctaLabel || "",
        ctaHref: data.ctaHref || "",
        cofounders: data.cofounders || [],
      });
      setSuccess("Restored co-founders");
    } catch (err: any) {
      setError(err.message || "Unable to restore co-founders");
    } finally {
      setSaving(false);
    }
  };

  const saveCounts = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/counts`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(countsData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Counts updated");
    } catch (err: any) {
      setError(err.message || "Unable to save counts");
    } finally {
      setSaving(false);
    }
  };

  const restoreCounts = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/counts/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setCountsData({
        stats: data.stats || [],
      });
      setSuccess("Restored counts");
    } catch (err: any) {
      setError(err.message || "Unable to restore counts");
    } finally {
      setSaving(false);
    }
  };

  const saveDualCta = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/dual-cta`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dualCtaData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Dual CTAs updated");
    } catch (err: any) {
      setError(err.message || "Unable to save dual CTAs");
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }
      const attempt = async (token: string) =>
        fetch(`${base}/footer`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(footerData),
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Footer updated");
    } catch (err: any) {
      setError(err.message || "Unable to save footer");
    } finally {
      setSaving(false);
    }
  };

  const restoreFooter = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/footer/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setFooterData(data);
      setSuccess("Restored footer");
    } catch (err: any) {
      setError(err.message || "Unable to restore footer");
    } finally {
      setSaving(false);
    }
  };

  const restoreDualCta = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/dual-cta/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setDualCtaData({
        sellers: data.sellers || { eyebrow: "", title: "", description: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
        buyers: data.buyers || { eyebrow: "", title: "", description: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
      });
      setSuccess("Restored dual CTAs");
    } catch (err: any) {
      setError(err.message || "Unable to restore dual CTAs");
    } finally {
      setSaving(false);
    }
  };

  const restoreArches = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        return;
      }

      const attempt = async (token: string) =>
        fetch(`${base}/arches/restore`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      let res = await attempt(ensureToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Restore failed");
      }
      const data = await res.json();
      setArchesData({
        eyebrow: data.eyebrow || "",
        title: data.title || "",
        description: data.description || "",
        arches: data.arches || [],
      });
      setSuccess("Restored entrance arches");
    } catch (err: any) {
      setError(err.message || "Unable to restore entrance arches");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      navItems={[...staticNav, { name: "Admin", href: "/admin" }]}
      sections={sections}
      title="Admin Dashboard"
      description="Curate every section of the experience with a clean, modular editor."
    >
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <HeroEditor
        navItems={navItems}
        heroItems={heroItems}
        heroContent={heroContent}
        onNavChange={updateNav}
        onNavAdd={addNav}
        onNavRemove={removeNav}
        onHeroChange={updateHero}
        onHeroAdd={addHero}
        onHeroRemove={removeHero}
        onHeroContentChange={(key, value) => setHeroContent((prev) => ({ ...prev, [key]: value }))}
        onSave={save}
        onRestore={restoreDefaults}
        saving={saving}
        loading={loading}
      />

      <ReviewEditor
        data={reviewData}
        onChange={setReviewData}
        onSave={saveReview}
        onRestore={restoreReview}
        saving={saving}
        loading={loading}
      />

      <BrandEditor
        data={brandsData}
        onChange={setBrandsData}
        onAddBrand={addBrand}
        onRemoveBrand={removeBrand}
        onSave={saveBrands}
        onRestore={restoreBrands}
        saving={saving}
        loading={loading}
      />

          <CelebEditor
        data={celebsData}
        onChange={setCelebsData}
        onAdd={addCeleb}
        onRemove={removeCeleb}
        onSave={saveCelebs}
        onRestore={restoreCelebs}
        saving={saving}
        loading={loading}
      />

      <SellerEditor
        data={sellersData}
        onChange={setSellersData}
        onAdd={addSeller}
        onRemove={removeSeller}
        onSave={saveSellers}
        onRestore={restoreSellers}
        saving={saving}
        loading={loading}
      />

      <BuyerEditor
        data={buyersData}
        onChange={setBuyersData}
        onAdd={addBuyer}
        onRemove={removeBuyer}
        onSave={saveBuyers}
        onRestore={restoreBuyers}
        saving={saving}
        loading={loading}
      />

      <TimelineEditor
        data={timelineData}
        onChange={setTimelineData}
        onAdd={addMilestone}
        onRemove={removeMilestone}
        onSave={saveTimeline}
        onRestore={restoreTimeline}
        saving={saving}
        loading={loading}
      />

      <ArchesEditor
        data={archesData}
        onChange={setArchesData}
        onAdd={addArch}
        onRemove={removeArch}
        onSave={saveArches}
        onRestore={restoreArches}
        saving={saving}
        loading={loading}
      />

      <StallsEditor
        data={stallsData}
        onChange={setStallsData}
        onAddImage={addStallImage}
        onRemoveImage={removeStallImage}
        onSave={saveStalls}
        onRestore={restoreStalls}
        saving={saving}
        loading={loading}
      />

      <BuyerMosaicEditor
        data={buyerMosaicData}
        onChange={setBuyerMosaicData}
        onAddImage={addBuyerImage}
        onRemoveImage={removeBuyerImage}
        onSave={saveBuyerMosaic}
        onRestore={restoreBuyerMosaic}
        saving={saving}
        loading={loading}
      />

      <VvipEditor
        data={vvipData}
        onChange={setVvipData}
        onAdd={addVvip}
        onRemove={removeVvip}
        onSave={saveVvips}
        onRestore={restoreVvips}
        saving={saving}
        loading={loading}
      />

      <FoundersEditor
        data={foundersData}
        onChange={setFoundersData}
        onAdd={addFounder}
        onRemove={removeFounder}
        onSave={saveFounders}
        onRestore={restoreFounders}
        saving={saving}
        loading={loading}
      />

      <CoFoundersEditor
        data={cofoundersData}
        onChange={setCofoundersData}
        onAdd={addCofounder}
        onRemove={removeCofounder}
        onSave={saveCofounders}
        onRestore={restoreCofounders}
        saving={saving}
        loading={loading}
      />

      <CountEditor
        data={countsData}
        onChange={setCountsData}
        onAdd={addCount}
        onRemove={removeCount}
        onSave={saveCounts}
        onRestore={restoreCounts}
        saving={saving}
        loading={loading}
      />

      <DualCtaEditor
        data={dualCtaData}
        onChange={setDualCtaData}
        onSave={saveDualCta}
        onRestore={restoreDualCta}
        saving={saving}
        loading={loading}
      />

      <FooterEditor
        data={footerData}
        onChange={setFooterData}
        onSave={saveFooter}
        onRestore={restoreFooter}
        saving={saving}
        loading={loading}
      />

    </AdminLayout>
  );
};

export default AdminDashboard;
