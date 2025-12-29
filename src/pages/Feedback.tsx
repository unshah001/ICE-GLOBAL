import { useEffect, useState } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RatingOption = { value: string; label: string };
type FeedbackContent = {
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

const defaultContent: FeedbackContent = {
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

const Feedback = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
    rating: "5",
  });
  const [content, setContent] = useState<FeedbackContent>(defaultContent);

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ name: "", email: "", role: "", message: "", rating: "5" });
    alert(content.form.successMessage);
  };

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/feedback`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as Partial<FeedbackContent>;
        setContent({
          hero: { ...defaultContent.hero, ...(data.hero || {}) },
          form: { ...defaultContent.form, ...(data.form || {}) },
          ratingOptions: data.ratingOptions && data.ratingOptions.length ? data.ratingOptions : defaultContent.ratingOptions,
        });
      } catch {
        setContent(defaultContent);
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
              <Input value={form.name} onChange={handleChange("name")} placeholder={content.form.nameLabel} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">{content.form.emailLabel}</label>
              <Input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">{content.form.roleLabel}</label>
              <Input value={form.role} onChange={handleChange("role")} placeholder={content.form.rolePlaceholder} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">{content.form.ratingLabel}</label>
              <select
                value={form.rating}
                onChange={handleChange("rating")}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(content.ratingOptions || []).map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">{content.form.feedbackLabel}</label>
            <Textarea
              value={form.message}
              onChange={handleChange("message")}
              placeholder={content.form.feedbackPlaceholder}
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3 items-center">
            <Button type="submit" variant="hero">
              {content.form.buttonLabel}
            </Button>
            <p className="text-sm text-muted-foreground">{content.form.note}</p>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
};

export default Feedback;
