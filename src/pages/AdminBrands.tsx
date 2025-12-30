import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { type AdminSectionLink } from "@/components/admin/AdminSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, Search, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MediaUploadModal, { type MediaUploadResult } from "@/components/admin/MediaUploadModal";
import { toast } from "@/components/ui/sonner";

type Variant = { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number };

type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
  variants?: Variant[];
  summary?: string;
  detail?: {
    headline?: string;
    summary?: string;
    heroImage?: string;
    heroVariants?: Variant[];
    highlights?: { title: string; body: string }[];
    metrics?: { label: string; value: string }[];
    pullQuote?: string;
    ctaLabel?: string;
    ctaHref?: string;
    impactDescription?: string;
  };
};

type BrandsResponse = {
  data: BrandItem[];
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  filters?: { categories: string[] };
};

const defaultVariants: Variant[] = [
  { key: "main", path: "" },
  { key: "medium", path: "" },
  { key: "thumb", path: "" },
];

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeItem = (item: any): BrandItem => ({
  ...item,
  variants:
    item.variants && item.variants.length
      ? item.variants
      : defaultVariants.map((v) => ({ ...v, path: v.key === "main" ? item.image ?? "" : "" })),
  detail: item.detail
    ? {
        ...item.detail,
        heroVariants:
          item.detail.heroVariants && item.detail.heroVariants.length
            ? item.detail.heroVariants
            : defaultVariants.map((v) => ({ ...v, path: v.key === "main" ? item.detail.heroImage ?? "" : "" })),
      }
    : undefined,
});

