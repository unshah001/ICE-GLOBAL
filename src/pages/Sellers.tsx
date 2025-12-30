import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { sellerTestimonials, type SellerTestimonial } from "@/data/seller-testimonials";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SellersResponse = {
  data: (SellerTestimonial & { variants?: { key: string; path: string }[] })[];
  cursor?: { next: string | null; limit: number };
  filters?: { companies?: string[] };
};

const PAGE_LIMIT = 24;
const defaultHero = {
  badge: "Seller Stories",
  title: "Sellers who grew with ICE",
  subheading: "Search and filter seller success stories—discover playbooks, outcomes, and how they used the platform.",
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

const Sellers = () => {
  const [items, setItems] = useState<(SellerTestimonial & { variants?: { key: string; path: string }[] })[]>(sellerTestimonials);
  const [hero, setHero] = useState(defaultHero);
  const [company, setCompany] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [companies, setCompanies] = useState<string[]>(["All", ...new Set(sellerTestimonials.map((s) => s.company))]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()[0];

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const loadHero = async () => {
    try {
      const res = await fetch(`${base}/sellers/hero`);
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
    if (company !== "All") params.set("company", company);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/sellers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load sellers");
      const data = (await res.json()) as SellersResponse;
      const next = data.data || [];
      if (reset) {
        setItems(next.length ? next : sellerTestimonials);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setCompanies(["All", ...(data.filters?.companies || companies.slice(1))]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load sellers");
      if (reset) {
        setItems(sellerTestimonials);
        setCompanies(["All", ...new Set(sellerTestimonials.map((s) => s.company))]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialCompany = searchParams.get("company");
    const initialSearch = searchParams.get("search");
    if (initialCompany) setCompany(initialCompany);
    if (initialSearch) setSearch(initialSearch);
    loadHero();
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, search]);

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
    return items.filter((s) => {
      const matchesCompany = company === "All" || s.company === company;
      const q = search.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.quote.toLowerCase().includes(q) ||
        s.outcome.toLowerCase().includes(q);
      return matchesCompany && matchesSearch;
    });
  }, [items, company, search]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={[...navItems, { name: "Sellers", href: "/sellers" }]} />

      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
              <Briefcase className="w-4 h-4" />
              {hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{hero.title}</h1>
            <p className="text-muted-foreground">{hero.subheading}</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[2fr,1fr] items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sellers by name, company, or outcomes..."
                className="pl-9"
              />
            </div>
            <Select value={company} onValueChange={(v) => setCompany(v)}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
            <div className="text-center text-muted-foreground py-16">No sellers matched your filters.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((seller, idx) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-lg shadow-primary/5"
                >
                  <Link to={`/sellers/${seller.id}`} className="block h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resolveMedia(pickVariant((seller as any).variants, ["medium", "main", "thumb"]) || seller.image)}
                        alt={seller.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{seller.company}</Badge>
                        <Badge variant="outline">{seller.role}</Badge>
                      </div>
                      <h3 className="text-xl font-display font-semibold">{seller.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{seller.quote}</p>
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        View story
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoading && <div className="text-sm text-muted-foreground">Loading more sellers...</div>}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Sellers;
