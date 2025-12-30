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
import MediaUploadModal, { type MediaUploadResult } from "@/components/admin/MediaUploadModal";

type CofounderDetail = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  heroVariants?: { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number }[];
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type CofounderItem = {
  id: string;
  name: string;
  track: string;
  title: string;
  focus: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number }[];
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: CofounderDetail;
};

type CofoundersResponse = {
  data: CofounderItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { tracks?: string[] };
};

const PAGE_LIMIT = 24;
const defaultCopy = {
  moreEyebrow: "More co-founders",
  moreTitle: "Explore more co-founder profiles",
  moreDescription: "Scroll to reveal more co-founders—tap to open their detailed profiles.",
};
const defaultHero = {
  badge: "Co-Founders",
  title: "Meet the co-founders of IGE & IGN",
  subheading: "Professional, research-ready profiles across IGE and IGN—ops, media, partnerships, and experience design.",
};
const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `cofounder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminCofounders = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [{ id: "cofounders", label: "Co-Founders" }];

  const [items, setItems] = useState<CofounderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hero, setHero] = useState(defaultHero);
  const [savingHero, setSavingHero] = useState(false);
  const [copy, setCopy] = useState(defaultCopy);
  const [savingCopy, setSavingCopy] = useState(false);
  const [track, setTrack] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState<string[]>(["All"]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ idx: number; field: "image" | "hero" } | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  const defaultVariants = [
    { key: "main", path: "" },
    { key: "medium", path: "" },
    { key: "thumb", path: "" },
  ];

  const normalizeItem = (item: CofounderItem): CofounderItem => ({
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
              : defaultVariants.map((v) => ({ ...v, path: v.key === "main" ? item.detail?.heroImage ?? "" : "" })),
        }
      : undefined,
  });

  const load = async (reset = true) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_LIMIT));
    if (!reset && cursor) params.set("cursor", cursor);
    if (track !== "All") params.set("track", track);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/cofounders/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load co-founders");
      const data = (await res.json()) as CofoundersResponse;
      const next = (data.data || []).map(normalizeItem);
      if (reset) {
        setItems(next);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setTracks(["All", ...(data.filters?.tracks || [])]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load co-founders");
      if (reset) {
        setItems([]);
        setTracks(["All"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadHero(), loadCopy(), load(true)]);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, search]);

  const updateItem = (idx: number, key: keyof CofounderItem, value: any) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => [
      normalizeItem({
        id: createId(),
        name: "",
        track: "IGE",
        title: "",
        focus: "",
        image: "",
        highlight: "",
        href: "",
        detail: {},
      }),
      ...prev,
    ]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateDetail = (idx: number, key: keyof CofounderDetail, value: any) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], detail: { ...next[idx].detail, [key]: value } };
      return next;
    });

  const addHighlight = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      next[idx] = { ...next[idx], detail: { ...detail, highlights: [...(detail.highlights || []), { title: "", body: "" }] } };
      return next;
    });

  const updateHighlight = (idx: number, hIdx: number, key: "title" | "body", value: string) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      const highlights = [...(detail.highlights || [])];
      highlights[hIdx] = { ...highlights[hIdx], [key]: value };
      next[idx] = { ...next[idx], detail: { ...detail, highlights } };
      return next;
    });

  const removeHighlight = (idx: number, hIdx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      const highlights = (detail.highlights || []).filter((_, i) => i !== hIdx);
      next[idx] = { ...next[idx], detail: { ...detail, highlights } };
      return next;
    });

  const updateMetric = (idx: number, mIdx: number, key: "label" | "value", value: string) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      const metrics = [...(detail.metrics || [])];
      metrics[mIdx] = { ...metrics[mIdx], [key]: value };
      next[idx] = { ...next[idx], detail: { ...detail, metrics } };
      return next;
    });

  const addMetric = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
      next[idx] = { ...next[idx], detail: { ...detail, metrics: [...(detail.metrics || []), { label: "", value: "" }] } };
      return next;
    });

  const removeMetric = (idx: number, mIdx: number) =>
    setItems((prev) => {
      const next = [...prev];
      const detail = next[idx].detail || {};
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
      const res = await fetch(`${base}/cofounders/hero`);
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

  const saveHero = async () => {
    setSavingHero(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const token = await getAccessToken(base);
      if (!token) throw new Error("Not authenticated.");
      const attempt = async (authToken: string) =>
        fetch(`${base}/cofounders/hero`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(hero),
        });
      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) throw new Error("Unable to save hero");
      setSuccess("Hero updated");
    } catch (err: any) {
      setError(err.message || "Unable to save hero");
    } finally {
      setSavingHero(false);
    }
  };

  const loadCopy = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/cofounders/detail-copy`);
      if (!res.ok) throw new Error("Failed to load copy");
      const data = await res.json();
      setCopy({
        moreEyebrow: data.moreEyebrow || defaultCopy.moreEyebrow,
        moreTitle: data.moreTitle || defaultCopy.moreTitle,
        moreDescription: data.moreDescription || defaultCopy.moreDescription,
      });
    } catch {
      setCopy(defaultCopy);
    }
  };

  const saveCopy = async () => {
    setSavingCopy(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const token = await getAccessToken(base);
      if (!token) throw new Error("Not authenticated.");
      const attempt = async (authToken: string) =>
        fetch(`${base}/cofounders/detail-copy`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(copy),
        });
      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken(base);
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) throw new Error("Unable to save copy");
      setSuccess("Copy updated");
    } catch (err: any) {
      setError(err.message || "Unable to save copy");
    } finally {
      setSavingCopy(false);
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
      for (const item of items) {
        const cleanedVariants =
          item.variants
            ?.map((v) => ({ ...v, path: (v.path || v.fileName || "").trim(), fileName: (v.fileName || "").trim() }))
            .filter((v) => v.path || v.fileName) ?? [];
        const cleanedHeroVariants =
          item.detail?.heroVariants
            ?.map((v) => ({ ...v, path: (v.path || v.fileName || "").trim(), fileName: (v.fileName || "").trim() }))
            .filter((v) => v.path || v.fileName) ?? [];
        const payload = {
          ...item,
          variants: cleanedVariants,
          detail: item.detail ? { ...item.detail, heroVariants: cleanedHeroVariants } : undefined,
        };
        const attempt = async (authToken: string) =>
          fetch(`${base}/cofounders/${item.id}`, {
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
      }
      if (pendingDeletes.length) {
        const resDelete = await fetch(`${base}/media/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paths: Array.from(new Set(pendingDeletes)), reason: "cofounder-image-replace" }),
        });
        if (resDelete.ok) setPendingDeletes([]);
      }
      setSuccess("Co-founders saved");
    } catch (err: any) {
      setError(err.message || "Unable to save co-founders");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const token = await getAccessToken(base);
    if (!token) {
      setError("Not authenticated.");
      return;
    }
    try {
      const res = await fetch(`${base}/cofounders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Unable to delete co-founder");
    }
  };

  return (
    <AdminLayout
      title="Co-Founder Management"
      description="Manage co-founder profiles, highlights, and detail pages."
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

      <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Badge</label>
            <Input value={hero.badge} onChange={(e) => setHero((h) => ({ ...h, badge: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={hero.title} onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subheading</label>
            <Input value={hero.subheading} onChange={(e) => setHero((h) => ({ ...h, subheading: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={loadHero} disabled={loading}>
            Refresh hero
          </Button>
          <Button onClick={saveHero} disabled={savingHero}>
            <Save className="w-4 h-4 mr-2" />
            {savingHero ? "Saving..." : "Save hero"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">More section eyebrow</label>
            <Input
              value={copy.moreEyebrow}
              onChange={(e) => setCopy((c) => ({ ...c, moreEyebrow: e.target.value }))}
              placeholder="More co-founders"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section title</label>
            <Input
              value={copy.moreTitle}
              onChange={(e) => setCopy((c) => ({ ...c, moreTitle: e.target.value }))}
              placeholder="Explore more co-founder profiles"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section description</label>
            <Input
              value={copy.moreDescription}
              onChange={(e) => setCopy((c) => ({ ...c, moreDescription: e.target.value }))}
              placeholder="Scroll to reveal more co-founders..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={loadCopy} disabled={loading}>
            Refresh copy
          </Button>
          <Button onClick={saveCopy} disabled={savingCopy}>
            <Save className="w-4 h-4 mr-2" />
            {savingCopy ? "Saving..." : "Save copy"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 items-start md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search co-founders..."
              className="pl-9"
            />
          </div>
          <Select value={track} onValueChange={(v) => setTrack(v)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              {tracks.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add co-founder
            </Button>
            <Button onClick={saveItems} disabled={saving || loading}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => load(true)} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item, idx) => (
          <Card key={item.id} className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{item.name || "New co-founder"}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {item.track && <Badge variant="secondary">{item.track}</Badge>}
                  {item.title && <Badge variant="outline">{item.title}</Badge>}
                  {item.focus && <Badge>{item.focus}</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">ID</label>
                  <Input value={item.id} onChange={(e) => updateItem(idx, "id", e.target.value)} placeholder="cofounder-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Name" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="Co-Founder" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Track</label>
                  <Input value={item.track} onChange={(e) => updateItem(idx, "track", e.target.value)} placeholder="IGE / IGN" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Focus</label>
                  <Input value={item.focus} onChange={(e) => updateItem(idx, "focus", e.target.value)} placeholder="Ops, Media" />
                </div>
              </div>
              <div>
              <label className="text-xs text-muted-foreground">Highlight</label>
              <Input value={item.highlight} onChange={(e) => updateItem(idx, "highlight", e.target.value)} placeholder="Signature achievement" />
            </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Image</label>
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
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">LinkedIn</label>
                <Input
                  value={item.social?.linkedin || ""}
                    onChange={(e) => updateItem(idx, "social", { ...item.social, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Twitter</label>
                  <Input
                    value={item.social?.twitter || ""}
                    onChange={(e) => updateItem(idx, "social", { ...item.social, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Website</label>
                  <Input
                    value={item.social?.website || ""}
                    onChange={(e) => updateItem(idx, "social", { ...item.social, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Image URL</label>
                <Input value={item.image} onChange={(e) => updateItem(idx, "image", e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Detail headline</label>
                  <Input
                    value={item.detail?.headline || ""}
                    onChange={(e) => updateDetail(idx, "headline", e.target.value)}
                    placeholder="Ops that scaled"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Detail summary</label>
                  <Input
                    value={item.detail?.summary || ""}
                    onChange={(e) => updateDetail(idx, "summary", e.target.value)}
                    placeholder="Profile intro"
                  />
                </div>
            </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Hero image</label>
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
              <div>
                <label className="text-xs text-muted-foreground">Pull quote</label>
                <Input
                  value={item.detail?.pullQuote || ""}
                  onChange={(e) => updateDetail(idx, "pullQuote", e.target.value)}
                  placeholder="Signature quote"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">CTA label</label>
                  <Input
                    value={item.detail?.ctaLabel || ""}
                    onChange={(e) => updateDetail(idx, "ctaLabel", e.target.value)}
                    placeholder="View profile"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CTA href</label>
                  <Input
                    value={item.detail?.ctaHref || ""}
                    onChange={(e) => updateDetail(idx, "ctaHref", e.target.value)}
                    placeholder="/cofounders/ritika"
                  />
                </div>
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
                      placeholder="Highlight title"
                    />
                    <Input
                      value={h.body}
                      onChange={(e) => updateHighlight(idx, hIdx, "body", e.target.value)}
                      placeholder="Highlight body"
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
            </CardContent>
          </Card>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No co-founders yet. Add your first co-founder to begin.</p>}
        {hasMore && (
          <Button variant="outline" onClick={() => load(false)} disabled={loading}>
            Load more
          </Button>
        )}
      </div>

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

export default AdminCofounders;
