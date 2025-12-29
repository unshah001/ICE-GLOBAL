import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";

type TermsSection = { title: string; body: string };
type TermsContent = { hero: { badge: string; title: string; intro: string; updated: string }; sections: TermsSection[] };

const defaultContent: TermsContent = {
  hero: {
    badge: "Legal",
    title: "Terms of Service",
    intro: "These terms govern your use of our website and services. By accessing the site, you agree to these terms.",
    updated: "2024",
  },
  sections: [
    {
      title: "Use of the site",
      body: "You may browse and use the site for lawful purposes. Do not disrupt, attempt to breach security, or misuse content.",
    },
    {
      title: "Content & IP",
      body: "All branding, media, and copy are owned by India Global Expo or our partners. Do not reproduce without permission.",
    },
    {
      title: "Links to third parties",
      body: "External links are provided for convenience. We are not responsible for third-party content or practices.",
    },
    {
      title: "Disclaimers",
      body:
        "The site is provided “as is.” We do not guarantee uninterrupted access. To the extent permitted by law, we exclude liability for indirect or consequential damages.",
    },
    {
      title: "Changes",
      body: "We may update these terms. Continued use after changes means you accept the updated terms.",
    },
    {
      title: "Governing law",
      body: "These terms are governed by the laws of India. Disputes will be handled in Bangalore jurisdiction.",
    },
  ],
};

const Terms = () => {
  const [content, setContent] = useState<TermsContent>(defaultContent);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/terms`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as Partial<TermsContent>;
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
              <p className="text-muted-foreground">{section.body}</p>
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

export default Terms;
