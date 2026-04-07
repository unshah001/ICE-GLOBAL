import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import {
  buyerTestimonials,
  type BuyerTestimonial,
} from "@/data/buyer-testimonials";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Search, Tags } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BuyerDetail = BuyerTestimonial & {
  detail?: {
    headline?: string;
    summary?: string;
    heroImage?: string;
    heroVariants?: { key: string; path: string }[];
    highlights?: { title: string; body: string }[];
    metrics?: { label: string; value: string }[];
    pullQuote?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  variants?: { key: string; path: string }[];
};

type BuyersResponse = {
  data: BuyerDetail[];
  cursor?: { next: string | null; limit: number };
  filters?: { cities?: string[]; segments?: string[] };
};

const PAGE_LIMIT = 24;
const defaultHero = {
  badge: "Buyer Stories",
  title: "Buyers who keep coming back",
  subheading:
    "Search and filter buyer journeys—spend, visits, and how ICE programming keeps them onsite.",
};

const mediaBase = (import.meta.env.VITE_MEDIA_BASE_URL || "").replace(
  /\/$/,
  "",
);
const resolveMedia = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return mediaBase ? `${mediaBase}/${path}` : path;
};
const pickVariant = (
  variants?: { key: string; path: string }[],
  preferred: string[] = [],
) => {
  if (!variants?.length) return undefined;
  for (const key of preferred) {
    const hit = variants.find((v) => v.key === key);
    if (hit) return hit.path;
  }
  return variants[0]?.path;
};

const Buyers = () => {
  const [items, setItems] = useState<BuyerDetail[]>(buyerTestimonials);
  const [hero, setHero] = useState(defaultHero);
  const [city, setCity] = useState<string>("All");
  const [segment, setSegment] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cities, setCities] = useState<string[]>([
    "All",
    ...new Set(buyerTestimonials.map((b) => b.city)),
  ]);
  const [segments, setSegments] = useState<string[]>([
    "All",
    ...new Set(buyerTestimonials.map((b) => b.segment)),
  ]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()[0];

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const loadHero = async () => {
    try {
      const res = await fetch(`${base}/buyers/hero`);
      if (!res.ok) throw new Error("Failed to load hero");
      const data = await res.json();
      setHero({
        badge: data.badge || defaultHero.badge,
        title: data.title || defaultHero.title,
        subheading: data.subheading || defaultHero.subheading,
      });
    } catch {
      setHero(defaultHero);
    }
  };


  const load = async (reset = true) => {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_LIMIT));
    if (!reset && cursor) params.set("cursor", cursor);
    if (city !== "All") params.set("city", city);
    if (segment !== "All") params.set("segment", segment);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/buyers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load buyers");
      const data = (await res.json()) as BuyersResponse;
      const next = data.data || [];
      if (reset) {
        setItems(next.length ? next : buyerTestimonials);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setCities(["All", ...(data.filters?.cities || cities.slice(1))]);
      setSegments(["All", ...(data.filters?.segments || segments.slice(1))]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load buyers");
      if (reset) {
        setItems(buyerTestimonials);
        setCities(["All", ...new Set(buyerTestimonials.map((b) => b.city))]);
        setSegments([
          "All",
          ...new Set(buyerTestimonials.map((b) => b.segment)),
        ]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialCity = searchParams.get("city");
    const initialSegment = searchParams.get("segment");
    const initialSearch = searchParams.get("search");
    if (initialCity) setCity(initialCity);
    if (initialSegment) setSegment(initialSegment);
    if (initialSearch) setSearch(initialSearch);
    loadHero();
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, segment, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          load(false);
        }
      },
      { rootMargin: "200px" },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      const matchesCity = city === "All" || b.city === city;
      const matchesSegment = segment === "All" || b.segment === segment;
      const q = search.toLowerCase();
      const matchesSearch =
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.segment.toLowerCase().includes(q) ||
        b.quote.toLowerCase().includes(q);
      return matchesCity && matchesSegment && matchesSearch;
    });
  }, [items, city, segment, search]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar
        navItems={[...navItems, { name: "Buyers", href: "/buyers" }]}
      />

      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
              <Tags className="w-4 h-4" />
              {hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              {hero.title}
            </h1>
            <p className="text-muted-foreground">{hero.subheading}</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[2fr,1fr,1fr] items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search buyers by name, city, segment..."
                className="pl-9"
              />
            </div>
            <Select value={city} onValueChange={(v) => setCity(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={segment} onValueChange={(v) => setSegment(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              No buyers matched your filters.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filtered.map((buyer, idx) => (
                <motion.div
                  key={buyer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(idx * 0.04, 0.3),
                  }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-lg shadow-primary/5"
                >
                  <Link to={`/buyers/${buyer.id}`} className="block h-full">
                    <div className="relative h-[560px] overflow-hidden rounded-t-2xl">
                      <img
                        src={resolveMedia(
                          pickVariant(buyer.variants, [
                            "medium",
                            "main",
                            "thumb",
                          ]) || buyer.image,
                        )}
                        alt={buyer.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {buyer.city}
                        </Badge>
                        <Badge variant="outline">{buyer.segment}</Badge>
                      </div>
                      <h3 className="text-xl font-display font-semibold">
                        {buyer.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {buyer.quote}
                      </p>
                      <div className="flex items-center gap-3 text-primary text-sm font-medium">
                        <span>{buyer.spend}</span>
                        <span>•</span>
                        <span>{buyer.visits}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoading && (
              <div className="text-sm text-muted-foreground">
                Loading more buyers...
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Buyers;
