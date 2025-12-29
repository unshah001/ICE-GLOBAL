import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type RatingOption = { value: string; label: string };
type FeedbackPayload = {
  hero: { badge: string; title: string; subheading: string };
  form: {
    nameLabel: string;
    emailLabel: string;
    roleLabel: string;
    ratingLabel: string;
    feedbackLabel: string;
    buttonLabel: string;
    note: string;
    rolePlaceholder: string;
    feedbackPlaceholder: string;
    successMessage: string;
  };
  ratingOptions: RatingOption[];
};

const defaultPayload: FeedbackPayload = {
  hero: {
    badge: "Feedback",
    title: "Share your experience",
    subheading: "Tell us what you loved and what we can improve. Your input shapes the next INDIA GLOBAL EXPO.",
  },
  form: {
    nameLabel: "Name",
    emailLabel: "Email",
    roleLabel: "Role",
    ratingLabel: "Rating",
    feedbackLabel: "Feedback",
    buttonLabel: "Submit feedback",
    note: "We read every response.",
    rolePlaceholder: "Attendee, partner, sponsor...",
    feedbackPlaceholder: "Share highlights, suggestions, or issues you faced.",
    successMessage: "Thanks for your feedback! We appreciate your time.",
  },
  ratingOptions: [
    { value: "5", label: "5 - Excellent" },
    { value: "4", label: "4 - Good" },
    { value: "3", label: "3 - Fair" },
    { value: "2", label: "2 - Needs improvement" },
    { value: "1", label: "1 - Poor" },
  ],
};

const AdminFeedback = () => {
  const [data, setData] = useState<FeedbackPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/feedback`);
        if (!res.ok) throw new Error("Failed to load feedback content");
        const payload = (await res.json()) as FeedbackPayload;
        setData({
          hero: { ...defaultPayload.hero, ...(payload.hero || {}) },
          form: { ...defaultPayload.form, ...(payload.form || {}) },
          ratingOptions: payload.ratingOptions?.length ? payload.ratingOptions : defaultPayload.ratingOptions,
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
        fetch(`${base}/feedback`, {
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
      setSuccess("Feedback page updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateRatingOption = (idx: number, key: keyof RatingOption, value: string) =>
    setData((prev) => {
      const opts = [...prev.ratingOptions];
      opts[idx] = { ...opts[idx], [key]: value };
      return { ...prev, ratingOptions: opts };
    });

  const addRatingOption = () =>
    setData((prev) => ({ ...prev, ratingOptions: [...prev.ratingOptions, { value: "", label: "" }] }));

  const removeRatingOption = (idx: number) =>
    setData((prev) => ({ ...prev, ratingOptions: prev.ratingOptions.filter((_, i) => i !== idx) }));

  return (
    <AdminLayout
      title="Feedback Management"
      description="Edit feedback page copy and rating options."
      navItems={adminNavLinks}
      sections={[{ id: "feedback", label: "Feedback" }]}
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
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subheading</label>
            <Textarea
              value={data.hero.subheading}
              rows={2}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, subheading: e.target.value } })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Form copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.nameLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, nameLabel: e.target.value } })}
              placeholder="Name label"
            />
            <Input
              value={data.form.emailLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, emailLabel: e.target.value } })}
              placeholder="Email label"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.roleLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, roleLabel: e.target.value } })}
              placeholder="Role label"
            />
            <Input
              value={data.form.ratingLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, ratingLabel: e.target.value } })}
              placeholder="Rating label"
            />
          </div>
          <Input
            value={data.form.feedbackLabel}
            onChange={(e) => setData({ ...data, form: { ...data.form, feedbackLabel: e.target.value } })}
            placeholder="Feedback label"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.rolePlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, rolePlaceholder: e.target.value } })}
              placeholder="Role placeholder"
            />
            <Input
              value={data.form.feedbackPlaceholder}
              onChange={(e) => setData({ ...data, form: { ...data.form, feedbackPlaceholder: e.target.value } })}
              placeholder="Feedback placeholder"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={data.form.buttonLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, buttonLabel: e.target.value } })}
              placeholder="CTA label"
            />
            <Input
              value={data.form.note}
              onChange={(e) => setData({ ...data, form: { ...data.form, note: e.target.value } })}
              placeholder="Note"
            />
          </div>
          <Input
            value={data.form.successMessage}
            onChange={(e) => setData({ ...data, form: { ...data.form, successMessage: e.target.value } })}
            placeholder="Success message"
          />
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Rating options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.ratingOptions.map((opt, idx) => (
            <div key={idx} className="grid md:grid-cols-[1fr,2fr,auto] gap-2 items-center">
              <Input value={opt.value} onChange={(e) => updateRatingOption(idx, "value", e.target.value)} placeholder="Value" />
              <Input value={opt.label} onChange={(e) => updateRatingOption(idx, "label", e.target.value)} placeholder="Label" />
              <Button variant="ghost" size="icon" onClick={() => removeRatingOption(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addRatingOption}>
            <Plus className="w-4 h-4 mr-2" />
            Add option
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

export default AdminFeedback;
