
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { galleryItems as fallbackGalleryItems, GalleryItem } from "@/data/gallery-items";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 24;
const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";

const toUrl = (pathOrUrl: string | undefined) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = mediaBase.replace(/\/$/, "");
  return `${base}/${pathOrUrl.replace(/^\/+/, "")}`;
};

const getImageUrl = (item: GalleryItem) => {
  const priority = ["main", "thumb", "medium"];
  for (const key of priority) {
    const v = item.variants?.find((v) => v.key === key);
    if (v?.path) return toUrl(v.path);
    if (v?.fileName) return toUrl(v.fileName);
  }
  return toUrl(item.image);
};

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "100px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden bg-muted">
      {visible && (
        <>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover object-top transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      )}
    </div>
  );
};

type GalleryHero = {
  heading: string;
  accent: string;
  subheading: string;
  image: string;
};

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [hero, setHero] = useState<GalleryHero>({
    heading: "Event",
    accent: "Gallery",
    subheading: "Explore our professional event photography portfolio across conferences, expos, launches and corporate events.",
    image: "",
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  // Fetch hero from admin
  useEffect(() => {
    fetch(`${base}/gallery/hero`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.heading) {
          setHero({
            heading: data.heading,
            accent: data.accent || "Gallery",
            subheading: data.subheading || "",
            image: data.image || "",
          });
        }
      })
      .catch(() => {});
  }, [base]);

  const fetchPage = useCallback(
    async (targetPage: number, reset = false) => {
      setIsFetching(true);
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("pageSize", String(ITEMS_PER_PAGE));
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      try {
        const res = await fetch(`${base}/gallery?${params.toString()}`);
        if (!res.ok) throw new Error("Gallery fetch failed");
        const data = await res.json();
        const nextItems: GalleryItem[] = (data.data ?? []).map((i: GalleryItem) => ({
          ...i,
          variants: i.variants ?? [{ key: "main", path: i.image }],
        }));
        if (reset) {
          setItems(nextItems.length ? nextItems : fallbackGalleryItems.slice(0, ITEMS_PER_PAGE));
        } else {
          setItems((prev) => [...prev, ...nextItems]);
        }
        setPage(targetPage);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setCategories(["all", ...(data.filters?.categories || [])]);
      } catch {
        if (reset) {
          setItems(fallbackGalleryItems.slice(0, ITEMS_PER_PAGE));
          setCategories(["all", ...new Set(fallbackGalleryItems.map((i) => i.category).filter(Boolean))]);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [base, category, search]
  );

  useEffect(() => {
    const handle = setTimeout(() => fetchPage(1, true), 200);
    return () => clearTimeout(handle);
  }, [category, search, fetchPage]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (loading || isFetching || !hasMore) return;
    setLoading(true);
    fetchPage(page + 1, false).finally(() => setLoading(false));
  }, [loading, isFetching, hasMore, fetchPage, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={navItems} />

      {/* Hero — from admin */}
      <section
        className="pt-32 pb-16 text-center relative"
        style={hero.image ? { backgroundImage: `url(${toUrl(hero.image)})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {hero.image && <div className="absolute inset-0 bg-black/50" />}
        <div className="relative z-10">
          <h1 className={`text-5xl font-bold mb-4 ${hero.image ? "text-white" : ""}`}>
            {hero.heading}{" "}
            <span className="text-primary">{hero.accent}</span>
          </h1>
          <p className={`max-w-xl mx-auto ${hero.image ? "text-white/80" : "text-muted-foreground"}`}>
            {hero.subheading}
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="pb-6">
        <div className="container-custom max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search events, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-background"
            />
          </div>
        </div>
      </section>

      {/* Category tabs — from admin categories */}
      <section className="pb-10">
        <div className="container-custom flex justify-center flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border text-sm transition ${
                category === cat ? "bg-primary text-white" : "bg-background hover:bg-muted"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-10 text-center">
        <Button size="lg" onClick={() => (window.location.href = "/contact")}>
          Request Photo Access
        </Button>
      </section>

      {/* Gallery Grid */}
      <section className="pb-20">
        <div className="container-custom">
          {items.length === 0 && !isFetching ? (
            <div className="text-center py-20 text-muted-foreground">No images found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    to={`/gallery/GalleryIndividuals?id=${encodeURIComponent(item.id)}`}
                    state={{ items, initialIndex: index }}
                    className="block border rounded-xl overflow-hidden hover:shadow-lg transition"
                  >
                    <LazyImage src={getImageUrl(item)} alt={item.title} />
                    <div className="p-4">
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                    
                      <p className="text-xs text-muted-foreground">Client: {item.brand || "Corporate"}</p>
                      <p className="text-xs text-muted-foreground">Year: {item.year}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="text-center mt-16">
            {(loading || isFetching) && (
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more images...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sample Pack CTA */}
      <section className="py-20 bg-muted/30 text-center">
        <h3 className="text-2xl font-semibold mb-4">Need High-Resolution Samples?</h3>
        <p className="text-muted-foreground mb-6">Request access to our professional photo sample pack.</p>
        <Button size="lg" onClick={() => (window.location.href = "/contact")}>
          Download Sample Pack
        </Button>
      </section>

      <Footer />
    </main>
  );
};

export default Gallery;
