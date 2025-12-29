import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";

type CookieSection = { title: string; body: string; bullets: string[] };
type CookiesContent = { hero: { badge: string; title: string; intro: string; updated: string }; sections: CookieSection[] };

const defaultContent: CookiesContent = {
  hero: {
    badge: "Legal",
    title: "Cookie Policy",
    intro: "This policy explains how we use cookies and similar technologies on our site.",
    updated: "2024",
  },
  sections: [
    {
      title: "What are cookies?",
      body: "Cookies are small text files stored on your device to improve site experience and remember preferences.",
      bullets: [],
    },
    {
      title: "How we use cookies",
      body: "",
      bullets: [
        "Essential: to keep the site functioning (navigation, forms).",
        "Analytics: to understand traffic and improve content.",
        "Preferences: to remember language/theme choices.",
      ],
    },
    {
      title: "Managing cookies",
      body: "You can adjust browser settings to block or delete cookies. Some features may not work without essential cookies.",
      bullets: [],
    },
    {
      title: "Third-party cookies",
      body: "Services like analytics or media embeds may set their own cookies. Review their policies for details.",
      bullets: [],
    },
  ],
};

const Cookies = () => {
  const [content, setContent] = useState<CookiesContent>(defaultContent);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/cookies`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as Partial<CookiesContent>;
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

export default Cookies;
