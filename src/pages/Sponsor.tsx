import { useEffect, useState } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SponsorPayload = {
  hero: { badge: string; title: string; subheading: string };
  form: {
    nameLabel: string;
    emailLabel: string;
    companyLabel: string;
    budgetLabel: string;
    goalsLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    companyPlaceholder: string;
    budgetPlaceholder: string;
    goalsPlaceholder: string;
    ctaLabel: string;
    note: string;
    successMessage: string;
  };
};

const defaultPayload: SponsorPayload = {
  hero: {
    badge: "Sponsorships",
    title: "Sponsor an Event",
    subheading:
      "Put your brand at the center of the expo. Tell us your objectives and budget so we can tailor a sponsorship that delivers attention and ROI.",
  },
  form: {
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    budgetLabel: "Budget range",
    goalsLabel: "What do you want to achieve?",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@company.com",
    companyPlaceholder: "Brand or organization",
    budgetPlaceholder: "e.g., $25k–$75k",
    goalsPlaceholder: "Share goals like reach, leads, categories, or specific placements.",
    ctaLabel: "Submit",
    note: "We reply within 1–2 business days.",
    successMessage: "Thanks for your interest in sponsoring. We'll contact you soon.",
  },
};

const Sponsor = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", budget: "", message: "" });
  const [content, setContent] = useState<SponsorPayload>(defaultPayload);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ name: "", email: "", company: "", budget: "", message: "" });
    alert(content.form.successMessage);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/sponsor`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as SponsorPayload;
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
              <label className="text-sm text-muted-foreground block mb-2">{content.form.nameLabel}</label>
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
            <label className="text-sm text-muted-foreground block mb-2">{content.form.budgetLabel}</label>
            <Input value={form.budget} onChange={handleChange("budget")} placeholder={content.form.budgetPlaceholder} required />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">{content.form.goalsLabel}</label>
            <Textarea
              value={form.message}
              onChange={handleChange("message")}
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

export default Sponsor;
