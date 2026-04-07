
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems, brandHighlights } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import BrandsHero from "./BrandsHero";

type BrandsResponse = {
  data: any[];
  filters?: { categories: string[] };
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
};

const PAGE_LIMIT = 24;
const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";

/* ✅ FIX 1: Handle Base64 + URL + relative path */
const toUrl = (pathOrUrl: string) => {
  if (!pathOrUrl) return "";

  // ✅ Base64 support (IMPORTANT FIX)
  if (pathOrUrl.startsWith("data:image")) return pathOrUrl;

  // ✅ Already full URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  // ✅ Relative path → attach base
  const base = mediaBase.replace(/\/$/, "");
  return base ? `${base}/${pathOrUrl.replace(/^\/+/, "")}` : pathOrUrl;
};

/* ✅ FIX 2: Safe variant selection */
const variantUrl = (item: any, keys: string[]) => {
  for (const key of keys) {
    const variant = item.variants?.find((v: any) => v.key === key);

    if (variant?.path) return toUrl(variant.path);
    if (variant?.fileName) return toUrl(variant.fileName);
  }
  return "";
};

/* Normalize data */
const normalizeBrand = (item: any) => ({
  ...item,
  variants: item.variants ?? [{ key: "main", path: item.image }],
  detail: item.detail
    ? {
        ...item.detail,
        heroVariants:
          item.detail.heroVariants ?? [{ key: "main", path: item.detail.heroImage }],
      }
    : undefined,
});

const Brands = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "All",
    ...Array.from(new Set(brandHighlights.map((b) => b.category))),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /* Load API */
  const load = useCallback(
    async (targetPage = 1, reset = true) => {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("pageSize", String(PAGE_LIMIT));
        params.set("sort", "newest");

        if (category !== "All") params.set("category", category);
        if (query.trim()) params.set("search", query.trim());

        const res = await fetch(`${base}/brands?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load brands");

        const data = (await res.json()) as BrandsResponse;
        const nextItems = (data.data || []).map(normalizeBrand);

        if (reset) setItems(nextItems);
        else setItems((prev) => [...prev, ...nextItems]);

        setCategories(["All", ...(data.filters?.categories || [])]);
        setPage(targetPage);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } catch (err: any) {
        setError(err.message || "Unable to load brands");
        setItems((prev) =>
          prev.length ? prev : brandHighlights.map(normalizeBrand)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [category, query]
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  /* Infinite scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && page < totalPages && !isLoading) {
          load(page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, isLoading, load]);

  /* Filter */
  const filtered = useMemo(() => {
    return items.filter((brand) => {
      const matchesCategory =
        category === "All" || brand.category === category;

      const matchesQuery =
        brand.name?.toLowerCase().includes(query.toLowerCase()) ||
        brand.relationship?.toLowerCase().includes(query.toLowerCase()) ||
        brand.category?.toLowerCase().includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [items, category, query]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={[...navItems, { name: "Brands", href: "/brands" }]} />

      <BrandsHero
        query={query}
        category={category}
        categories={categories}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}

      <section className="pb-16">
        <div className="container-custom">
          {isLoading && items.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              Loading brands...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              No brands matched your filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((brand, idx) => {
                const imageSrc =
                  variantUrl(brand, ["medium", "main", "thumb"]) ||
                  toUrl(brand.image);

                return (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(idx * 0.04, 0.3),
                    }}
                    viewport={{ once: true }}
                    className="group rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-lg shadow-primary/5"
                  >
                    <Link to={`/brands/${brand.slug}`} className="block h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={brand.name}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center font-display font-bold text-primary text-lg">
                          {brand.logo}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{brand.category}</Badge>
                          <Badge variant="outline">{brand.relationship}</Badge>
                        </div>

                        <h3 className="text-xl font-display font-semibold">
                          {brand.name}
                        </h3>

                        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                          View story
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoading && items.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Loading more brands...
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Brands;