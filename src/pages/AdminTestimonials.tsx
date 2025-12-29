import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  quote: string;
};

type Payload = {
  hero: {
    badge: string;
    title: string;
    intro: string;
    ctaLabel: string;
    ctaHref: string;
    ctaBadge: string;
    ctaTitle: string;
    ctaBody: string;
  };
  testimonials: Testimonial[];
};

const defaultPayload: Payload = {
  hero: {
    badge: "Voices",
    title: "Testimonials",
    intro: "What our partners, founders, and attendees say about INDIA GLOBAL EXPO. Animated stories from the floor to the main stage.",
    ctaLabel: "Send feedback",
    ctaHref: "/feedback",
    ctaBadge: "Share yours",
    ctaTitle: "Were you at the expo?",
    ctaBody: "Tell us what you loved, what you’d improve, and what you want to see next year. Your feedback shapes the next edition.",
  },
  testimonials: [],
};

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `testimonial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminTestimonials = () => {
  const [data, setData] = useState<Payload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/testimonials`);
        if (!res.ok) throw new Error("Failed to load testimonials");
        const payload = (await res.json()) as Payload;
        setData({
          hero: { ...defaultPayload.hero, ...(payload.hero || {}) },
          testimonials: payload.testimonials?.length ? payload.testimonials : [],
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
        fetch(`${base}/testimonials`, {
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
      setSuccess("Testimonials updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () =>
    setData((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: createId(), name: "", role: "", company: "", image: "", rating: 5, quote: "" },
      ],
    }));

  const updateTestimonial = (idx: number, key: keyof Testimonial, value: any) =>
    setData((prev) => {
      const testimonials = [...prev.testimonials];
      testimonials[idx] = { ...testimonials[idx], [key]: value };
      return { ...prev, testimonials };
    });

  const removeTestimonial = (idx: number) =>
    setData((prev) => ({ ...prev, testimonials: prev.testimonials.filter((_, i) => i !== idx) }));

  return (
    <AdminLayout
      title="Testimonials Management"
      description="Edit testimonials hero and individual quotes."
      navItems={adminNavLinks}
      sections={[{ id: "testimonials", label: "Testimonials" }]}
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
            <Input
              value={data.hero.badge}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })}
              placeholder="Badge"
            />
            <Input
              value={data.hero.title}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
              placeholder="Title"
            />
          </div>
          <Textarea
            value={data.hero.intro}
            rows={3}
            onChange={(e) => setData({ ...data, hero: { ...data.hero, intro: e.target.value } })}
            placeholder="Intro"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.hero.ctaLabel}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaLabel: e.target.value } })}
              placeholder="CTA label"
            />
            <Input
              value={data.hero.ctaHref}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaHref: e.target.value } })}
              placeholder="CTA href"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.hero.ctaBadge}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaBadge: e.target.value } })}
              placeholder="CTA badge"
            />
            <Input
              value={data.hero.ctaTitle}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaTitle: e.target.value } })}
              placeholder="CTA title"
            />
          </div>
          <Textarea
            value={data.hero.ctaBody}
            rows={2}
            onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaBody: e.target.value } })}
            placeholder="CTA body"
          />
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.testimonials.map((t, idx) => (
            <div key={t.id} className="border border-border/60 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <Input
                  value={t.name}
                  onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
                  placeholder="Name"
                  className="font-semibold"
                />
                <Button variant="ghost" size="icon" onClick={() => removeTestimonial(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <Input
                  value={t.role}
                  onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                  placeholder="Role"
                />
                <Input
                  value={t.company}
                  onChange={(e) => updateTestimonial(idx, "company", e.target.value)}
                  placeholder="Company"
                />
              </div>
              <Input
                value={t.image}
                onChange={(e) => updateTestimonial(idx, "image", e.target.value)}
                placeholder="Image URL"
              />
              <div className="grid md:grid-cols-[1fr,auto] gap-2 items-center">
                <Textarea
                  value={t.quote}
                  rows={2}
                  onChange={(e) => updateTestimonial(idx, "quote", e.target.value)}
                  placeholder="Quote"
                />
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={t.rating}
                  onChange={(e) => updateTestimonial(idx, "rating", Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTestimonial}>
            <Plus className="w-4 h-4 mr-2" />
            Add testimonial
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

export default AdminTestimonials;
