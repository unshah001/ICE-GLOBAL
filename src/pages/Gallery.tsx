import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { galleryItems as fallbackGalleryItems, GalleryItem } from "@/data/gallery-items";
import { cn } from "@/lib/utils";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS_PER_PAGE = 24;

type GalleryResponse = {
  data: GalleryItem[];
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  filters?: {
    years: string[];
    categories: string[];
    tags: string[];
    applied: { year: string | null; category: string | null; search: string | null; tag: string | null };
  };
};

const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";
const toUrl = (pathOrUrl: string) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = mediaBase.replace(/\/$/, "");
  return `${base}/${pathOrUrl.replace(/^\/+/, "")}`;
};

const resolveImage = (item: GalleryItem) => {
  const variant = item.variants?.find((v) => v.key === "main") ?? item.variants?.[0];
  if (variant?.path) return toUrl(variant.path);
  if (variant?.fileName) return toUrl(variant.fileName);
  return item.image;
};

// Lazy loaded image component
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative bg-card", className)}>
      {isInView && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "w-full h-auto object-cover transition-all duration-500",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      )}
      {!isInView && (
        <div className="w-full aspect-[4/3] bg-muted animate-pulse" />
      )}
    </div>
  );
};

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>(
    fallbackGalleryItems.slice(0, ITEMS_PER_PAGE).map((i) => ({ ...i, variants: i.variants ?? [{ key: "main", path: i.image }] }))
  );
  const [hero, setHero] = useState<{ heading: string; accent: string; subheading: string }>({
    heading: "Legacy",
    accent: "Gallery",
    subheading: "Browse curated moments from our past expos. Filter by year, category, or search for specific brands.",
  });
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(fallbackGalleryItems.length);
  const [years, setYears] = useState<string[]>([
    "All Years",
    ...Array.from(new Set(fallbackGalleryItems.map((item) => item.year))).sort((a, b) => Number(b) - Number(a)),
  ]);
  const [categories, setCategories] = useState<string[]>(["All", ...new Set(fallbackGalleryItems.map((item) => item.category))]);
  const [tags, setTags] = useState<string[]>(["All"]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const searchParams = useSearchParams()[0];

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const fetchPage = useCallback(
    async (targetPage: number, reset = false) => {
      setIsFetching(true);
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("pageSize", String(ITEMS_PER_PAGE));
      if (selectedYear) params.set("year", selectedYear);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedTag) params.set("tag", selectedTag);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      try {
        const res = await fetch(`${base}/gallery?${params.toString()}`);
        if (!res.ok) throw new Error("Gallery fetch failed");
        const data = (await res.json()) as GalleryResponse;
        const nextItems = (data.data ?? []).map((i) => ({
          ...i,
          variants: i.variants ?? [{ key: "main", path: i.image }],
        }));
        if (reset) {
          setItems(
            nextItems.length
              ? nextItems
              : fallbackGalleryItems
                  .slice(0, ITEMS_PER_PAGE)
                  .map((i) => ({ ...i, variants: i.variants ?? [{ key: "main", path: i.image }] }))
          );
        } else {
          setItems((prev) => [...prev, ...nextItems]);
        }
        setFallbackMode(!nextItems.length);
        setPage(targetPage);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotal(data.pagination?.total ?? nextItems.length);
        setYears(["All Years", ...(data.filters?.years || [])]);
        setCategories(["All", ...(data.filters?.categories || [])]);
        setTags(["All", ...(data.filters?.tags || [])]);
      } catch {
        if (reset) {
          setItems(
            fallbackGalleryItems
              .slice(0, ITEMS_PER_PAGE)
              .map((i) => ({ ...i, variants: i.variants ?? [{ key: "main", path: i.image }] }))
          );
          setTotal(fallbackGalleryItems.length);
          setTotalPages(Math.ceil(fallbackGalleryItems.length / ITEMS_PER_PAGE));
          setYears([
            "All Years",
            ...Array.from(new Set(fallbackGalleryItems.map((item) => item.year))).sort((a, b) => Number(b) - Number(a)),
          ]);
          setCategories(["All", ...new Set(fallbackGalleryItems.map((item) => item.category))]);
          setTags(["All"]);
          setFallbackMode(true);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [base, selectedYear, selectedCategory, selectedTag, searchQuery]
  );

  useEffect(() => {
    const initialYear = searchParams.get("year");
    const initialCategory = searchParams.get("category");
    const initialTag = searchParams.get("tag");
    const initialSearch = searchParams.get("search");
    if (initialYear) setSelectedYear(initialYear === "All Years" ? null : initialYear);
    if (initialCategory) setSelectedCategory(initialCategory === "All" ? null : initialCategory);
    if (initialTag) setSelectedTag(initialTag === "All" ? null : initialTag);
    if (initialSearch) setSearchQuery(initialSearch);
    fetchPage(1, true);
  }, [fetchPage, searchParams]);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await fetch(`${base}/gallery/hero`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHero({
          heading: data.heading || "Legacy",
          accent: data.accent || "Gallery",
          subheading:
            data.subheading ||
            "Browse curated moments from our past expos. Filter by year, category, or search for specific brands.",
        });
      } catch {
        // fallback text
      }
    };
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchPage(1, true);
    }, 200);
    return () => clearTimeout(handle);
  }, [selectedYear, selectedCategory, selectedTag, searchQuery, fetchPage]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (isLoading || isFetching) return;
    // In fallback mode, simulate endless feed by looping fallback items with unique ids
    if (fallbackMode) {
      setIsLoading(true);
      setTimeout(() => {
        const looped = fallbackGalleryItems.map((item, idx) => ({
          ...item,
          id: `${item.id}-loop-${page}-${idx}`,
          variants: item.variants ?? [{ key: "main", path: item.image }],
        }));
        setItems((prev) => [...prev, ...looped]);
        setPage((prev) => prev + 1);
        setIsLoading(false);
      }, 200);
      return;
    }
    if (!hasMore) return;
    setIsLoading(true);
    fetchPage(page + 1, false).finally(() => setIsLoading(false));
  }, [fallbackMode, fetchPage, hasMore, isFetching, isLoading, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isFetching) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetching, loadMore]);

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <FloatingNavbar navItems={navItems} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground mb-6">
              {hero.heading}{" "}
              <span className="text-gradient">
                {hero.accent}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {hero.subheading}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-background">
        <div className="container-custom">
          <div className="rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/5 p-4 md:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  Refine gallery
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {items.length} / {total}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Page {page} of {totalPages}</span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,1fr] lg:grid-cols-[2fr,1fr,1fr,1fr] items-center">
                {/* Search */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search titles, brands, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-background/70 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Year */}
                <Select
                  value={selectedYear ?? "All Years"}
                  onValueChange={(v) => setSelectedYear(v === "All Years" ? null : v)}
                >
                  <SelectTrigger className="w-full rounded-xl bg-background/70 border-border text-foreground">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent align="start" className="border-border bg-card">
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category */}
                <Select
                  value={selectedCategory ?? "All"}
                  onValueChange={(v) => setSelectedCategory(v === "All" ? null : v)}
                >
                  <SelectTrigger className="w-full rounded-xl bg-background/70 border-border text-foreground">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent align="start" className="border-border bg-card max-h-64">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tag */}
                <Select
                  value={selectedTag ?? "All"}
                  onValueChange={(v) => setSelectedTag(v === "All" ? null : v)}
                >
                  <SelectTrigger className="w-full rounded-xl bg-background/70 border-border text-foreground">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent align="start" className="border-border bg-card max-h-64">
                    {tags.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No images found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedYear(null);
                  setSelectedCategory(null);
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className="break-inside-avoid group"
                  >
                    <Link to={`/gallery/${item.originalId ?? item.id}`} className="relative block overflow-hidden rounded-xl">
                      <LazyImage src={resolveImage(item)} alt={item.title} className="transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-display font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brand} • {item.year}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="mt-12 text-center">
                {(isLoading || isFetching) && (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading more images...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Gallery;