const AdminBrands = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [
    { id: "brands-hero", label: "Hero" },
    { id: "brands", label: "Brands" },
  ];

  const [items, setItems] = useState<BrandItem[]>([]);
  const [heroBadge, setHeroBadge] = useState("Partner Brands");
  const [heroTitle, setHeroTitle] = useState("Brands that trust ICE Exhibitions");
  const [heroSubheading, setHeroSubheading] = useState(
    "Explore our partner roster—long-term collaborators, headline sponsors, and innovators who shaped the expo experience."
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name-asc" | "name-desc">("newest");
  const [uploadTarget, setUploadTarget] = useState<{ idx: number; field: "image" | "hero" } | null>(null);
  const [originalMap, setOriginalMap] = useState<Record<string, string>>({});
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  const loadBrands = async (targetPage = 1, opts?: { category?: string; search?: string }) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("pageSize", String(pageSize));
    if (opts?.category && opts.category !== "All") params.set("category", opts.category);
    if (opts?.search) params.set("search", opts.search);
    params.set("sort", sort);

    try {
      const res = await fetch(`${base}/brands?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load brands");
      const data = (await res.json()) as BrandsResponse;
      const normalized = (data.data || []).map(normalizeItem);
      setItems(normalized);
      const map: Record<string, string> = {};
      normalized.forEach((b) => {
        if (b.slug) map[b.slug] = JSON.stringify(b);
      });
      setOriginalMap(map);
      setPage(targetPage);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCategories(["All", ...(data.filters?.categories || [])]);
    } catch (err: any) {
      setError(err.message || "Unable to load brands");
      setItems([]);
      setPendingDeletes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands(1, { category, search });
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, sort]);

  const updateItem = (idx: number, key: keyof BrandItem, value: string) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => [
      normalizeItem({
        slug: "",
        name: "",
        logo: "",
        relationship: "",
        category: "",
        image: "",
        summary: "",
        detail: { heroImage: "" },
      }),
      ...prev,
    ]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const addHighlight = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      next[idx] = {
        ...next[idx],
        detail: { ...detail, highlights: [...(detail.highlights || []), { title: "", body: "" }] },
      };
      return next;
    });

  const updateHighlight = (idx: number, hIdx: number, key: "title" | "body", value: string) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || { highlights: [] };
      const highlights = [...(detail.highlights || [])];
      highlights[hIdx] = { ...highlights[hIdx], [key]: value };
      next[idx] = { ...next[idx], detail: { ...detail, highlights } };
      return next;
    });

  const removeHighlight = (idx: number, hIdx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || { highlights: [] };
      const highlights = (detail.highlights || []).filter((_, i) => i !== hIdx);
      next[idx] = { ...next[idx], detail: { ...detail, highlights } };
      return next;
    });

  const updateMetric = (idx: number, mIdx: number, key: "label" | "value", value: string) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || { metrics: [] };
      const metrics = [...(detail.metrics || [])];
      metrics[mIdx] = { ...metrics[mIdx], [key]: value };
      next[idx] = { ...next[idx], detail: { ...detail, metrics } };
      return next;
    });

  const addMetric = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      next[idx] = {
        ...next[idx],
        detail: { ...detail, metrics: [...(detail.metrics || []), { label: "", value: "" }] },
      };
      return next;
    });

  const removeMetric = (idx: number, mIdx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || { metrics: [] };
      const metrics = (detail.metrics || []).filter((_, i) => i !== mIdx);
      next[idx] = { ...next[idx], detail: { ...detail, metrics } };
      return next;
    });

  const refreshAccessToken = async (base: string) => {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) return null;
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
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

  const loadHero = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/brands/hero`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHeroBadge(data.badge || heroBadge);
      setHeroTitle(data.title || heroTitle);
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
        setError("Not authenticated.");
        return;
      }
      const attempt = async (authToken: string) =>
        fetch(`${base}/brands/hero`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ badge: heroBadge, title: heroTitle, subheading: heroSubheading }),
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
      setSuccess("Brands hero updated");
    } catch (err: any) {
      setError(err.message || "Unable to save hero");
    } finally {
      setHeroSaving(false);
    }
  };

  const saveItems = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const token = await getAccessToken(base);
      if (!token) {
        setSaving(false);
        setError("Not authenticated.");
        return;
      }

      const serialize = (item: BrandItem) => JSON.stringify(item);
      const changedItems = items.filter((item) => {
        const snapshot = item.slug ? originalMap[item.slug] : null;
        const normalized = normalizeItem(item);
        return !snapshot || snapshot !== serialize(normalized);
      });

      if (!changedItems.length) {
        setSuccess("No changes to save");
        return;
      }

      for (const item of changedItems) {
        const { _id, createdAt, updatedAt, ...rest } = item as any;

        const slug = rest.slug && rest.slug.trim().length ? rest.slug : slugify(rest.name || "");
        if (!slug) {
          throw new Error("Slug is required. Please provide a slug or name for each brand.");
        }

        const cleanedVariants =
          rest.variants
            ?.map((v: Variant) => ({ ...v, path: (v.path || v.fileName || "").trim(), fileName: (v.fileName || "").trim() }))
            .filter((v: Variant) => v.path || v.fileName) ?? [];
        const cleanedHeroVariants =
          rest.detail?.heroVariants
            ?.map((v: Variant) => ({ ...v, path: (v.path || v.fileName || "").trim(), fileName: (v.fileName || "").trim() }))
            .filter((v: Variant) => v.path || v.fileName) ?? [];

        const payload = {
          ...rest,
          slug,
          variants: cleanedVariants,
          detail: rest.detail ? { ...rest.detail, heroVariants: cleanedHeroVariants } : undefined,
        };

        const attempt = async (authToken: string) =>
          fetch(`${base}/brands/${slug}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
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

        if (rest.slug) {
          setOriginalMap((prev) => ({ ...prev, [rest.slug]: serialize(normalizeItem(rest as BrandItem)) }));
        }
      }

      if (deletedPaths.length) {
        const base = import.meta.env.VITE_API_BASE_URL || "";
        const token = await getAccessToken(base);
        const res = await fetch(`${base}/media/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ paths: Array.from(new Set(deletedPaths)), reason: "brand-image-replace" }),
        });
        if (!res.ok) {
          toast.error("Some old media could not be queued for deletion");
        } else {
          setPendingDeletes([]);
        }
      }

      setSuccess("Brands saved");
    } catch (err: any) {
      setError(err.message || "Unable to save brands");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (slug: string) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const token = await getAccessToken(base);
    if (!token) {
      setError("Not authenticated.");
      return;
    }
    try {
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/brands/${slug}`, {
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
      setItems((prev) => prev.filter((item) => item.slug !== slug));
      setOriginalMap((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Unable to delete brand");
    }
  };

  return (
    <AdminLayout
      title="Brand Management"
      description="Manage all partner brands, categories, and their showcase content."
      navItems={navItems}
      sections={sections}
    >
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

      <div id="brands-hero" className="rounded-xl border border-border/60 bg-card/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Hero</p>
            <h3 className="text-lg font-semibold">Brands hero text</h3>
          </div>
          <Button size="sm" onClick={saveHero} disabled={heroSaving}>
            {heroSaving ? "Saving..." : "Save hero"}
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Badge</label>
            <Input value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Subheading</label>
            <Input value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)} />
          </div>
        </div>
      </div>

      <div id="brands" className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="pl-9" />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[140px]">
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
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add brand
            </Button>
            <Button onClick={saveItems} disabled={saving || loading}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => loadBrands(page, { category, search })} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Page {page} of {totalPages}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1 || loading}
              onClick={() => loadBrands(Math.max(1, page - 1), { category, search })}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages || loading}
              onClick={() => loadBrands(page + 1, { category, search })}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Accordion type="multiple" className="grid gap-4">
        {items.map((item, idx) => (
          <AccordionItem key={item.slug || idx} value={item.slug || `brand-${idx}`} className="rounded-xl border border-border/70 bg-card/80 px-4">
            <AccordionTrigger className="py-4 text-left">
              <div className="flex items-center gap-3">
                <ChevronDown className="w-4 h-4 shrink-0" />
                <div className="space-y-1">
                  <div className="font-semibold">{item.name || "New brand"}</div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {item.slug && <Badge variant="outline">{item.slug}</Badge>}
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                    {item.relationship && <Badge>{item.relationship}</Badge>}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex justify-end mb-3">
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.slug || "")}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="space-y-3 p-0">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input value={item.slug} onChange={(e) => updateItem(idx, "slug", e.target.value)} placeholder="techvision-labs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="TechVision Labs" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Logo (text/mark)</label>
                    <Input value={item.logo} onChange={(e) => updateItem(idx, "logo", e.target.value)} placeholder="TV" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Relationship</label>
                    <Input value={item.relationship} onChange={(e) => updateItem(idx, "relationship", e.target.value)} placeholder="Headline Sponsor" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Category</label>
                    <Input value={item.category} onChange={(e) => updateItem(idx, "category", e.target.value)} placeholder="Technology" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Image path (auto-filled)</label>
                    <Button variant="secondary" size="sm" onClick={() => setUploadTarget({ idx, field: "image" })}>
                      Upload
                    </Button>
                  </div>
                  <Input value={item.image} readOnly placeholder="Upload to fill automatically" />
                  <div className="grid md:grid-cols-3 gap-2 mt-2">
                    {(item.variants ?? []).map((variant, vIdx) => (
                      <div key={`${variant.key}-${vIdx}`} className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Badge variant="secondary">{variant.key}</Badge>
                          <span>Path</span>
                        </label>
                        <Input value={variant.path || variant.fileName || ""} readOnly />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Summary</label>
                  <Input
                    value={item.summary || ""}
                    onChange={(e) => updateItem(idx, "summary", e.target.value)}
                    placeholder="One-liner for the brand story."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Detail headline</label>
                    <Input
                      value={item.detail?.headline || ""}
                      onChange={(e) =>
                        setItems((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], detail: { ...next[idx].detail, headline: e.target.value } };
                          return next;
                        })
                      }
                      placeholder="Spatial-first product launches..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">Detail hero image</label>
                      <Button variant="secondary" size="sm" onClick={() => setUploadTarget({ idx, field: "hero" })}>
                        Upload
                      </Button>
                    </div>
                    <Input value={item.detail?.heroImage || ""} readOnly placeholder="Upload to fill automatically" />
                    <div className="grid md:grid-cols-3 gap-2 mt-2">
                      {(item.detail?.heroVariants ?? []).map((variant, vIdx) => (
                        <div key={`${variant.key}-${vIdx}`} className="space-y-1">
                          <label className="text-xs text-muted-foreground flex items-center gap-2">
                            <Badge variant="secondary">{variant.key}</Badge>
                            <span>Path</span>
                          </label>
                          <Input value={variant.path || variant.fileName || ""} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Detail summary</label>
                  <Input
                    value={item.detail?.summary || ""}
                    onChange={(e) =>
                      setItems((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], detail: { ...next[idx].detail, summary: e.target.value } };
                        return next;
                      })
                    }
                    placeholder="Short paragraph for the brand detail page."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Pull quote</label>
                  <Input
                    value={item.detail?.pullQuote || ""}
                    onChange={(e) =>
                      setItems((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], detail: { ...next[idx].detail, pullQuote: e.target.value } };
                        return next;
                      })
                    }
                    placeholder="Signature quote shown in story cards."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Highlights</p>
                    <Button variant="outline" size="sm" onClick={() => addHighlight(idx)}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  {(item.detail?.highlights || []).map((h, hIdx) => (
                    <div key={hIdx} className="border border-border/60 rounded-xl p-3 space-y-2">
                      <Input value={h.title} onChange={(e) => updateHighlight(idx, hIdx, "title", e.target.value)} placeholder="Headline" />
                      <Input value={h.body} onChange={(e) => updateHighlight(idx, hIdx, "body", e.target.value)} placeholder="Body copy" />
                      <Button variant="ghost" size="sm" onClick={() => removeHighlight(idx, hIdx)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Metrics</p>
                    <Button variant="outline" size="sm" onClick={() => addMetric(idx)}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  {(item.detail?.metrics || []).map((m, mIdx) => (
                    <div key={mIdx} className="grid md:grid-cols-2 gap-2 items-center">
                      <Input value={m.label} onChange={(e) => updateMetric(idx, mIdx, "label", e.target.value)} placeholder="Metric label" />
                      <div className="flex gap-2">
                        <Input value={m.value} onChange={(e) => updateMetric(idx, mIdx, "value", e.target.value)} placeholder="Metric value" />
                        <Button variant="ghost" size="icon" onClick={() => removeMetric(idx, mIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Impact description</label>
                  <Input
                    value={item.detail?.impactDescription || ""}
                    onChange={(e) =>
                      setItems((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], detail: { ...next[idx].detail, impactDescription: e.target.value } };
                        return next;
                      })
                    }
                    placeholder="Portable racks and edge demos let teams deploy in minutes on-site."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">CTA label</label>
                    <Input
                      value={item.detail?.ctaLabel || ""}
                      onChange={(e) =>
                        setItems((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], detail: { ...next[idx].detail, ctaLabel: e.target.value } };
                          return next;
                        })
                      }
                      placeholder="Plan a showcase with us"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">CTA href</label>
                    <Input
                      value={item.detail?.ctaHref || ""}
                      onChange={(e) =>
                        setItems((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], detail: { ...next[idx].detail, ctaHref: e.target.value } };
                          return next;
                        })
                      }
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No brands yet. Add your first brand to begin.</p>}
      </Accordion>

      <MediaUploadModal
        open={uploadTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUploadTarget(null);
        }}
        onUploaded={(result: MediaUploadResult) => {
          if (uploadTarget === null) return;
          const { idx, field } = uploadTarget;
          const prevVariants = field === "image" ? items[idx]?.variants || [] : items[idx]?.detail?.heroVariants || [];
          const prevPaths = prevVariants.map((v) => v.path || v.fileName).filter(Boolean) as string[];
          const mainVariant = result.variants.find((v) => v.key === "main") ?? result.variants[0];
          const imagePath = mainVariant?.path || mainVariant?.fileName || items[idx]?.image;
          if (field === "image") {
            updateItem(idx, "image", imagePath);
            setItems((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], variants: result.variants };
              return next;
            });
          } else {
            setItems((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], detail: { ...next[idx].detail, heroImage: imagePath, heroVariants: result.variants } };
              return next;
            });
          }
          setPendingDeletes((prev) => [...prev, ...prevPaths]);
          setUploadTarget(null);
        }}
      />
    </AdminLayout>
  );
};

export default AdminBrands;
