import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

type PartnerPayload = {
  hero: { badge: string; title: string; subheading: string };
  form: {
    nameLabel: string;
    emailLabel: string;
    companyLabel: string;
    goalsLabel: string;
    goalsPlaceholder: string;
    namePlaceholder: string;
    companyPlaceholder: string;
    emailPlaceholder: string;
    ctaLabel: string;
    note: string;
    successMessage: string;
  };
};

const defaultPayload: PartnerPayload = {
  hero: {
    badge: "Partner with us",
    title: "Become a Partner",
    subheading:
      "Co-create immersive experiences at INDIA GLOBAL EXPO. Tell us about your brand and the outcomes you want—we'll design a presence that people remember.",
  },
  form: {
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    goalsLabel: "Goals & vision",
    goalsPlaceholder: "What do you want to showcase? What does success look like?",
    namePlaceholder: "Your name",
    companyPlaceholder: "Brand or organization",
    emailPlaceholder: "you@company.com",
    ctaLabel: "Submit",
    note: "We reply within 1–2 business days.",
    successMessage: "Thanks for your interest in partnering. We'll reach out soon.",
  },
};

const AdminPartner = () => {
  const [data, setData] = useState<PartnerPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/partner`);
        if (!res.ok) throw new Error("Failed to load partner copy");
        const payload = (await res.json()) as PartnerPayload;
        setData({
          hero: { ...defaultPayload.hero, ...(payload.hero || {}) },
          form: { ...defaultPayload.form, ...(payload.form || {}) },
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
        fetch(`${base}/partner`, {
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
      setSuccess("Partner page updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Partner Page Management"
      description="Edit hero and form copy for the partner page."
      navItems={adminNavLinks}
      sections={[{ id: "partner", label: "Partner" }]}
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
          <Input value={data.hero.badge} onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })} />
          <Input value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          <Textarea
            value={data.hero.subheading}
            rows={3}
            onChange={(e) => setData({ ...data, hero: { ...data.hero, subheading: e.target.value } })}
          />
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={data.form.nameLabel} onChange={(e) => setData({ ...data, form: { ...data.form, nameLabel: e.target.value } })} />
            <Input value={data.form.emailLabel} onChange={(e) => setData({ ...data, form: { ...data.form, emailLabel: e.target.value } })} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={data.form.companyLabel} onChange={(e) => setData({ ...data, form: { ...data.form, companyLabel: e.target.value } })} />
            <Input value={data.form.goalsLabel} onChange={(e) => setData({ ...data, form: { ...data.form, goalsLabel: e.target.value } })} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.namePlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, namePlaceholder: e.target.value } })}
              placeholder="Name placeholder"
            />
            <Input
              value={data.form.emailPlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, emailPlaceholder: e.target.value } })}
              placeholder="Email placeholder"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.companyPlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, companyPlaceholder: e.target.value } })}
              placeholder="Company placeholder"
            />
            <Input
              value={data.form.goalsPlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, goalsPlaceholder: e.target.value } })}
              placeholder="Goals placeholder"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={data.form.ctaLabel} onChange={(e) => setData({ ...data, form: { ...data.form, ctaLabel: e.target.value } })} />
            <Input value={data.form.note} onChange={(e) => setData({ ...data, form: { ...data.form, note: e.target.value } })} />
          </div>
          <Input
            value={data.form.successMessage}
            onChange={(e) => setData({ ...data, form: { ...data.form, successMessage: e.target.value } })}
            placeholder="Success message"
          />
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

export default AdminPartner;
