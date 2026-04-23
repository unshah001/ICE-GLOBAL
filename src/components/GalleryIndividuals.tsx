import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { Button } from "@/components/ui/button";
import { navItems } from "@/data/expo-data";
import { galleryItems as fallbackGalleryItems, type GalleryItem } from "@/data/gallery-items";

const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";

const toUrl = (pathOrUrl: string | undefined) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = mediaBase.replace(/\/$/, "");
  return `${base}/${pathOrUrl.replace(/^\/+/, "")}`;
};

const normalizeItem = (item: GalleryItem): GalleryItem => ({
  ...item,
  brand: item.brand || "Corporate",
  category: item.category || "Gallery",
  excerpt: item.excerpt || "Explore this gallery capture from our event archive.",
  article: Array.isArray(item.article) ? item.article : [],
  comments: Array.isArray(item.comments) ? item.comments : [],
  likes: typeof item.likes === "number" ? item.likes : 0,
  tags: Array.isArray(item.tags) ? item.tags : [],
  variants: item.variants?.length ? item.variants : [{ key: "main", path: item.image }],
});

const getImageUrl = (item: GalleryItem) => {
  const priority = ["main", "medium", "thumb"];
  for (const key of priority) {
    const variant = item.variants?.find((entry) => entry.key === key);
    if (variant?.path) return toUrl(variant.path);
    if (variant?.fileName) return toUrl(variant.fileName);
  }
  return toUrl(item.image);
};

type GalleryIndividualsState = {
  items?: GalleryItem[];
  initialIndex?: number;
};

const getSelectedIndex = (items: GalleryItem[], selectedId: string | null, initialIndex?: number) => {
  if (!items.length) return -1;
  if (selectedId) {
    const matchedIndex = items.findIndex((item) => item.id === selectedId);
    if (matchedIndex >= 0) return matchedIndex;
  }
  if (typeof initialIndex === "number" && initialIndex >= 0 && initialIndex < items.length) {
    return initialIndex;
  }
  return 0;
};

