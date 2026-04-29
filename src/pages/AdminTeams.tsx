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
import { toast } from "@/components/ui/sonner";

type TeamDetail = {
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

type TeamItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  focus: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number }[];
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: TeamDetail;
};

type TeamsResponse = {
  data: TeamItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { departments?: string[]; roles?: string[]; focuses?: string[] };
};

const PAGE_LIMIT = 24;
const defaultCopy = {
  moreEyebrow: "More team",
  moreTitle: "Explore more team profiles",
  moreDescription: "Scroll to reveal more team members—tap to open their detailed profiles.",
};
const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminTeams = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [{ id: "team", label: "Team" }];

  const [items, setItems] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copy, setCopy] = useState(defaultCopy);
  const [savingCopy, setSavingCopy] = useState(false);
  const [department, setDepartment] = useState<string>("All");
  const [role, setRole] = useState<string>("All");
  const [focus, setFocus] = useState<string>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState<string[]>(["All"]);
  const [roles, setRoles] = useState<string[]>(["All"]);
  const [focuses, setFocuses] = useState<string[]>(["All"]);
  const [cursor, setCursor] = useState<string | null>(null);
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

  const normalizeItem = (item: TeamItem): TeamItem => ({
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
    if (department !== "All") params.set("department", department);
    if (role !== "All") params.set("role", role);
    if (focus !== "All") params.set("focus", focus);
    params.set("sort", sort);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/teams/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load team");
      const data = (await res.json()) as TeamsResponse;
      const next = (data.data || []).map(normalizeItem);
      if (reset) {
        setItems(next);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      const snapshotMap: Record<string, string> = {};
      next.forEach((item) => {
        if (item.id) snapshotMap[item.id] = JSON.stringify(item);
      });
      setOriginalMap((prev) => (reset ? snapshotMap : { ...prev, ...snapshotMap }));
      setDepartments(["All", ...(data.filters?.departments || [])]);
      setRoles(["All", ...(data.filters?.roles || [])]);
      setFocuses(["All", ...(data.filters?.focuses || [])]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load team");
      if (reset) {
        setItems([]);
        setDepartments(["All"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadCopy(), load(true)]);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, role, focus, sort, search]);

  const updateItem = (idx: number, key: keyof TeamItem, value: any) =>
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
        role: "",
        department: "",
        focus: "",
        image: "",
        highlight: "",
        href: "",
        social: {},
        detail: {},
      }),
      ...prev,
    ]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateDetail = (idx: number, key: keyof TeamDetail, value: any) =>
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

  const loadCopy = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/teams/detail-copy`);
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
        console.log("Copy token:", authToken);
        
        fetch(`${base}/teams/detail-copy`, {
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
      const deletedPaths = [...pendingDeletes];
      const serialize = (item: TeamItem) => JSON.stringify(item);
      const changedItems = items.filter((item) => {
        const snapshot = item.id ? originalMap[item.id] : null;
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
          
          fetch(`${base}/teams/${item.id}`, {
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
      if (deletedPaths.length) {
        const res = await fetch(`${base}/media/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paths: Array.from(new Set(deletedPaths)), reason: "team-image-replace" }),
        });
        if (!res.ok) {
          toast.error("Some old team images could not be queued for deletion");
        } else {
          setPendingDeletes([]);
        }
      }
      setSuccess("Team saved");
    } catch (err: any) {
      setError(err.message || "Unable to save team");
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
      const res = await fetch(`${base}/teams/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setOriginalMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Unable to delete team member");
    }
  };

  return (
    <AdminLayout
      title="Team Management"
      description="Manage team profiles, highlights, and detail pages."
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
              placeholder="More team"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section title</label>
            <Input
              value={copy.moreTitle}
              onChange={(e) => setCopy((c) => ({ ...c, moreTitle: e.target.value }))}
              placeholder="Explore more team profiles"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">More section description</label>
            <Input
              value={copy.moreDescription}
              onChange={(e) => setCopy((c) => ({ ...c, moreDescription: e.target.value }))}
              placeholder="Scroll to reveal more team..."
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
              placeholder="Search team..."
              className="pl-9"
            />
          </div>
          <Select value={department} onValueChange={(v) => setDepartment(v)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
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
          <Select value={focus} onValueChange={(v) => setFocus(v)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Focus" />
            </SelectTrigger>
            <SelectContent>
              {focuses.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
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
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add team member
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
        {items.map((item, idx) => {
          const isOpen = expanded[item.id] ?? false;
          return (
            <Card key={item.id} className="bg-card/80 border-border/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !isOpen }))}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </Button>
                  <div className="space-y-1">
                    <CardTitle>{item.name || "New team member"}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {item.department && <Badge variant="secondary">{item.department}</Badge>}
                      {item.role && <Badge variant="outline">{item.role}</Badge>}
                      {item.focus && <Badge>{item.focus}</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              {isOpen && (
                <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">ID</label>
                  <Input value={item.id} onChange={(e) => updateItem(idx, "id", e.target.value)} placeholder="team-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Name" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Role</label>
                  <Input value={item.role} onChange={(e) => updateItem(idx, "role", e.target.value)} placeholder="Role" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Department</label>
                  <Input value={item.department} onChange={(e) => updateItem(idx, "department", e.target.value)} placeholder="Production" />
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
                    placeholder="/teams/priya-menon"
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
      );
    })}
    {!items.length && <p className="text-sm text-muted-foreground">No team members yet. Add your first team member to begin.</p>}
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

export default AdminTeams;
