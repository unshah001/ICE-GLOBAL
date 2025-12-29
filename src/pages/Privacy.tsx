import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";

type PrivacySection = { title: string; body: string; bullets: string[] };
type PrivacyContent = { hero: { badge: string; title: string; intro: string; updated: string }; sections: PrivacySection[] };

const defaultContent: PrivacyContent = {
  hero: {
    badge: "Legal",
    title: "Privacy Policy",
    intro: "We respect your privacy. This policy explains what data we collect, how we use it, and the choices you have.",
    updated: "2024",
  },
  sections: [
    {
      title: "Information we collect",
      body: "",
      bullets: [
        "Contact details you provide (name, email, company) via forms.",
        "Usage data (pages viewed, interactions) through analytics.",
        "Device and browser information (IP, user agent) for security and analytics.",
      ],
    },
    {
      title: "How we use information",
      body: "",
      bullets: [
        "To respond to inquiries and manage event participation.",
        "To improve our site experience and content.",
        "To secure our services, prevent abuse, and comply with legal obligations.",
        "To send updates you opt into; you can opt out anytime.",
      ],
    },
    {
      title: "Data sharing",
      body:
        "We do not sell your data. We share it only with service providers who help us operate the site (hosting, analytics, email) under confidentiality terms, or when required by law.",
      bullets: [],
    },
    {
      title: "Data retention",
      body:
        "We keep data only as long as needed for the purposes above or to meet legal requirements. You can request deletion of your personal data unless we must keep it for legal reasons.",
      bullets: [],
    },
    {
      title: "Your rights",
      body: "",
      bullets: [
        "Access, correct, or delete your personal data.",
        "Withdraw consent for communications.",
        "Contact us to exercise these rights: privacy@indiaglobalexpo.com.",
      ],
    },
    {
      title: "Contact",
      body: "For privacy inquiries, email privacy@indiaglobalexpo.com or write to us at Bangalore, India.",
      bullets: [],
    },
  ],
};

const Privacy = () => {
  const [content, setContent] = useState<PrivacyContent>(defaultContent);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/privacy`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as Partial<PrivacyContent>;
        setContent({
          hero: { ...defaultContent.hero, ...(data.hero || {}) },
          sections: data.sections && data.sections.length ? data.sections : defaultContent.sections,
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

      <section className="container-custom pt-28 md:pt-36 pb-12 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">{content.hero.badge}</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold">{content.hero.title}</h1>
          <p className="text-muted-foreground max-w-3xl">{content.hero.intro}</p>
        </div>

        <div className="space-y-6 max-w-4xl">
          {content.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-xl font-display font-semibold">{section.title}</h2>
              {section.body && <p className="text-muted-foreground">{section.body}</p>}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="text-xs text-muted-foreground">Last updated: {content.hero.updated}</p>
        </div>

        <Link to="/" className="inline-flex text-primary hover:text-primary/80 text-sm">
          Back to home
        </Link>
      </section>

      <Footer />
    </main>
  );
};

export default Privacy;
