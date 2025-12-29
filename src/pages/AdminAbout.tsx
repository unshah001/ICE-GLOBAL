import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { type AdminSectionLink } from "@/components/admin/AdminSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";

interface CTA { label: string; href: string }
interface Platform { eyebrow: string; title: string; body: string; cta: CTA }
interface Pillar { title: string; body: string }
interface AboutContent {
  hero: { badge: string; title: string; body: string; primaryCta: CTA; secondaryCta: CTA };
  platforms: Platform[];
  pillars: Pillar[];
  timeline: { badge: string; title: string; body: string };
  partners: { title: string; body: string; cta: CTA };
  work: { badge: string; title: string; body: string; bullets: string[]; primaryCta: CTA; secondaryCta: CTA };
}

const defaultAbout: AboutContent = {
  hero: {
    badge: "About ICE",
    title: "Production-grade expos with festival energy",
    body:
      "We engineer the arrivals, stages, booths, and broadcasts that make brands feel cinematic and buyers feel invited—online and on-ground.",
    primaryCta: { label: "Talk to production", href: "/contact" },
    secondaryCta: { label: "Review the moments", href: "/gallery" },
  },
  platforms: [
    {
      eyebrow: "ICE 1.0",
      title: "Offline expo platform",
      body: "A decade of physical showcases across India—arches, pavilions, lounges, and stages built to festival standards.",
      cta: { label: "See legacy moments", href: "/gallery" },
    },
    {
      eyebrow: "ICE 2.0 · IGE & IGN",
      title: "Hybrid + digital platform",
      body: "Broadcast-grade streams, press-ready content, and data-backed attendee journeys that extend every launch.",
      cta: { label: "Plan a hybrid drop", href: "/contact" },
    },
  ],
  pillars: [
    { title: "Stagecraft", body: "Cinematic main stages, responsive lighting, and immersive entrances that set the tone the moment guests arrive." },
    { title: "Hybrid by design", body: "ICE 2.0 bridges on-ground experiences with live streams, media pods, and digital routes that keep audiences connected." },
    { title: "Measurable impact", body: "Dwell-time, sentiment, and lead capture measured in real time so every experience maps to outcomes." },
  ],
  timeline: {
    badge: "Legacy in motion",
    title: "Our 30-year timeline",
    body: "The milestones that took ICE from a single-city showcase to a hybrid platform spanning 10 cities.",
  },
  partners: {
    title: "Partners that shape the expo",
    body: "Headline sponsors and indie makers co-create with us to set the tone for every edition.",
    cta: { label: "View a partner story", href: "/brands/techvision-labs" },
  },
  work: {
    badge: "Work with us",
    title: "Let’s design your next launch",
    body: "Bring your product, keynote, or pavilion story. We’ll stage it, film it, and measure it.",
    bullets: [
      "Production: staging, AV, lighting, XR, responsive entrances",
      "Experience design: wayfinding, lounges, interactive installs",
      "Content ops: live streaming, media pods, press kits",
      "Measurement: dwell time, sentiment, and lead capture in real time",
    ],
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See past highlights", href: "/gallery" },
  },
};

