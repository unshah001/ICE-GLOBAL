import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { brandHighlights, brandStories, navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";

const toUrl = (pathOrUrl: string) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = mediaBase.replace(/\/$/, "");
  return `${base}/${pathOrUrl.replace(/^\/+/, "")}`;
};

const resolveHero = (story?: BrandDetailStory) => {
  if (!story) return { primary: "", fallback: "" };

  const main =
    story.heroVariants?.find((v) => v.key === "main") ??
    story.heroVariants?.[0];

  const thumb = story.heroVariants?.find((v) => v.key === "thumb");

  const primary = main?.path
    ? toUrl(main.path)
    : main?.fileName
    ? toUrl(main.fileName)
    : story.heroImage ?? "";

  const fallback = thumb?.path
    ? toUrl(thumb.path)
    : thumb?.fileName
    ? toUrl(thumb.fileName)
    : primary;

  return { primary, fallback };
};

const normalizeBrand = (item: BrandItem): BrandItem => ({
  ...item,
  variants: item.variants ?? [{ key: "main", path: item.image }],
  detail: item.detail
    ? {
        ...item.detail,
        heroVariants:
          item.detail.heroVariants ?? [
            { key: "main", path: item.detail.heroImage },
          ],
      }
    : undefined,
});

type BrandDetailStory = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  heroVariants?: { key: string; path?: string; fileName?: string }[];
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
  impactDescription?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string }[];
  summary?: string;
  detail?: BrandDetailStory;
};

const BrandDetail = () => {
  const { slug } = useParams();

  const [brand, setBrand] = useState<BrandItem | null>(null);
  const [story, setStory] = useState<BrandDetailStory | null>(null);
  const [moreBrands, setMoreBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!slug) return;

    const base = import.meta.env.VITE_API_BASE_URL || "";
    const fallbackBrand =
      brandHighlights.find((b) => b.slug === slug) || null;
    const fallbackStory = brandStories[slug] || null;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/brands/${slug}`);
        if (!res.ok) throw new Error("Brand fetch failed");

        const data = (await res.json()) as BrandItem;
        const normalized = normalizeBrand(data);

        setBrand(normalized);
        setStory(normalized.detail || fallbackStory || null);
      } catch {
        const normalizedFallback = fallbackBrand
          ? normalizeBrand(fallbackBrand)
          : null;

        setBrand(normalizedFallback);
        setStory(normalizedFallback?.detail || fallbackStory);
      } finally {
        setLoading(false);
      }
    };

    const loadMore = async () => {
      try {
        const res = await fetch(`${base}/brands?page=1&pageSize=50`);
        if (!res.ok) throw new Error("List fetch failed");

        const data = await res.json();
        setMoreBrands(
          (data.data || [])
            .map(normalizeBrand)
            .filter((b: BrandItem) => b.slug !== slug)
        );
      } catch {
        setMoreBrands(
          brandHighlights
            .map(normalizeBrand)
            .filter((b) => b.slug !== slug)
        );
      }
    };

    load();
    loadMore();
  }, [slug]);

  useEffect(() => {
    if (!carouselApi) return;

    const timer = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [carouselApi]);

  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);

  const hero = useMemo(() => resolveHero(story || undefined), [story]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!brand || !story) return <NotFound />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end pb-16 pt-28 overflow-hidden">
        {hero.primary ? (
          <motion.img
            src={hero.primary}
            alt={brand.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ scale: imageScale, opacity: imageOpacity }}
            onError={(e) => {
              if (hero.fallback && e.currentTarget.src !== hero.fallback) {
                e.currentTarget.src = hero.fallback;
              } else {
                e.currentTarget.style.display = "none";
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <div className="container-custom relative z-10 space-y-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>

          <div className="flex gap-3">
            <Badge variant="secondary">{brand.relationship}</Badge>
            <Badge>{brand.category}</Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold">
            {story.headline || brand.name}
          </h1>

          <p className="text-lg text-muted-foreground">
            {story.summary || brand.summary}
          </p>

          <Button asChild variant="outline">
            <a href="#highlights" className="flex items-center gap-2">
              Read the story <ArrowUpRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section id="highlights" className="p-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {(story.highlights || []).map((section, i) => (
            <div key={i}>
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-3">Impact</h3>
            {(story.metrics || []).map((m) => (
              <div key={m.label}>
                <strong>{m.value}</strong> {m.label}
              </div>
            ))}
          </div>

          {/* CAROUSEL */}
          <Carousel setApi={setCarouselApi}>
            <CarouselContent>
              {moreBrands.map((item) => (
                <CarouselItem key={item.slug}>
                  <Link to={`/brands/${item.slug}`}>
                    <img src={item.image} alt={item.name} />
                    <p>{item.name}</p>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BrandDetail;