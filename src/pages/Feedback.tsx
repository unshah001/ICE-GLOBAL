import { useEffect, useState } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Field = { id: string; label: string; type: "text" | "email" | "textarea" | "select" | "number"; required?: boolean; options?: string[] };

type FeedbackContent = {
  hero: { badge: string; title: string; subheading: string };
  form: {
    buttonLabel: string;
    note: string;
    successMessage: string;
  };
};

const defaultContent: FeedbackContent = {
  hero: {
    badge: "Feedback",
    title: "Share your experience",
    subheading: "Tell us what you loved and what we can improve. Your input shapes the next INDIA GLOBAL EXPO.",
  },
  form: {
    buttonLabel: "Submit feedback",
    note: "We read every response.",
    successMessage: "Thanks for your feedback! We appreciate your time.",
  },
};

const defaultFields: Field[] = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "role", label: "Role", type: "text" },
  { id: "rating", label: "Rating (1-5)", type: "number", required: true },
  { id: "message", label: "Feedback", type: "textarea", required: true },
];

const Feedback = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [content, setContent] = useState<FeedbackContent>(defaultContent);
  const [fields, setFields] = useState<Field[]>(defaultFields);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${base}/forms/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submit failed");
      setForm({});
      alert(content.form.successMessage);
    } catch {
      alert("Unable to send right now. Please try again.");
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch(`${base}/feedback`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setContent({
          hero: { ...defaultContent.hero, ...(data.hero || {}) },
          form: { ...defaultContent.form, ...(data.form || {}) },
        });
      } catch {
        setContent(defaultContent);
      }
    };
    const loadForm = async () => {
      try {
        const res = await fetch(`${base}/forms/feedback`);
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
        defaultFields.forEach((f) => (initial[f.id] = ""));
        setForm(initial);
      }
    };
    loadContent();
    loadForm();
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
