import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Search, Calendar } from "lucide-react";

type LeadRow = {
  id: string;
  slug: string;
  createdAt: string;
  data: { id: string; label: string; value: unknown }[];
};

const AdminLeads = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [forms, setForms] = useState<{ slug: string; title: string }[]>([]);
  const [slug, setSlug] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(20);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<LeadRow | null>(null);

  const refreshAccessToken = async () => {
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
    const tokenData = await res.json();
    if (tokenData.accessToken) {
      localStorage.setItem("admin_access_token", tokenData.accessToken);
      return tokenData.accessToken as string;
    }
    return null;
  };

  const getAccessToken = async () => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken();
  };

  const loadForms = async () => {
    try {
      const res = await fetch(`${base}/forms`);
      if (!res.ok) return;
      const defs = await res.json();
      setForms(defs.map((d: any) => ({ slug: d.slug, title: d.title || d.slug })));
    } catch {
      // ignore
    }
  };

  const loadLeads = async (mode: "reset" | "next" | "prev" = "reset") => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const attempt = async (authToken: string | null, cursor?: string | null) => {
        const params = new URLSearchParams();
        if (slug && slug !== "all") params.set("slug", slug);
        if (query.trim()) params.set("q", query.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (cursor) params.set("cursor", cursor);
        params.set("order", order);
        params.set("limit", String(pageSize));
        return fetch(`${base}/forms/submissions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      };
      let cursor: string | null = null;
      if (mode === "next") cursor = next;
      if (mode === "prev") {
        cursor = prevStack[prevStack.length - 1] ?? null;
      }
      if (mode === "reset") {
        cursor = null;
        setPrevStack([]);
        setCurrentCursor(null);
        setPage(1);
      }

      const previousCursor = currentCursor;
      let res = await attempt(token, cursor);
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await attempt(refreshed, cursor);
      }
      if (!res || !res.ok) throw new Error("Failed to load leads");
      const payload = await res.json();
      const incoming: LeadRow[] = payload.data || [];
      setNext(payload?.cursor?.next || null);
      setCurrentCursor(cursor);
      if (mode === "next") {
        setPrevStack((prev) => [...prev, previousCursor ?? ""]);
        setPage((p) => p + 1);
      } else if (mode === "prev") {
        setPrevStack((prev) => prev.slice(0, -1));
        setPage((p) => Math.max(1, p - 1));
      } else {
        setPage(1);
      }
      setLeads(incoming);
    } catch (err: any) {
      setError(err.message || "Unable to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLeads("reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, order, pageSize]);

  const grouped = useMemo(() => {
    const map: Record<string, LeadRow[]> = {};
    for (const lead of leads) {
      map[lead.slug] = map[lead.slug] || [];
      map[lead.slug].push(lead);
    }
    return Object.entries(map);
  }, [leads]);

  return (
    <AdminLayout
      title="Leads"
      description="Centralize all form submissions with filters and pagination for scale."
      navItems={adminNavLinks}
      sections={[{ id: "leads", label: "Leads" }]}
    >
      <Card className="bg-card/70 border-border/60">
        <CardHeader className="space-y-3">
          <CardTitle>Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => loadLeads("reset")}
                placeholder="Search name/email/fields"
                className="pl-9 w-full"
              />
            </div>
            <Select value={slug} onValueChange={(v) => setSlug(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All forms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All forms</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f.slug} value={f.slug}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={(v: "asc" | "desc") => setOrder(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 col-span-full">
              <div className="relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="pl-9 w-full" />
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="pl-9 w-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => loadLeads("reset")} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSlug("all");
                setQuery("");
                setFrom("");
                setTo("");
                setOrder("desc");
                loadLeads("reset");
              }}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!error && grouped.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          )}
          <div className="space-y-6">
            {grouped.map(([groupSlug, items]) => (
              <div key={groupSlug} className="border border-border/60 rounded-xl p-4 bg-card/70">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="uppercase tracking-[0.2em]">
                      {groupSlug}
                    </Badge>
                    <span className="text-muted-foreground text-sm">{items.length} lead(s) loaded</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {items.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-lg border border-border/60 p-3 bg-background/60 cursor-pointer hover:border-primary/50"
                      onClick={() => setSelected(lead)}
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold">Lead #{lead.id.slice(-6)}</span>
                        <span className="text-muted-foreground">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        {lead.data.map((field) => (
                          <div
                            key={`${lead.id}-${field.id}`}
                            className="rounded-md bg-muted/30 border border-border/40 px-3 py-2 flex justify-between gap-3"
                          >
                            <span className="text-muted-foreground">{field.label}</span>
                            <span className="font-medium text-right break-words">
                              {typeof field.value === "string" || typeof field.value === "number"
                                ? String(field.value)
                                : Array.isArray(field.value)
                                  ? field.value.join(", ")
                                  : JSON.stringify(field.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <div>
              Page {page}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || !prevStack.length}
                onClick={() => loadLeads("prev")}
              >
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={loading || !next} onClick={() => loadLeads("next")}>
                Next
              </Button>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Lead #{selected?.id?.slice(-6)}</span>
              {selected?.slug && <Badge variant="secondary">{selected.slug}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Submitted {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-3">
                {selected.data.map((field) => (
                  <div key={`${selected.id}-${field.id}`} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field.label}</div>
                    <div className="font-medium break-words">
                      {typeof field.value === "string" || typeof field.value === "number"
                        ? String(field.value)
                        : Array.isArray(field.value)
                          ? field.value.join(", ")
                          : JSON.stringify(field.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminLeads;
