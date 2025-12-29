import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type CookieSection = { title: string; body: string; bullets: string[] };
type CookiesPayload = { hero: { badge: string; title: string; intro: string; updated: string }; sections: CookieSection[] };

const defaultPayload: CookiesPayload = {
  hero: {
    badge: "Legal",
    title: "Cookie Policy",
    intro: "This policy explains how we use cookies and similar technologies on our site.",
    updated: "2024",
  },
  sections: [
    {
      title: "What are cookies?",
      body: "Cookies are small text files stored on your device to improve site experience and remember preferences.",
      bullets: [],
    },
    {
      title: "How we use cookies",
      body: "",
      bullets: [
        "Essential: to keep the site functioning (navigation, forms).",
        "Analytics: to understand traffic and improve content.",
        "Preferences: to remember language/theme choices.",
      ],
    },
    {
      title: "Managing cookies",
      body: "You can adjust browser settings to block or delete cookies. Some features may not work without essential cookies.",
      bullets: [],
    },
    {
      title: "Third-party cookies",
      body: "Services like analytics or media embeds may set their own cookies. Review their policies for details.",
      bullets: [],
    },
  ],
};

const AdminCookies = () => {
  const [data, setData] = useState<CookiesPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/cookies`);
        if (!res.ok) throw new Error("Failed to load cookies");
        const payload = (await res.json()) as CookiesPayload;
        setData({
          hero: { ...defaultPayload.hero, ...(payload.hero || {}) },
          sections: payload.sections?.length ? payload.sections : defaultPayload.sections,
        });
      } catch (err: any) {
        setError(err.message || "Unable to load");
        setData(defaultPayload);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated.");
      const attempt = async (authToken: string) =>
        fetch(`${base}/cookies`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(data),
        });
      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) throw new Error("Save failed");
      setSuccess("Cookie policy updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (idx: number, key: keyof CookieSection, value: any) =>
    setData((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [key]: value };
      return { ...prev, sections };
    });

  const addSection = () =>
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "New section", body: "", bullets: [] }],
    }));

  const removeSection = (idx: number) =>
    setData((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));

  const updateBullet = (idx: number, bIdx: number, value: string) =>
    setData((prev) => {
      const sections = [...prev.sections];
      const bullets = [...(sections[idx].bullets || [])];
      bullets[bIdx] = value;
      sections[idx] = { ...sections[idx], bullets };
      return { ...prev, sections };
    });

  const addBullet = (idx: number) =>
    setData((prev) => {
      const sections = [...prev.sections];
      const bullets = [...(sections[idx].bullets || [])];
      bullets.push("");
      sections[idx] = { ...sections[idx], bullets };
      return { ...prev, sections };
    });

  const removeBullet = (idx: number, bIdx: number) =>
    setData((prev) => {
      const sections = [...prev.sections];
      const bullets = (sections[idx].bullets || []).filter((_, i) => i !== bIdx);
      sections[idx] = { ...sections[idx], bullets };
      return { ...prev, sections };
    });

  return (
    <AdminLayout
      title="Cookies Management"
      description="Edit the cookie policy hero and sections."
      navItems={adminNavLinks}
      sections={[{ id: "cookies", label: "Cookies" }]}
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

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={data.hero.badge} onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Last updated</label>
              <Input value={data.hero.updated} onChange={(e) => setData({ ...data, hero: { ...data.hero, updated: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Intro</label>
            <Textarea value={data.hero.intro} rows={2} onChange={(e) => setData({ ...data, hero: { ...data.hero, intro: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.sections.map((section, idx) => (
            <div key={idx} className="border border-border/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(idx, "title", e.target.value)}
                  placeholder="Section title"
                  className="font-semibold"
                />
                <Button variant="ghost" size="icon" onClick={() => removeSection(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={section.body}
                rows={3}
                onChange={(e) => updateSection(idx, "body", e.target.value)}
                placeholder="Section body"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Bullets</p>
                  <Button variant="outline" size="sm" onClick={() => addBullet(idx)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {(section.bullets || []).map((b, bIdx) => (
                  <div key={bIdx} className="flex gap-2">
                    <Input value={b} onChange={(e) => updateBullet(idx, bIdx, e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removeBullet(idx, bIdx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add section
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save all"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminCookies;
