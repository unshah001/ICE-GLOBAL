import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems, testimonials as fallbackTestimonials } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5 },
  }),
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string }[];
  rating: number;
  quote: string;
};

type HeroCopy = {
  badge: string;
  title: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  ctaBadge: string;
  ctaTitle: string;
  ctaBody: string;
};

const defaultHero: HeroCopy = {
  badge: "Voices",
  title: "Testimonials",
  intro: "What our partners, founders, and attendees say about INDIA GLOBAL EXPO. Animated stories from the floor to the main stage.",
  ctaLabel: "Send feedback",
  ctaHref: "/feedback",
  ctaBadge: "Share yours",
  ctaTitle: "Were you at the expo?",
  ctaBody: "Tell us what you loved, what you’d improve, and what you want to see next year. Your feedback shapes the next edition.",
};

const TestimonialsPage = () => {
  const [items, setItems] = useState<Testimonial[]>(fallbackTestimonials);
  const [hero, setHero] = useState(defaultHero);
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";

  const toUrl = (pathOrUrl: string) => {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const trimmed = mediaBase.replace(/\/$/, "");
    return `${trimmed}/${pathOrUrl.replace(/^\/+/, "")}`;
  };

  const resolveImage = (t: Testimonial) => {
    const main = t.variants?.find((v) => v.key === "main") ?? t.variants?.[0];
    const thumb = t.variants?.find((v) => v.key === "thumb");
    const primary = main?.path ? toUrl(main.path) : main?.fileName ? toUrl(main.fileName) : t.image;
    const fallback = thumb?.path ? toUrl(thumb.path) : thumb?.fileName ? toUrl(thumb.fileName) : primary;
    return { primary, fallback };
  };

  const normalize = (list: Testimonial[]) =>
    list.map((t) => ({
      ...t,
      variants: t.variants && t.variants.length ? t.variants : [{ key: "main", path: t.image }],
    }));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/testimonials`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setItems(data.testimonials?.length ? normalize(data.testimonials) : normalize(fallbackTestimonials));
        setHero({
          badge: data.hero?.badge || defaultHero.badge,
          title: data.hero?.title || defaultHero.title,
          intro: data.hero?.intro || defaultHero.intro,
          ctaLabel: data.hero?.ctaLabel || defaultHero.ctaLabel,
          ctaHref: data.hero?.ctaHref || defaultHero.ctaHref,
          ctaBadge: data.hero?.ctaBadge || defaultHero.ctaBadge,
          ctaTitle: data.hero?.ctaTitle || defaultHero.ctaTitle,
          ctaBody: data.hero?.ctaBody || defaultHero.ctaBody,
        });
      } catch {
        setItems(normalize(fallbackTestimonials));
        setHero(defaultHero);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative overflow-hidden pt-28 md:pt-36 pb-14">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background pointer-events-none" />
        <div className="container-custom relative space-y-4">
          <Badge variant="secondary" className="text-xs uppercase tracking-[0.25em]">
            {hero.badge}
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-display font-bold"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-3xl text-lg"
          >
            {hero.intro}
          </motion.p>
        </div>
      </section>

      <section className="container-custom pb-16 space-y-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => {
            const img = resolveImage(t);
            return (
              <motion.div
                key={t.name}
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                <div className="relative flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={img.primary}
                      onError={(e) => {
                        if (img.fallback && e.currentTarget.src !== img.fallback) {
                          e.currentTarget.src = img.fallback;
                        }
                      }}
                      alt={t.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/30 shadow-md"
                    />
                    <div>
                      <div className="font-display font-semibold text-lg">{t.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-primary" />
                    ))}
                  </div>
                  <motion.p initial={{ opacity: 0.6 }} whileHover={{ opacity: 1, y: -2 }} className="text-muted-foreground leading-relaxed">
                    {t.quote}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 10 }} whileHover={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.2em] text-primary">
                    Live on stage · {t.rating}-star experience
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl border border-border/60 bg-card/70 p-6 md:p-8 text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
            {hero.ctaBadge}
          </div>
          <h2 className="text-3xl font-display font-bold">{hero.ctaTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {hero.ctaBody}
          </p>
          <a
            href={hero.ctaHref}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:translate-y-[-2px] transition-all"
          >
            {hero.ctaLabel}
          </a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
};

export default TestimonialsPage;
