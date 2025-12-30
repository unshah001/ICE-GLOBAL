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
import MediaUploadModal, { type MediaUploadResult } from "@/components/admin/MediaUploadModal";

type SellerDetail = {
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

type SellerItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  outcome: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number }[];
  href?: string;
  detail?: SellerDetail;
};

type SellersResponse = {
  data: SellerItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { companies?: string[]; roles?: string[] };
};

const PAGE_LIMIT = 24;
const defaultCopy = {
  moreEyebrow: "More sellers",
  moreTitle: "Explore more seller stories",
  moreDescription: "Scroll to reveal more seller journeys—each card updates the preview with their imagery and outcomes.",
};
const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminSellers = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [{ id: "sellers", label: "Sellers" }];

  const [items, setItems] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copy, setCopy] = useState(defaultCopy);
  const [savingCopy, setSavingCopy] = useState(false);
  const [company, setCompany] = useState<string>("All");
  const [role, setRole] = useState<string>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [pageSize, setPageSize] = useState<number>(PAGE_LIMIT);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<string[]>(["All"]);
  const [roles, setRoles] = useState<string[]>(["All"]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uploadTarget, setUploadTarget] = useState<{ idx: number; field: "image" | "hero" } | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [originalMap, setOriginalMap] = useState<Record<string, string>>({});

  const defaultVariants = [
    { key: "main", path: "" },
    { key: "medium", path: "" },
    { key: "thumb", path: "" },
  ];

  const normalizeItem = (item: SellerItem): SellerItem => ({
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

  const load = async (mode: "reset" | "next" | "prev" = "reset", cursorOverride?: string | null, prevStackOverride?: string[]) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    let cursorParam: string | null = null;
    if (mode === "next") cursorParam = cursorOverride ?? nextCursor;
    if (mode === "prev") cursorParam = cursorOverride ?? null;
    if (cursorParam) params.set("cursor", cursorParam);
    if (company !== "All") params.set("company", company);
    if (role !== "All") params.set("role", role);
    params.set("sort", sort);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/sellers/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load sellers");
      const data = (await res.json()) as SellersResponse;
      const next = (data.data || []).map(normalizeItem);
      setItems(next);
      const expandMap: Record<string, boolean> = {};
      next.forEach((s) => {
        expandMap[s.id] = false;
      });
      setExpanded(expandMap);
      const snapshotMap: Record<string, string> = {};
      next.forEach((s) => (snapshotMap[s.id] = JSON.stringify(s)));
      setOriginalMap(snapshotMap);
      if (mode === "reset") {
        setPrevCursors([]);
      } else if (mode === "next") {
        setPrevCursors((prev) => [...prev, currentCursor ?? ""]);
      } else if (mode === "prev" && prevStackOverride) {
        setPrevCursors(prevStackOverride);
      }
      setCurrentCursor(cursorParam ?? null);
      setNextCursor(data.cursor?.next ?? null);
      setCompanies(["All", ...(data.filters?.companies || [])]);
      setRoles(["All", ...(data.filters?.roles || [])]);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load sellers");
      if (mode === "reset") {
        setItems([]);
        setCompanies(["All"]);
        setRoles(["All"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadCopy(), load("reset")]);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load("reset"), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, role, sort, search, pageSize]);

  const updateItem = (idx: number, key: keyof SellerItem, value: any) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => {
      const nextItem = normalizeItem({
        id: createId(),
        name: "",
        role: "",
        company: "",
        quote: "",
        outcome: "",
        image: "",
        href: "",
        detail: { heroImage: "" },
      });
      setExpanded((prevExp) => ({ ...prevExp, [nextItem.id]: true }));
      return [nextItem, ...prev];
    });

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateDetail = (idx: number, key: keyof SellerDetail, value: any) =>
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

  useEffect(() => {
    if (items.length) {
      setExpanded((prev) => ({ ...prev, [items[0].id]: prev[items[0].id] ?? true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

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

  const loadCopy = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/sellers/detail-copy`);
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
        fetch(`${base}/sellers/detail-copy`, {
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
      const serialize = (item: SellerItem) => JSON.stringify(item);
      const changedItems = items.filter((item) => {
        const snapshot = originalMap[item.id];
        return !snapshot || snapshot !== serialize(normalizeItem(item));
      });

      if (!changedItems.length) {
        setSuccess("No changes to save");
        return;
      }

      for (const item of changedItems) {
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
          fetch(`${base}/sellers/${item.id}`, {
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
        setOriginalMap((prev) => ({
          ...prev,
          [item.id]: serialize(
            normalizeItem({
              ...item,
              variants: cleanedVariants,
              detail: item.detail ? { ...item.detail, heroVariants: cleanedHeroVariants } : undefined,
            })
          ),
        }));
      }
      if (pendingDeletes.length) {
        const resDelete = await fetch(`${base}/media/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paths: Array.from(new Set(pendingDeletes)), reason: "seller-image-replace" }),
        });
        if (resDelete.ok) setPendingDeletes([]);
      }
      setSuccess("Sellers saved");
    } catch (err: any) {
      setError(err.message || "Unable to save sellers");
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
      const res = await fetch(`${base}/sellers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Unable to delete seller");
    }
  };

  return (
    <AdminLayout
      title="Seller Management"
      description="Manage seller stories, outcomes, and detail pages."
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
            <label className="text-xs text-muted-foreground">More section eyebrow</label>
            <Input
              value={copy.moreEyebrow}
              onChange={(e) => setCopy((c) => ({ ...c, moreEyebrow: e.target.value }))}
              placeholder="More sellers"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section title</label>
            <Input
              value={copy.moreTitle}
              onChange={(e) => setCopy((c) => ({ ...c, moreTitle: e.target.value }))}
              placeholder="Explore more seller stories"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section description</label>
            <Input
              value={copy.moreDescription}
              onChange={(e) => setCopy((c) => ({ ...c, moreDescription: e.target.value }))}
              placeholder="Scroll to reveal more sellers..."
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
              placeholder="Search sellers..."
              className="pl-9"
            />
          </div>
          <Select value={company} onValueChange={(v) => setCompany(v)}>
            <SelectTrigger className="w-full md:w-[200px]">
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
          <Select value={role} onValueChange={(v) => setRole(v)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v: "newest" | "oldest") => setSort(v)}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Page size" />
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
              Add seller
            </Button>
            <Button onClick={saveItems} disabled={saving || loading}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => load("reset")} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item, idx) => (
          <Card key={item.id} className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !(prev[item.id] ?? false) }))}
                  aria-label="Toggle details"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded[item.id] ? "rotate-180" : ""}`} />
                </Button>
                <div className="space-y-1">
                  <CardTitle>{item.name || "New seller"}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {item.company && <Badge variant="secondary">{item.company}</Badge>}
                    {item.role && <Badge variant="outline">{item.role}</Badge>}
                    {item.outcome && <Badge>{item.outcome}</Badge>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            {expanded[item.id] && (
              <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">ID</label>
                  <Input value={item.id} onChange={(e) => updateItem(idx, "id", e.target.value)} placeholder="seller-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Seller name" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Role</label>
                  <Input value={item.role} onChange={(e) => updateItem(idx, "role", e.target.value)} placeholder="Founder" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Company</label>
                  <Input value={item.company} onChange={(e) => updateItem(idx, "company", e.target.value)} placeholder="Studio Meridian" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Outcome</label>
                  <Input value={item.outcome} onChange={(e) => updateItem(idx, "outcome", e.target.value)} placeholder="+42% repeat visits" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Quote</label>
                <Input value={item.quote} onChange={(e) => updateItem(idx, "quote", e.target.value)} placeholder="Lead capture and demos..." />
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
              <div>
                <label className="text-xs text-muted-foreground">Detail headline</label>
                <Input
                  value={item.detail?.headline || ""}
                  onChange={(e) => updateDetail(idx, "headline", e.target.value)}
                  placeholder="Launch that sold out in two days"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Detail summary</label>
                  <Input
                    value={item.detail?.summary || ""}
                    onChange={(e) => updateDetail(idx, "summary", e.target.value)}
                    placeholder="Choreographed booth schedule kept traffic steady..."
                  />
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
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Pull quote</label>
                <Input
                  value={item.detail?.pullQuote || ""}
                  onChange={(e) => updateDetail(idx, "pullQuote", e.target.value)}
                  placeholder="It felt like a mini-launch every two hours."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">CTA label</label>
                  <Input
                    value={item.detail?.ctaLabel || ""}
                    onChange={(e) => updateDetail(idx, "ctaLabel", e.target.value)}
                    placeholder="Plan a seller showcase"
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
            )}
          </Card>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No sellers yet. Add your first seller to begin.</p>}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const prev = prevCursors[prevCursors.length - 1] ?? null;
              if (!prevCursors.length) return;
              load("prev", prev, prevCursors.slice(0, -1));
            }}
            disabled={loading || !prevCursors.length}
          >
            Previous
          </Button>
          <Button variant="outline" onClick={() => load("next")} disabled={loading || !nextCursor}>
            Next
          </Button>
          {hasMore && <span className="text-xs text-muted-foreground">More pages available</span>}
        </div>
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
            setItems((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], image: imagePath, variants: result.variants };
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

export default AdminSellers;
