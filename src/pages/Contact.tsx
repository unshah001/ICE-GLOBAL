
import { useEffect, useMemo, useState } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { navItems } from "@/data/expo-data";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { prefillFormValues, useProfilePrefill } from "@/hooks/useProfilePrefill";

type ContactCard = {
  icon: "mail" | "phone" | "map" | "clock";
  title: string;
  value: string;
  hint: string;
};

type DynamicField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  required?: boolean;
  options?: string[];
};

const selectStyle =
  "w-full border rounded-xl px-4 py-2 pr-12 appearance-none bg-background focus:outline-none focus:ring-2 focus:ring-primary";

const contactCards: ContactCard[] = [
  {
    icon: "mail",
    title: "Email",
    value: "hello@ICEglobal.com",
    hint: "We reply within one business day",
  },
  {
    icon: "phone",
    title: "Phone",
    value: "+91 98765 43210",
    hint: "Mon–Fri 9:30 AM – 6:30 PM IST",
  },
  {
    icon: "map",
    title: "Head Office",
    value: "Bengaluru, India",
    hint: "Visit by appointment",
  },
  {
    icon: "clock",
    title: "Turnaround",
    value: "2–3 days for proposals",
    hint: "Faster for partners",
  },
];

const defaultFields: DynamicField[] = [
  { id: "name", label: "Full Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "company", label: "Company Name", type: "text", required: true },
  { id: "role", label: "Role / Designation", type: "text" },
  {
    id: "eventType",
    label: "Event Type",
    type: "select",
    options: [
      "Product Launch",
      "Trade Show Booth",
      "Corporate Event",
      "Conference",
    ],
  },
  {
    id: "budget",
    label: "Budget Range",
    type: "select",
    options: ["$5k-$10k", "$10k-$25k", "$25k-$50k", "$50k+"],
  },
  {
    id: "source",
    label: "How did you hear about us?",
    type: "select",
    options: ["Google", "LinkedIn", "Referral", "Event"],
  },
  { id: "message", label: "Project Details", type: "textarea", required: true },
];

const Contact = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const fields = defaultFields;
  const { profile } = useProfilePrefill();

  const iconMap = useMemo(
    () => ({
      mail: Mail,
      phone: Phone,
      map: MapPin,
      clock: Clock,
    }),
    []
  );

  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.id] = ""));
    setForm(initial);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => prefillFormValues(prev, fields, profile));
  }, [profile]);

  const validateField = (field: DynamicField, value: string) => {
    if (field.required && !value) return `${field.label} is required`;

    if (field.type === "email") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (value && !emailRegex.test(value)) return "Please enter a valid email";
    }

    return "";
  };

  const handleChange =
    (key: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleBlur = (field: DynamicField) => {
    const err = validateField(field, form[field.id]);
    setErrors((prev) => ({ ...prev, [field.id]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const err = validateField(field, form[field.id]);
      if (err) newErrors[field.id] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length) return;

    try {
      const base = import.meta.env.VITE_API_BASE_URL || "";

      await fetch(`${base}/forms/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setSubmitted(true);
    } catch {
      alert("Unable to submit right now");
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold">Thank you {form.name}</h2>
          <p className="text-muted-foreground">
            Our team will respond within 24 hours.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={navItems} />

      {/* HERO */}
      <section className="pt-36 pb-16 container-custom">
        <Badge className="mb-5 text-center">Contact</Badge>

        <h1 className="text-5xl font-bold mb-4">
          Let's design your next show-stopping moment
        </h1>

        <p className="text-muted-foreground max-w-xl">
          Tell us what you want to launch or showcase. We'll create a tailored
          experience.
        </p>
      </section>

      {/* CONTACT + FORM */}
      <section className="container-custom grid lg:grid-cols-5 gap-12">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {contactCards.map((card) => {
            const Icon = iconMap[card.icon];

            return (
              <div key={card.title} className="border rounded-xl p-5">
                <Icon className="w-5 h-5 text-primary mb-2" />

                <div className="font-semibold">{card.title}</div>

                {card.icon === "mail" ? (
                  <a href={`mailto:${card.value}`} className="text-primary">
                    {card.value}
                  </a>
                ) : card.icon === "phone" ? (
                  <a href={`tel:${card.value}`} className="text-primary">
                    {card.value}
                  </a>
                ) : (
                  <div>{card.value}</div>
                )}

                <div className="text-xs text-muted-foreground">
                  {card.hint}
                </div>
              </div>
            );
          })}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 border rounded-2xl p-8 space-y-4"
        >
          {fields.map((field) => {
            const common = {
              value: form[field.id] || "",
              onChange: handleChange(field.id),
              onBlur: () => handleBlur(field),
            };

            return (
              <div key={field.id}>
                <label className="text-sm text-muted-foreground block mb-2">
                  {field.label}
                </label>

                {field.type === "textarea" ? (
                  <Textarea rows={4} className={selectStyle} {...common} />
                ) : field.type === "select" ? (
                  <div className="relative">
                    <select className={selectStyle} {...common}>
                      <option value="">Select</option>
                      {field.options?.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Input type={field.type} className={selectStyle} {...common} />
                )}

                {errors[field.id] && (
                  <p className="text-red-500 text-sm">{errors[field.id]}</p>
                )}
              </div>
            );
          })}

          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </section>

      {/* GOOGLE MAP BELOW FORM */}
      <section className="container-custom mt-16">
        <div className="border rounded-xl overflow-hidden">
          <iframe
            src="https://www.google.com/maps?q=Thomas%20Cook%20Jayanagar%20Bangalore&output=embed"
            loading="lazy"
            className="w-full h-[500px] border-0"
          ></iframe>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contact;