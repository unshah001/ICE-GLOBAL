import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type PrivacySection = { title: string; body: string; bullets: string[] };
type PrivacyPayload = { hero: { badge: string; title: string; intro: string; updated: string }; sections: PrivacySection[] };

const defaultPayload: PrivacyPayload = {
  hero: {
    badge: "Legal",
    title: "Privacy Policy",
    intro: "We respect your privacy. This policy explains what data we collect, how we use it, and the choices you have.",
    updated: "2024",
  },
  sections: [
    {
      title: "Information we collect",
      body: "",
      bullets: [
        "Contact details you provide (name, email, company) via forms.",
        "Usage data (pages viewed, interactions) through analytics.",
        "Device and browser information (IP, user agent) for security and analytics.",
      ],
    },
    {
      title: "How we use information",
      body: "",
      bullets: [
        "To respond to inquiries and manage event participation.",
        "To improve our site experience and content.",
        "To secure our services, prevent abuse, and comply with legal obligations.",
        "To send updates you opt into; you can opt out anytime.",
      ],
    },
    {
      title: "Data sharing",
      body:
        "We do not sell your data. We share it only with service providers who help us operate the site (hosting, analytics, email) under confidentiality terms, or when required by law.",
      bullets: [],
    },
    {
      title: "Data retention",
      body:
        "We keep data only as long as needed for the purposes above or to meet legal requirements. You can request deletion of your personal data unless we must keep it for legal reasons.",
      bullets: [],
    },
    {
      title: "Your rights",
      body: "",
      bullets: [
        "Access, correct, or delete your personal data.",
        "Withdraw consent for communications.",
        "Contact us to exercise these rights: privacy@indiaglobalexpo.com.",
      ],
    },
    {
      title: "Contact",
      body: "For privacy inquiries, email privacy@indiaglobalexpo.com or write to us at Bangalore, India.",
      bullets: [],
    },
  ],
};

const AdminPrivacy = () => {
  const [data, setData] = useState<PrivacyPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/privacy`);
        if (!res.ok) throw new Error("Failed to load privacy copy");
        const payload = (await res.json()) as PrivacyPayload;
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
        fetch(`${base}/privacy`, {
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
      setSuccess("Privacy policy updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (idx: number, key: keyof PrivacySection, value: any) =>
    setData((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [key]: value };
      return { ...prev, sections };
    });

  const addSection = () =>
    setData((prev) => ({ ...prev, sections: [...prev.sections, { title: "New section", body: "", bullets: [] }] }));

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
      title="Privacy Policy Management"
      description="Edit hero and privacy sections."
      navItems={adminNavLinks}
      sections={[{ id: "privacy", label: "Privacy" }]}
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

export default AdminPrivacy;
