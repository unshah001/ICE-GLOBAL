import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { navItems } from "@/data/expo-data";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

type ContactCard = { icon: "mail" | "phone" | "map" | "clock"; title: string; value: string; hint: string };
type ContactContent = {
  hero: { badge: string; title: string; subheading: string; chips: string[] };
  cards: ContactCard[];
  form: { title: string; description: string; ctaLabel: string; replyNote: string };
  howWeWork: { title: string; items: string[] };
  whatToBring: { title: string; items: string[] };
};

const defaultContent: ContactContent = {
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

type DynamicField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "number";
  required?: boolean;
  options?: string[];
};

const Contact = () => {
  const [form, setForm] = useState<Record<string, string>>({ name: "", email: "", company: "", message: "" });
  const [fields, setFields] = useState<DynamicField[]>([
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Email", type: "email", required: true },
    { id: "company", label: "Company", type: "text", required: false },
    { id: "message", label: "Project details", type: "textarea", required: true },
  ]);
  const [content, setContent] = useState<ContactContent>(defaultContent);

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = import.meta.env.VITE_API_BASE_URL || "";
    fetch(`${base}/forms/contact/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed");
        return res.json();
      })
      .then(() => {
        setForm({});
        alert(content.form.successMessage);
      })
      .catch(() => alert("Unable to send right now. Please try again."));
  };

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/contact`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as Partial<ContactContent>;
        setContent({
          hero: { ...defaultContent.hero, ...(data.hero || {}) },
          cards: data.cards && data.cards.length ? data.cards : defaultContent.cards,
          form: { ...defaultContent.form, ...(data.form || {}) },
          howWeWork: { ...defaultContent.howWeWork, ...(data.howWeWork || {}) },
          whatToBring: { ...defaultContent.whatToBring, ...(data.whatToBring || {}) },
        });
      } catch {
        setContent(defaultContent);
      }
    };
    const loadForm = async () => {
      try {
        const res = await fetch(`${base}/forms/contact`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (Array.isArray(data.fields) && data.fields.length) {
          setFields(data.fields);
          const initial: Record<string, string> = {};
          data.fields.forEach((f: DynamicField) => {
            initial[f.id] = "";
          });
          setForm(initial);
        }
      } catch {
        // keep defaults
      }
    };
    load();
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconMap = useMemo(
    () => ({
      mail: Mail,
      phone: Phone,
      map: MapPin,
      clock: Clock,
    }),
    []
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative overflow-hidden pt-28 md:pt-36 pb-14">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-5">
            <Badge variant="secondary" className="text-xs uppercase tracking-[0.25em]">
              {content.hero.badge}
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                {content.hero.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
                {content.hero.subheading}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {content.hero.chips.map((chip) => (
                <Badge key={chip} variant="outline">
                  {chip}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {content.cards.map((card, idx) => {
              const Icon = iconMap[card.icon] || Mail;
              return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                <div className="relative space-y-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="font-display font-semibold">{card.title}</div>
                  <div className="text-foreground">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.hint}</div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-5 gap-10 justify-center items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">{content.form.title}</h2>
            <p className="text-muted-foreground">{content.form.description}</p>
          </div>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 glass rounded-3xl border border-border/60 p-6 md:p-8 space-y-4 max-w-3xl w-full mx-auto"
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
            <div className="flex flex-wrap gap-3 items-center">
              <Button type="submit" variant="hero">
                {content.form.ctaLabel}
              </Button>
              <p className="text-sm text-muted-foreground">{content.form.replyNote}</p>
            </div>
          </motion.form>
        </div>
      </section>

      <section className="section-padding bg-card/40 border-t border-border/60">
        <div className="container-custom grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-primary/10"
          >
            <h3 className="text-xl font-display font-semibold mb-3">{content.howWeWork.title}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {content.howWeWork.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card/70 to-secondary/10 p-6"
          >
            <h3 className="text-xl font-display font-semibold mb-3">{content.whatToBring.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {content.whatToBring.items.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contact;
