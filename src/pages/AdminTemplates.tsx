import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import DOMPurify from "dompurify";

type TemplateRow = {
  id?: string;
  slug: string;
  type: "email" | "sms";
  title: string;
  subject: string;
  body: string;
  placeholders: string[];
  formSlug?: string;
  description?: string;
};

const emptyTemplate: TemplateRow = {
  slug: "",
  type: "email",
  title: "",
  subject: "",
  body: "",
  placeholders: [],
  formSlug: "",
  description: "",
};

const AdminTemplates = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [forms, setForms] = useState<{ slug: string; title: string }[]>([]);
  const [active, setActive] = useState<TemplateRow>({ ...emptyTemplate, slug: "" });
  const [filterForm, setFilterForm] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sampleData = useMemo(() => {
    const entries = (active.placeholders || []).map((p) => [p, p.toUpperCase()]);
    return Object.fromEntries(entries);
  }, [active.placeholders]);

  const renderPreview = (text: string, asHtml = false) => {
    if (!text) return "";
    const replaced = (active.placeholders || []).reduce(
      (acc, key) => acc.replaceAll(`{{${key}}}`, sampleData[key] || `[${key}]`),
      text
    );
    return asHtml ? DOMPurify.sanitize(replaced) : replaced;
  };

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

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterForm !== "all") params.set("formSlug", filterForm);
      if (filterType !== "all") params.set("type", filterType);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${base}/templates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load templates");
      const payload = await res.json();
      const items: TemplateRow[] = payload?.data || [];
      setTemplates(items);
      if (!active.slug && items.length) {
        setActive({ ...items[0], formSlug: items[0].formSlug || "" });
      }
    } catch (err) {
      console.error(err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async () => {
    try {
      const res = await fetch(`${base}/forms`);
      if (!res.ok) return;
      const defs = await res.json();
      setForms(defs.map((d: any) => ({ slug: d.slug, title: d.title || d.slug })));
    } catch {
      setForms([]);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterForm, filterType]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!t.slug.toLowerCase().includes(q) && !t.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [templates, search]);

  const setActiveTemplate = (tpl: TemplateRow) => {
    setActive({ ...tpl, formSlug: tpl.formSlug || "" });
  };

  const saveTemplate = async () => {
    if (!active.slug) {
      alert("Slug is required");
      return;
    }
    const existing = templates.find((t) => t.slug === active.slug);
    if (!existing) {
      alert("Creating new templates is disabled. Select an existing template to edit.");
      return;
    }
    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/templates/${active.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...active, formSlug: active.formSlug || undefined }),
      });
      if (!res.ok) throw new Error("Save failed");
      await loadTemplates();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Templates"
      description="Manage outbound templates for form submissions and events."
      navItems={adminNavLinks}
      sections={[
        { id: "list", label: "Library" },
        { id: "editor", label: "Editor" },
      ]}
    >
      <Card id="list" className="bg-card/70 border-border/60">
        <CardHeader className="space-y-3">
          <CardTitle>Template Library</CardTitle>
          <div className="grid md:grid-cols-4 gap-3">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={loadTemplates}
            />
            <Select value={filterForm} onValueChange={(v) => setFilterForm(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Form" />
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
            <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadTemplates} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTemplates.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No templates yet. Create one below.</p>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {filteredTemplates.map((tpl) => (
              <Card
                key={tpl.slug}
                className="border border-border/60 bg-background/70 cursor-pointer hover:border-primary/50"
                onClick={() => setActiveTemplate(tpl)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{tpl.title || tpl.slug}</span>
                    <Badge variant="secondary">{tpl.type}</Badge>
                  </CardTitle>
                  <CardDescription>{tpl.description || tpl.subject}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  {tpl.formSlug ? <Badge variant="outline">Form: {tpl.formSlug}</Badge> : <Badge variant="outline">General</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="editor" className="bg-card/70 border-border/60">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Editor</CardTitle>
            <CardDescription>Slug and title are required. Link to a form to auto-associate.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Slug</label>
              <Input
                value={active.slug}
                disabled
                placeholder="welcome-email"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input
                value={active.title}
                onChange={(e) => setActive({ ...active, title: e.target.value })}
                placeholder="Welcome email"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Select value={active.type} onValueChange={(v: "email" | "sms") => setActive({ ...active, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Form (optional)</label>
              <Select value={active.formSlug || "none"} onValueChange={(v) => setActive({ ...active, formSlug: v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Attach form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.slug} value={f.slug}>
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <Input
                value={active.description || ""}
                onChange={(e) => setActive({ ...active, description: e.target.value })}
                placeholder="Short context for teammates"
              />
            </div>
          </div>
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-3 mt-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Subject</label>
                  <Input
                    value={active.subject}
                    onChange={(e) => setActive({ ...active, subject: e.target.value })}
                    placeholder="Subject (for email)"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body (HTML supported)</label>
                <textarea
                  rows={10}
                  value={active.body}
                  onChange={(e) => setActive({ ...active, body: e.target.value })}
                  placeholder="Paste or write HTML. Use placeholders like {{name}} or {{email}}."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </TabsContent>
            <TabsContent value="placeholders" className="space-y-3 mt-3">
              <div className="flex flex-wrap gap-2">
                {(active.placeholders || []).map((p, idx) => (
                  <Badge key={`${p}-${idx}`} variant="outline">
                    {p}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add placeholder and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      setActive((prev) => ({ ...prev, placeholders: Array.from(new Set([...(prev.placeholders || []), val])) }));
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="preview" className="space-y-3 mt-3">
              <div className="p-4 rounded-md border border-border/60 bg-muted/30">
                <p className="text-xs uppercase text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{renderPreview(active.subject) || "—"}</p>
              </div>
              <div className="p-4 rounded-md border border-border/60 bg-muted/30">
                <p className="text-xs uppercase text-muted-foreground mb-2">Body preview</p>
                <div
                  className="prose prose-sm max-w-none prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderPreview(active.body, true) || "<p>No content yet.</p>" }}
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button onClick={saveTemplate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save template
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTemplates;
