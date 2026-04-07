import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type ContactCard = { icon: "mail" | "phone" | "map" | "clock"; title: string; value: string; hint: string };

type ContactPayload = {
  hero: { badge: string; title: string; subheading: string; chips: string[] };
  cards: ContactCard[];
  form: { title: string; description: string; ctaLabel: string; replyNote: string };
  howWeWork: { title: string; items: string[] };
  whatToBring: { title: string; items: string[] };
};

const defaultPayload: ContactPayload = {
  hero: {
    badge: "Contact",
    title: "Let's design your next show-stopping moment",
    subheading:
      "Tell us what you want to launch, celebrate, or showcase. We'll shape a tailored experience—stage, booth, VR zone, and media ops included.",
    chips: ["Production + AV", "Experience Design", "Media & Streaming"],
  },
  cards: [
    { icon: "mail", title: "Email", value: "hello@ICEglobal.com", hint: "We reply within one business day" },
    { icon: "phone", title: "Phone", value: "+91 98765 43210", hint: "Mon–Fri, 9:30 AM – 6:30 PM IST" },
    { icon: "map", title: "Studio", value: "Bangalore, India", hint: "Visit by appointment only" },
    { icon: "clock", title: "Turnaround", value: "2–3 days for proposals", hint: "Faster for returning partners" },
  ],
  form: {
    title: "Tell us about your goals",
    description:
      "Share what success looks like—launch metrics, lead targets, or the vibe you want to create. We’ll respond with a tailored plan and a call slot.",
    ctaLabel: "Send message",
    replyNote: "We usually reply in 24–48 hours.",
  },
  howWeWork: {
    title: "How we work",
    items: [
      "Discovery call to define goals and the feeling you want guests to have.",
      "Experience blueprint: stage, booth, XR, wayfinding, lounges, and media ops.",
      "Production plan with timelines, budgets, and measurement framework.",
      "Onsite execution with live dashboards for dwell time, sentiment, and leads.",
    ],
  },
  whatToBring: {
    title: "What to bring",
    items: [
      "Your brand story, launch goals, and any must-show products.",
      "Target audience, expected footfall, and desired vibe (concert, lounge, gallery).",
      "Timelines, budget range, and any existing assets (logos, media, 3D).",
    ],
  },
};

const AdminContact = () => {
  const [data, setData] = useState<ContactPayload>(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/contact`);
        if (!res.ok) throw new Error("Failed to load contact");
        const payload = (await res.json()) as ContactPayload;
        setData({
          ...defaultPayload,
          ...payload,
          hero: { ...defaultPayload.hero, ...(payload.hero || {}) },
          form: { ...defaultPayload.form, ...(payload.form || {}) },
          howWeWork: { ...defaultPayload.howWeWork, ...(payload.howWeWork || {}) },
          whatToBring: { ...defaultPayload.whatToBring, ...(payload.whatToBring || {}) },
          cards: payload.cards?.length ? payload.cards : defaultPayload.cards,
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
        fetch(`${base}/contact`, {
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
      setSuccess("Contact page updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateCard = (idx: number, key: keyof ContactCard, value: any) =>
    setData((prev) => {
      const cards = [...prev.cards];
      cards[idx] = { ...cards[idx], [key]: value };
      return { ...prev, cards };
    });

  const addCard = () =>
    setData((prev) => ({ ...prev, cards: [...prev.cards, { icon: "mail", title: "", value: "", hint: "" }] }));

  const removeCard = (idx: number) =>
    setData((prev) => ({ ...prev, cards: prev.cards.filter((_, i) => i !== idx) }));

  const updateChip = (idx: number, value: string) =>
    setData((prev) => {
      const chips = [...prev.hero.chips];
      chips[idx] = value;
      return { ...prev, hero: { ...prev.hero, chips } };
    });

  const addChip = () => setData((prev) => ({ ...prev, hero: { ...prev.hero, chips: [...prev.hero.chips, ""] } }));

  const removeChip = (idx: number) =>
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero, chips: prev.hero.chips.filter((_, i) => i !== idx) },
    }));

  const updateListItem = (key: "howWeWork" | "whatToBring", idx: number, value: string) =>
    setData((prev) => {
      const items = [...prev[key].items];
      items[idx] = value;
      return { ...prev, [key]: { ...prev[key], items } };
    });

  const addListItem = (key: "howWeWork" | "whatToBring") =>
    setData((prev) => ({ ...prev, [key]: { ...prev[key], items: [...prev[key].items, ""] } }));

  const removeListItem = (key: "howWeWork" | "whatToBring", idx: number) =>
    setData((prev) => ({ ...prev, [key]: { ...prev[key], items: prev[key].items.filter((_, i) => i !== idx) } }));

  return (
    <AdminLayout
      title="Contact Management"
      description="Control the contact hero, cards, form text, and guidance."
      navItems={adminNavLinks}
      sections={[{ id: "contact", label: "Contact" }]}
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
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={data.hero.badge} onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subheading</label>
            <Input
              value={data.hero.subheading}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, subheading: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Chips</p>
              <Button variant="outline" size="sm" onClick={addChip}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {data.hero.chips.map((chip, idx) => (
              <div key={idx} className="flex gap-2">
                <Input value={chip} onChange={(e) => updateChip(idx, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeChip(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Contact cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.cards.map((card, idx) => (
            <div key={idx} className="border border-border/60 rounded-xl p-3 space-y-2">
              <div className="grid md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Icon</label>
                  <Input value={card.icon} onChange={(e) => updateCard(idx, "icon", e.target.value as ContactCard["icon"])} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input value={card.title} onChange={(e) => updateCard(idx, "title", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Value</label>
                  <Input value={card.value} onChange={(e) => updateCard(idx, "value", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hint</label>
                  <Input value={card.hint} onChange={(e) => updateCard(idx, "hint", e.target.value)} />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeCard(idx)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addCard}>
            <Plus className="w-4 h-4 mr-2" />
            Add card
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={data.form.title} onChange={(e) => setData({ ...data, form: { ...data.form, title: e.target.value } })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={data.form.description}
              onChange={(e) => setData({ ...data, form: { ...data.form, description: e.target.value } })}
              rows={3}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">CTA label</label>
              <Input
                value={data.form.ctaLabel}
                onChange={(e) => setData({ ...data, form: { ...data.form, ctaLabel: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reply note</label>
              <Input
                value={data.form.replyNote}
                onChange={(e) => setData({ ...data, form: { ...data.form, replyNote: e.target.value } })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>How we work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={data.howWeWork.title}
            onChange={(e) => setData({ ...data, howWeWork: { ...data.howWeWork, title: e.target.value } })}
          />
          {data.howWeWork.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={item} onChange={(e) => updateListItem("howWeWork", idx, e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeListItem("howWeWork", idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => addListItem("howWeWork")}>
            <Plus className="w-4 h-4 mr-2" />
            Add item
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>What to bring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={data.whatToBring.title}
            onChange={(e) => setData({ ...data, whatToBring: { ...data.whatToBring, title: e.target.value } })}
          />
          {data.whatToBring.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={item} onChange={(e) => updateListItem("whatToBring", idx, e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeListItem("whatToBring", idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => addListItem("whatToBring")}>
            <Plus className="w-4 h-4 mr-2" />
            Add item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save all"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminContact;

