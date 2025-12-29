import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { type AdminSectionLink } from "@/components/admin/AdminSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
  summary?: string;
  detail?: {
    headline?: string;
    summary?: string;
    heroImage?: string;
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

  const loadBrands = async (targetPage = 1, opts?: { category?: string; search?: string }) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("pageSize", String(pageSize));
    if (opts?.category && opts.category !== "All") params.set("category", opts.category);
    if (opts?.search) params.set("search", opts.search);

    try {
      const res = await fetch(`${base}/brands?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load brands");
      const data = (await res.json()) as BrandsResponse;
      setItems(data.data || []);
      setPage(targetPage);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCategories(["All", ...(data.filters?.categories || [])]);
    } catch (err: any) {
      setError(err.message || "Unable to load brands");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands(1, { category, search });
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const updateItem = (idx: number, key: keyof BrandItem, value: string) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        slug: "",
        name: "",
        logo: "",
        relationship: "",
        category: "",
        image: "",
        summary: "",
      },
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

  const getAccessToken = async (base: string) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken(base);
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

      for (const item of items) {
        const attempt = async (authToken: string) =>
          fetch(`${base}/brands/${item.slug}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(item),
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
      const res = await fetch(`${base}/brands/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.slug !== slug));
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

      <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="pl-9"
            />
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
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item, idx) => (
          <Card key={item.slug || idx} className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{item.name || "New brand"}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {item.slug && <Badge variant="outline">{item.slug}</Badge>}
                  {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  {item.relationship && <Badge>{item.relationship}</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.slug || "")}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
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
                <label className="text-xs text-muted-foreground">Image URL</label>
                <Input value={item.image} onChange={(e) => updateItem(idx, "image", e.target.value)} placeholder="https://..." />
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
                  <label className="text-xs text-muted-foreground">Detail hero image</label>
                  <Input
                    value={item.detail?.heroImage || ""}
                    onChange={(e) =>
                      setItems((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], detail: { ...next[idx].detail, heroImage: e.target.value } };
                        return next;
                      })
                    }
                    placeholder="https://..."
                  />
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
                    <Input
                      value={h.title}
                      onChange={(e) => updateHighlight(idx, hIdx, "title", e.target.value)}
                      placeholder="Headline"
                    />
                    <Input
                      value={h.body}
                      onChange={(e) => updateHighlight(idx, hIdx, "body", e.target.value)}
                      placeholder="Body copy"
                    />
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
                    <Input
                      value={m.label}
                      onChange={(e) => updateMetric(idx, mIdx, "label", e.target.value)}
                      placeholder="Metric label"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={m.value}
                        onChange={(e) => updateMetric(idx, mIdx, "value", e.target.value)}
                        placeholder="Metric value"
                      />
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
          </Card>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No brands yet. Add your first brand to begin.</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;