const GalleryIndividuals = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const routeState = (location.state as GalleryIndividualsState | null) ?? null;
  const selectedId = searchParams.get("id");

  const seededItems = useMemo(
    () => (routeState?.items?.length ? routeState.items.map(normalizeItem) : []),
    [routeState?.items],
  );

  const [items, setItems] = useState<GalleryItem[]>(seededItems);
  const [loading, setLoading] = useState(seededItems.length === 0);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    getSelectedIndex(seededItems, selectedId, routeState?.initialIndex),
  );

  useEffect(() => {
    if (!seededItems.length) return;
    setItems(seededItems);
    setLoading(false);
    setSelectedIndex(getSelectedIndex(seededItems, selectedId, routeState?.initialIndex));
  }, [routeState?.initialIndex, seededItems, selectedId]);

  useEffect(() => {
    if (seededItems.length || items.length) return;
    let cancelled = false;
    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "200");

        const res = await fetch(`${base}/gallery?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Gallery fetch failed");

        const data = await res.json();
        const nextItems = ((data.data ?? []) as GalleryItem[]).map(normalizeItem);
        const resolvedItems = nextItems.length ? nextItems : fallbackGalleryItems.map(normalizeItem);

        if (cancelled) return;
        setItems(resolvedItems);
        setSelectedIndex(getSelectedIndex(resolvedItems, selectedId, routeState?.initialIndex));
      } catch {
        if (cancelled) return;
        const fallbackItems = fallbackGalleryItems.map(normalizeItem);
        setItems(fallbackItems);
        setSelectedIndex(getSelectedIndex(fallbackItems, selectedId, routeState?.initialIndex));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadItems();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [base, items.length, routeState?.initialIndex, seededItems, selectedId]);

  useEffect(() => {
    if (!items.length || !selectedId) return;
    const nextIndex = getSelectedIndex(items, selectedId, routeState?.initialIndex);
    setSelectedIndex(nextIndex);
  }, [items, routeState?.initialIndex, selectedId]);

  const currentItem = selectedIndex >= 0 ? items[selectedIndex] : null;

  useEffect(() => {
    if (!currentItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length <= 1) return;

      if (event.key === "ArrowLeft") {
        const nextIndex = selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
        setSelectedIndex(nextIndex);
        setSearchParams({ id: items[nextIndex].id }, { replace: true });
      }

      if (event.key === "ArrowRight") {
        const nextIndex = selectedIndex === items.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(nextIndex);
        setSearchParams({ id: items[nextIndex].id }, { replace: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentItem, items, selectedIndex, setSearchParams]);

  const openImage = (index: number) => {
    const nextItem = items[index];
    if (!nextItem) return;
    setSelectedIndex(index);
    setSearchParams({ id: nextItem.id }, { replace: true });
  };

  const showPrev = () => {
    if (items.length <= 1) return;
    const nextIndex = selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
    openImage(nextIndex);
  };

  const showNext = () => {
    if (items.length <= 1) return;
    const nextIndex = selectedIndex === items.length - 1 ? 0 : selectedIndex + 1;
    openImage(nextIndex);
  };

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={navItems} />

      <section className="pt-32 pb-10">
        <div className="container-custom space-y-6">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Gallery Viewer</p>
              <h1 className="text-3xl font-bold text-foreground md:text-5xl">
                Explore each gallery image with full preview and quick details
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                The selected image stays on the left, while the right side shows the related content and a direct link to the full detail page.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Use the previous and next buttons or your keyboard arrows.</p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom">
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading gallery images...
            </div>
          ) : !currentItem ? (
            <div className="rounded-3xl border border-border/60 bg-card/10 px-6 py-20 text-center text-muted-foreground">
              No image selected.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-card/60 px-6 py-20 text-center text-muted-foreground">
              No images available right now.
            </div>
          ) : (
            <div className="mx-auto max-w-6xl space-y-10">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,0.88fr)] lg:items-start">
                <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-xl shadow-primary/5">
                  <div className="flex min-h-[280px] items-center justify-center bg-white p-4 dark:bg-neutral-950 md:min-h-[340px] md:p-5">
                    <img
                      src={getImageUrl(currentItem)}
                      alt={currentItem.title}
                      className="max-h-[490px] w-full rounded-[1.25rem] object-top md:max-h-[490px]"
                    />
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-lg shadow-primary/5 md:p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                      Image {selectedIndex + 1} of {items.length}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{currentItem.title}</h2>

                    <div className="mt-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={showPrev} disabled={items.length <= 1}>
                          <ChevronLeft className="h-4 w-4" />
                          Prev
                        </Button>
                        <Button variant="outline" onClick={showNext} disabled={items.length <= 1}>
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button asChild size="lg" className="w-full">
                        <Link
                          to={`/gallery/${currentItem.id}`}
                          state={{
                            returnTo: `/gallery/GalleryIndividuals?id=${encodeURIComponent(currentItem.id)}`,
                            returnLabel: "Back to gallery viewer",
                          }}
                        >
                          View full gallery details
                        </Link>
                      </Button>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">{currentItem.excerpt}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-background p-3.5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Client</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{currentItem.brand || "Corporate"}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background p-3.5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{currentItem.category}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background p-3.5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Year</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{currentItem.year}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background p-3.5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Likes</p>
                        <p className="mt-2 text-base font-semibold text-foreground">{currentItem.likes}</p>
                      </div>
                    </div>

                    {currentItem.tags.length > 0 ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {currentItem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border/60 bg-background px-3 py-1 text-sm text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-foreground">More gallery images</h3>
                  <p className="text-sm text-muted-foreground">Click any thumbnail to switch the preview.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {items.map((item, index) => {
                    const isActive = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openImage(index)}
                        className={`group overflow-hidden rounded-2xl border bg-card text-left transition ${
                          isActive ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={getImageUrl(item)}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.year}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default GalleryIndividuals;
