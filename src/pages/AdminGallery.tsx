import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { type AdminSectionLink } from "@/components/admin/AdminSidebar";
import GalleryItemsEditor, { type GalleryItemAdmin, type GalleryArticleSection } from "@/components/admin/sections/GalleryItemsEditor";
import { adminNavLinks } from "@/data/admin";
import { AlertCircle, CheckCircle2, Filter, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const makeId = () => Math.random().toString(36).slice(2, 10);

type GalleryFilters = {
  years: string[];
  categories: string[];
  tags: string[];
  applied: { year: string | null; category: string | null; search: string | null; tag: string | null };
};

const AdminGallery = () => {
  const sections: AdminSectionLink[] = [
    { id: "gallery-hero", label: "Hero" },
    { id: "gallery-items", label: "Gallery Items" },
  ];
  const navItems = adminNavLinks;

  const [items, setItems] = useState<GalleryItemAdmin[]>([]);
  const [heroHeading, setHeroHeading] = useState("Legacy");
  const [heroAccent, setHeroAccent] = useState("Gallery");
  const [heroSubheading, setHeroSubheading] = useState("Browse curated moments from our past expos. Filter by year, category, or search for specific brands.");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GalleryFilters | null>(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const loadGallery = async (nextPage = 1, opts?: { search?: string; year?: string | null; category?: string | null; tag?: string | null }) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    if (opts?.search) params.set("search", opts.search);
    if (opts?.year) params.set("year", opts.year);
    if (opts?.category) params.set("category", opts.category);
    if (opts?.tag) params.set("tag", opts.tag);

    try {
      const res = await fetch(`${base}/gallery?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load gallery items");
      const data = await res.json();
      setItems((data.data || []).map(normalizeItem));
      setPage(nextPage);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? data.data?.length ?? 0);
      setFilters(data.filters || null);
      setYear(opts?.year ?? opts?.year === null ? null : data.filters?.applied?.year ?? null);
      setCategory(opts?.category ?? opts?.category === null ? null : data.filters?.applied?.category ?? null);
      setTag(opts?.tag ?? opts?.tag === null ? null : data.filters?.applied?.tag ?? null);
      setSearch(opts?.search ?? opts?.search === "" ? opts.search : data.filters?.applied?.search ?? "");
    } catch (err: any) {
      setError(err.message || "Unable to load gallery items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery(1, { search, year, category, tag });
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const updateItem = (idx: number, key: keyof GalleryItemAdmin, value: any) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const defaultVariants = [
    { key: "main", path: "" },
    { key: "medium", path: "" },
    { key: "thumb", path: "" },
  ];

  const normalizeItem = (item: any) => ({
    ...item,
    variants:
      item.variants && item.variants.length
        ? item.variants
        : defaultVariants.map((v) => ({ ...v, path: v.key === "main" ? item.image ?? "" : "" })),
  });

  const addItem = () =>
    setItems((prev) => [
      normalizeItem({
        id: makeId(),
        title: "",
        year: "",
        category: "",
        brand: "",
        image: "https://via.placeholder.com/1200x800",
        excerpt: "",
        article: [],
        likes: 0,
        comments: [],
        tags: [],
      }),
      ...prev,
    ]);

  const removeItem = async (idx: number) => {
    const target = items[idx];
    if (!target) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    // If the item is not persisted yet, just drop it locally.
    if (!target.id) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const token = await getAccessToken(base);
      if (!token) throw new Error("Not authenticated. Please login again.");
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/gallery/${target.id}`, {
          method: "DELETE",
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });
      let res = await attempt(token);
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        res = await attempt(refreshed);
      }
      if (!res || !res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((_, i) => i !== idx));
      setSuccess("Gallery item deleted");
    } catch (err: any) {
      setError(err.message || "Unable to delete item");
    } finally {
      setSaving(false);
    }
  };

  const addArticle = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const existing = next[idx];
      next[idx] = { ...existing, article: [...(existing.article || []), { heading: "", body: "" }] };
      return next;
    });

  const removeArticle = (idx: number, articleIdx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const existing = next[idx];
      next[idx] = { ...existing, article: existing.article.filter((_, i) => i !== articleIdx) };
      return next;
    });

  const updateArticle = (idx: number, articleIdx: number, key: keyof GalleryArticleSection, value: string) =>
    setItems((prev) => {
      const next = [...prev];
      const existing = next[idx];
      const article = [...existing.article];
      article[articleIdx] = { ...article[articleIdx], [key]: value };
      next[idx] = { ...existing, article };
      return next;
    });

  const applyFilters = () => {
    loadGallery(1, { search, year, category, tag });
  };

  const clearFilters = () => {
    setSearch("");
    setYear(null);
    setCategory(null);
    setTag(null);
    loadGallery(1, { search: "", year: null, category: null, tag: null });
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

  const getAccessToken = async (base: string) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken(base);
  };

  const saveGallery = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const ensureToken = await getAccessToken(base);
      if (!ensureToken) {
        setSaving(false);
        setError("Not authenticated. Please login again.");
        return;
      }

      // Save only the current page items individually to avoid wiping other pages.
      for (const item of items) {
        const cleanedVariants =
          item.variants
            ?.map((v) => ({ ...v, path: (v.path || v.fileName || "").trim(), fileName: (v.fileName || "").trim() }))
            .filter((v) => v.path || v.fileName) ?? [];

        const payload = { ...item, variants: cleanedVariants };

        const attempt = async (token: string) =>
          fetch(`${base}/gallery/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
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
      }
      setSuccess("Current page gallery items saved");
    } catch (err: any) {
      setError(err.message || "Unable to save gallery items");
    } finally {
      setSaving(false);
    }
  };

  const loadHero = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/gallery/hero`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHeroHeading(data.heading || heroHeading);
      setHeroAccent(data.accent || heroAccent);
      setHeroSubheading(data.subheading || heroSubheading);
    } catch {
      // keep defaults
    }
  };

  const saveHero = async () => {
    setHeroSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const token = await getAccessToken(base);
      if (!token) {
        setHeroSaving(false);
        setError("Not authenticated. Please login again.");
        return;
      }
      const attempt = async (auth: string) =>
        fetch(`${base}/gallery/hero`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` },
          body: JSON.stringify({ heading: heroHeading, accent: heroAccent, subheading: heroSubheading }),
        });
      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      setSuccess("Gallery hero updated");
    } catch (err: any) {
      setError(err.message || "Unable to save hero");
    } finally {
      setHeroSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Gallery Management"
      description="Curate every gallery entry and its detail content in one place."
      navItems={navItems}
      sections={sections}
    >
      <div id="gallery-hero" className="rounded-xl border border-border/70 bg-card/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Hero</p>
            <h3 className="text-lg font-semibold">Gallery hero text</h3>
          </div>
          <Button size="sm" onClick={saveHero} disabled={heroSaving}>
            {heroSaving ? "Saving..." : "Save hero"}
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Heading</label>
            <Input value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Accent (colored)</label>
            <Input value={heroAccent} onChange={(e) => setHeroAccent(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subheading</label>
            <Input value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/70 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filters & pagination
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, brand, or tags"
                className="pl-9"
              />
            </div>
          </div>
          <Select value={year ?? "all"} onValueChange={(v) => setYear(v === "all" ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {(filters?.years || []).map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(filters?.categories || []).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tag ?? "all"} onValueChange={(v) => setTag(v === "all" ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {(filters?.tags || []).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={applyFilters} disabled={loading}>
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={clearFilters} disabled={loading}>
            Reset
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Page {page} / {totalPages} • {total} items
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[12, 24, 48, 96].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1 || loading}
                onClick={() => loadGallery(page - 1, { search, year, category, tag })}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= totalPages || loading}
                onClick={() => loadGallery(page + 1, { search, year, category, tag })}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <GalleryItemsEditor
        items={items}
        onItemChange={updateItem}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onAddArticle={addArticle}
        onRemoveArticle={removeArticle}
        onArticleChange={updateArticle}
        onSave={saveGallery}
        saving={saving || loading}
      />
    </AdminLayout>
  );
};

export default AdminGallery;
