import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type TermsSection = { title: string; body: string };
type TermsPayload = { hero: { badge: string; title: string; intro: string; updated: string }; sections: TermsSection[] };

const defaultPayload: TermsPayload = {
  hero: {
    badge: "Legal",
    title: "Terms of Service",
    intro: "These terms govern your use of our website and services. By accessing the site, you agree to these terms.",
    updated: "2024",
  },
  sections: [
    {
      title: "Use of the site",
      body: "You may browse and use the site for lawful purposes. Do not disrupt, attempt to breach security, or misuse content.",
    },
    {
      title: "Content & IP",
      body: "All branding, media, and copy are owned by India Global Expo or our partners. Do not reproduce without permission.",
    },
    {
      title: "Links to third parties",
      body: "External links are provided for convenience. We are not responsible for third-party content or practices.",
    },
    {
      title: "Disclaimers",
      body:
        "The site is provided “as is.” We do not guarantee uninterrupted access. To the extent permitted by law, we exclude liability for indirect or consequential damages.",
    },
    {
      title: "Changes",
      body: "We may update these terms. Continued use after changes means you accept the updated terms.",
    },
    {
      title: "Governing law",
      body: "These terms are governed by the laws of India. Disputes will be handled in Bangalore jurisdiction.",
    },
  ],
};

const AdminTerms = () => {
  const [data, setData] = useState<TermsPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/terms`);
        if (!res.ok) throw new Error("Failed to load terms");
        const payload = (await res.json()) as TermsPayload;
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
        fetch(`${base}/terms`, {
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
      setSuccess("Terms updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (idx: number, key: keyof TermsSection, value: string) =>
    setData((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [key]: value };
      return { ...prev, sections };
    });

  const addSection = () =>
    setData((prev) => ({ ...prev, sections: [...prev.sections, { title: "New section", body: "" }] }));

  const removeSection = (idx: number) =>
    setData((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));

  return (
    <AdminLayout
      title="Terms Management"
      description="Edit the terms hero and sections."
      navItems={adminNavLinks}
      sections={[{ id: "terms", label: "Terms" }]}
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
            <Textarea
              value={data.hero.intro}
              rows={3}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, intro: e.target.value } })}
            />
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
              <div className="flex items-center justify-between gap-3">
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

export default AdminTerms;
