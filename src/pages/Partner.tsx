import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prefillFormValues, useProfilePrefill } from "@/hooks/useProfilePrefill";

type Field = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "number";
  required?: boolean;
  options?: string[];
};

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
  const [form, setForm] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Field[]>([
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Email", type: "email", required: true },
    { id: "company", label: "Company", type: "text" },
    { id: "goals", label: "Goals & vision", type: "textarea", required: true },
  ]);
  const [content, setContent] = useState<PartnerPayload>(defaultPayload);
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();
  const { profile } = useProfilePrefill();

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${base}/forms/partner/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submit failed");
      setForm({});
      navigate("/submit-success", { state: { message: content.form.successMessage } });
    } catch {
      navigate("/submit-error", { state: { message: "Unable to send right now. Please try again." } });
    }
  };

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
    const loadForm = async () => {
      try {
        const res = await fetch(`${base}/forms/partner`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (Array.isArray(data.fields) && data.fields.length) {
          setFields(data.fields);
          const initial: Record<string, string> = {};
          data.fields.forEach((f: Field) => {
            initial[f.id] = "";
          });
          setForm(initial);
        }
      } catch {
        const initial: Record<string, string> = {};
        fields.forEach((f) => (initial[f.id] = ""));
        setForm(initial);
      }
    };
    load();
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile || !fields.length) return;
    setForm((prev) => prefillFormValues(prev, fields, profile));
  }, [profile, fields]);

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

      <section className="container-custom pb-16 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="glass rounded-3xl border border-border/60 p-6 md:p-8 space-y-4 max-w-3xl w-full"
        >
          {fields.map((field) => {
            const common = {
              required: field.required,
              value: form[field.id] || "",
              onChange: handleChange(field.id),
            };
            return (
              <div key={field.id}>
                <label className="text-sm text-muted-foreground block mb-2">{field.label}</label>
                {field.type === "textarea" ? (
                  <Textarea {...common} rows={4} />
                ) : field.type === "select" ? (
                  <select
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    {...common}
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input type={field.type === "number" ? "number" : field.type} {...common} />
                )}
              </div>
            );
          })}
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