const AdminAbout = () => {
  const navItems = adminNavLinks;
  const sections: AdminSectionLink[] = [
    { id: "hero", label: "Hero" },
    { id: "platforms", label: "Platforms" },
    { id: "pillars", label: "Pillars" },
    { id: "timeline", label: "Timeline" },
    { id: "partners", label: "Partners" },
    { id: "work", label: "Work with us" },
  ];

  const [data, setData] = useState<AboutContent>(defaultAbout);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const updateField = (path: string[], value: any) =>
    setData((prev) => {
      const next: any = structuredClone(prev);
      let cursor: any = next;
      for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
      cursor[path[path.length - 1]] = value;
      return next;
    });

  const load = async () => {
    setError("");
    try {
      const res = await fetch(`${base}/about`);
      if (!res.ok) throw new Error("Failed to load about content");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Unable to load content");
    }
  };

  useEffect(() => {
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
    const json = await res.json();
    if (json.accessToken) localStorage.setItem("admin_access_token", json.accessToken);
    return json.accessToken as string;
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_access_token") || (await refreshAccessToken());
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new Error(info.message || "Save failed");
      }
      setSuccess("About page saved");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="About Page Management"
      description="Edit the About page hero, pillars, platforms, partners, and CTA copy."
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

      <div className="flex justify-end mb-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save About page"}
        </Button>
      </div>

      <Card id="hero" className="bg-card/80 border-border/70">
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={data.hero.badge} onChange={(e) => updateField(["hero", "badge"], e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={data.hero.title} onChange={(e) => updateField(["hero", "title"], e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Body</label>
              <Input value={data.hero.body} onChange={(e) => updateField(["hero", "body"], e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Primary CTA label</label>
              <Input
                value={data.hero.primaryCta.label}
                onChange={(e) => updateField(["hero", "primaryCta", "label"], e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Primary CTA href</label>
              <Input
                value={data.hero.primaryCta.href}
                onChange={(e) => updateField(["hero", "primaryCta", "href"], e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Secondary CTA label</label>
              <Input
                value={data.hero.secondaryCta.label}
                onChange={(e) => updateField(["hero", "secondaryCta", "label"], e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Secondary CTA href</label>
              <Input
                value={data.hero.secondaryCta.href}
                onChange={(e) => updateField(["hero", "secondaryCta", "href"], e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="platforms" className="bg-card/80 border-border/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Platforms</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateField(["platforms"], [...data.platforms, { eyebrow: "", title: "", body: "", cta: { label: "", href: "" } }])}
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.platforms.map((platform, idx) => (
            <div key={idx} className="rounded-xl border border-border/60 p-3 space-y-2">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Eyebrow</label>
                  <Input
                    value={platform.eyebrow}
                    onChange={(e) => {
                      const next = [...data.platforms];
                      next[idx] = { ...next[idx], eyebrow: e.target.value };
                      updateField(["platforms"], next);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input
                    value={platform.title}
                    onChange={(e) => {
                      const next = [...data.platforms];
                      next[idx] = { ...next[idx], title: e.target.value };
                      updateField(["platforms"], next);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body</label>
                <Input
                  value={platform.body}
                  onChange={(e) => {
                    const next = [...data.platforms];
                    next[idx] = { ...next[idx], body: e.target.value };
                    updateField(["platforms"], next);
                  }}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">CTA label</label>
                  <Input
                    value={platform.cta.label}
                    onChange={(e) => {
                      const next = [...data.platforms];
                      next[idx] = { ...next[idx], cta: { ...next[idx].cta, label: e.target.value } };
                      updateField(["platforms"], next);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CTA href</label>
                  <Input
                    value={platform.cta.href}
                    onChange={(e) => {
                      const next = [...data.platforms];
                      next[idx] = { ...next[idx], cta: { ...next[idx].cta, href: e.target.value } };
                      updateField(["platforms"], next);
                    }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateField(["platforms"], data.platforms.filter((_, i) => i !== idx))}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="pillars" className="bg-card/80 border-border/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pillars</CardTitle>
          <Button variant="outline" size="sm" onClick={() => updateField(["pillars"], [...data.pillars, { title: "", body: "" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          {data.pillars.map((pillar, idx) => (
            <div key={idx} className="rounded-xl border border-border/60 p-3 space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <Input
                  value={pillar.title}
                  onChange={(e) => {
                    const next = [...data.pillars];
                    next[idx] = { ...next[idx], title: e.target.value };
                    updateField(["pillars"], next);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body</label>
                <Input
                  value={pillar.body}
                  onChange={(e) => {
                    const next = [...data.pillars];
                    next[idx] = { ...next[idx], body: e.target.value };
                    updateField(["pillars"], next);
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateField(["pillars"], data.pillars.filter((_, i) => i !== idx))}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="timeline" className="bg-card/80 border-border/70">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Badge</label>
            <Input value={data.timeline.badge} onChange={(e) => updateField(["timeline", "badge"], e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={data.timeline.title} onChange={(e) => updateField(["timeline", "title"], e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Body</label>
            <Input value={data.timeline.body} onChange={(e) => updateField(["timeline", "body"], e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card id="partners" className="bg-card/80 border-border/70">
        <CardHeader>
          <CardTitle>Partners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={data.partners.title} onChange={(e) => updateField(["partners", "title"], e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CTA label</label>
              <Input value={data.partners.cta.label} onChange={(e) => updateField(["partners", "cta", "label"], e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CTA href</label>
              <Input value={data.partners.cta.href} onChange={(e) => updateField(["partners", "cta", "href"], e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Body</label>
              <Input value={data.partners.body} onChange={(e) => updateField(["partners", "body"], e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="work" className="bg-card/80 border-border/70">
        <CardHeader>
          <CardTitle>Work with us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={data.work.badge} onChange={(e) => updateField(["work", "badge"], e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={data.work.title} onChange={(e) => updateField(["work", "title"], e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Body</label>
            <Input value={data.work.body} onChange={(e) => updateField(["work", "body"], e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Bullets</p>
              <Button variant="outline" size="sm" onClick={() => updateField(["work", "bullets"], [...data.work.bullets, ""])}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {data.work.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={bullet}
                  onChange={(e) => {
                    const next = [...data.work.bullets];
                    next[idx] = e.target.value;
                    updateField(["work", "bullets"], next);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateField(["work", "bullets"], data.work.bullets.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Primary CTA label</label>
              <Input
                value={data.work.primaryCta.label}
                onChange={(e) => updateField(["work", "primaryCta", "label"], e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Primary CTA href</label>
              <Input value={data.work.primaryCta.href} onChange={(e) => updateField(["work", "primaryCta", "href"], e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Secondary CTA label</label>
              <Input
                value={data.work.secondaryCta.label}
                onChange={(e) => updateField(["work", "secondaryCta", "label"], e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Secondary CTA href</label>
              <Input
                value={data.work.secondaryCta.href}
                onChange={(e) => updateField(["work", "secondaryCta", "href"], e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAbout;
