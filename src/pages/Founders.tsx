import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FounderStory = {
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

type FounderItem = {
  id: string;
  name: string;
  title: string;
  era: string;
  focus: string;
  image: string;
  variants?: { key: string; path: string }[];
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: FounderStory;
};

type FoundersResponse = {
  data: FounderItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { eras?: string[] };
};

const PAGE_LIMIT = 24;
const defaultHero = {
  badge: "Founders",
  title: "Meet the founders of ICE",
  subheading: "Professional profiles of ICE 1.0 and 2.0—research-driven, with operational and creative highlights.",
};

const mediaBase = (import.meta.env.VITE_MEDIA_BASE_URL || "").replace(/\/$/, "");
const resolveMedia = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return mediaBase ? `${mediaBase}/${path}` : path;
};
const pickVariant = (variants?: { key: string; path: string }[], preferred: string[] = []) => {
  if (!variants?.length) return undefined;
  for (const key of preferred) {
    const hit = variants.find((v) => v.key === key);
    if (hit) return hit.path;
  }
  return variants[0]?.path;
};

const Founders = () => {
  const [items, setItems] = useState<FounderItem[]>([]);
  const [hero, setHero] = useState(defaultHero);
  const [era, setEra] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [eras, setEras] = useState<string[]>(["All"]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()[0];

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const loadHero = async () => {
    try {
      const res = await fetch(`${base}/founders/hero`);
      if (!res.ok) throw new Error("Failed");
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
    if (era !== "All") params.set("era", era);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/founders/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load founders");
      const data = (await res.json()) as FoundersResponse;
      const next = data.data || [];
      if (reset) {
        setItems(next);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setEras(["All", ...(data.filters?.eras || [])]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load founders");
      if (reset) {
        setItems([]);
        setEras(["All"]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialEra = searchParams.get("era");
    const initialSearch = searchParams.get("search");
    if (initialEra) setEra(initialEra);
    if (initialSearch) setSearch(initialSearch);
    loadHero();
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          load(false);
        }
      },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const filtered = useMemo(() => {
    return items.filter((f) => {
      const matchesEra = era === "All" || f.era === era;
      const q = search.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.focus.toLowerCase().includes(q) ||
        f.highlight.toLowerCase().includes(q);
      return matchesEra && matchesSearch;
    });
  }, [items, era, search]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={[...navItems, { name: "Founders", href: "/founders" }]} />

      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              {hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{hero.title}</h1>
            <p className="text-muted-foreground">{hero.subheading}</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[2fr,1fr] lg:grid-cols-[2fr,1fr,1fr] items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search founders by name, focus, era..."
                className="pl-9"
              />
            </div>
            <Select value={era} onValueChange={(v) => setEra(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Era" />
              </SelectTrigger>
              <SelectContent>
                {eras.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No founders matched your filters.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((founder, idx) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-lg shadow-primary/5"
                >
                  <Link to={`/founders/${founder.id}`} className="block h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resolveMedia(pickVariant(founder.variants, ["medium", "main", "thumb"]) || founder.image)}
                        alt={founder.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{founder.era}</Badge>
                        <Badge variant="outline">{founder.title}</Badge>
                      </div>
                      <h3 className="text-xl font-display font-semibold">{founder.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{founder.highlight}</p>
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        View profile
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoading && <div className="text-sm text-muted-foreground">Loading more founders...</div>}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Founders;
