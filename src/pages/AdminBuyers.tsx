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

type BuyerDetail = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type BuyerItem = {
  id: string;
  name: string;
  city: string;
  segment: string;
  quote: string;
  spend: string;
  visits: string;
  image: string;
  href?: string;
  detail?: BuyerDetail;
};

type BuyersResponse = {
  data: BuyerItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { cities?: string[]; segments?: string[] };
};

const PAGE_LIMIT = 24;
const defaultHero = {
  badge: "Buyer Stories",
  title: "Buyers who keep coming back",
  subheading: "Search and filter buyer journeys—spend, visits, and how ICE programming keeps them onsite.",
};
const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `buyer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminBuyers = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [{ id: "buyers", label: "Buyers" }];

  const [items, setItems] = useState<BuyerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hero, setHero] = useState(defaultHero);
  const [savingHero, setSavingHero] = useState(false);
  const [city, setCity] = useState<string>("All");
  const [segment, setSegment] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState<string[]>(["All"]);
  const [segments, setSegments] = useState<string[]>(["All"]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const load = async (reset = true) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_LIMIT));
    if (!reset && cursor) params.set("cursor", cursor);
    if (city !== "All") params.set("city", city);
    if (segment !== "All") params.set("segment", segment);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/buyers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load buyers");
      const data = (await res.json()) as BuyersResponse;
      const next = data.data || [];
      if (reset) {
        setItems(next);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setCities(["All", ...(data.filters?.cities || [])]);
      setSegments(["All", ...(data.filters?.segments || [])]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load buyers");
      if (reset) {
        setItems([]);
        setCities(["All"]);
        setSegments(["All"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadHero(), load(true)]);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, segment, search]);

  const updateItem = (idx: number, key: keyof BuyerItem, value: any) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: createId(),
        name: "",
        city: "",
        segment: "",
        quote: "",
        spend: "",
        visits: "",
        image: "",
        href: "",
        detail: {},
      },
    ]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateDetail = (idx: number, key: keyof BuyerDetail, value: any) =>
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
      const res = await fetch(`${base}/buyers/hero`);
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

  const saveHero = async () => {
    setSavingHero(true);
    setError("");
    setSuccess("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";
      const token = await getAccessToken(base);
      if (!token) throw new Error("Not authenticated.");
      const attempt = async (authToken: string) =>
        fetch(`${base}/buyers/hero`, {
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
          fetch(`${base}/buyers/${item.id}`, {
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
      setSuccess("Buyers saved");
    } catch (err: any) {
      setError(err.message || "Unable to save buyers");
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
      const res = await fetch(`${base}/buyers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Unable to delete buyer");
    }
  };

  return (
    <AdminLayout
      title="Buyer Management"
      description="Manage buyer stories, outcomes, and detail pages."
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
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyers..."
              className="pl-9"
            />
          </div>
          <Select value={city} onValueChange={(v) => setCity(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={segment} onValueChange={(v) => setSegment(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add buyer
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
                <CardTitle>{item.name || "New buyer"}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {item.city && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {item.city}
                    </Badge>
                  )}
                  {item.segment && <Badge variant="outline">{item.segment}</Badge>}
                  {item.spend && <Badge>{item.spend}</Badge>}
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
                  <Input value={item.id} onChange={(e) => updateItem(idx, "id", e.target.value)} placeholder="buyer-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Buyer name" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">City</label>
                  <Input value={item.city} onChange={(e) => updateItem(idx, "city", e.target.value)} placeholder="Mumbai" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Segment</label>
                  <Input value={item.segment} onChange={(e) => updateItem(idx, "segment", e.target.value)} placeholder="Lifestyle" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Visits</label>
                  <Input value={item.visits} onChange={(e) => updateItem(idx, "visits", e.target.value)} placeholder="4th year" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Spend</label>
                  <Input value={item.spend} onChange={(e) => updateItem(idx, "spend", e.target.value)} placeholder="₹18K basket" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Quote</label>
                  <Input value={item.quote} onChange={(e) => updateItem(idx, "quote", e.target.value)} placeholder="How they experience ICE" />
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
                    placeholder="Lane that kept me onsite"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Detail summary</label>
                  <Input
                    value={item.detail?.summary || ""}
                    onChange={(e) => updateDetail(idx, "summary", e.target.value)}
                    placeholder="Programming that mattered most"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hero image</label>
                <Input
                  value={item.detail?.heroImage || ""}
                  onChange={(e) => updateDetail(idx, "heroImage", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Pull quote</label>
                <Input
                  value={item.detail?.pullQuote || ""}
                  onChange={(e) => updateDetail(idx, "pullQuote", e.target.value)}
                  placeholder="It felt curated and fast."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">CTA label</label>
                  <Input
                    value={item.detail?.ctaLabel || ""}
                    onChange={(e) => updateDetail(idx, "ctaLabel", e.target.value)}
                    placeholder="Plan a buyer route"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CTA href</label>
                  <Input
                    value={item.detail?.ctaHref || ""}
                    onChange={(e) => updateDetail(idx, "ctaHref", e.target.value)}
                    placeholder="/contact"
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
        {!items.length && <p className="text-sm text-muted-foreground">No buyers yet. Add your first buyer to begin.</p>}
        {hasMore && (
          <Button variant="outline" onClick={() => load(false)} disabled={loading}>
            Load more
          </Button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBuyers;
