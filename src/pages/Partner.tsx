import { useEffect, useState } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const Partner = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", goals: "" });
  const [content, setContent] = useState<PartnerPayload>(defaultPayload);

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ name: "", email: "", company: "", goals: "" });
    alert(content.form.successMessage);
  };

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/partner`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as PartnerPayload;
        setContent({
          hero: { ...defaultPayload.hero, ...(data.hero || {}) },
          form: { ...defaultPayload.form, ...(data.form || {}) },
        });
      } catch {
        setContent(defaultPayload);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="container-custom pt-28 md:pt-36 pb-12 space-y-6">
        <Badge variant="secondary" className="text-xs uppercase tracking-[0.25em]">
          {content.hero.badge}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-display font-bold">{content.hero.title}</h1>
        <p className="text-muted-foreground max-w-3xl">{content.hero.subheading}</p>
      </section>

      <section className="container-custom pb-16">
        <form
          onSubmit={handleSubmit}
          className="glass rounded-3xl border border-border/60 p-6 md:p-8 space-y-4 max-w-3xl"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Name</label>
              <Input value={form.name} onChange={handleChange("name")} required placeholder={content.form.namePlaceholder} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">{content.form.emailLabel}</label>
              <Input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
                placeholder={content.form.emailPlaceholder}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">{content.form.companyLabel}</label>
            <Input value={form.company} onChange={handleChange("company")} placeholder={content.form.companyPlaceholder} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">{content.form.goalsLabel}</label>
            <Textarea
              value={form.goals}
              onChange={handleChange("goals")}
              required
              rows={4}
              placeholder={content.form.goalsPlaceholder}
            />
          </div>
          <div className="flex gap-3 items-center">
            <Button type="submit" variant="hero">
              {content.form.ctaLabel}
            </Button>
            <p className="text-sm text-muted-foreground">{content.form.note}</p>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
};

export default Partner;
