import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import { StatsStrip } from "@/components/ui/stats-strip";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import Footer from "@/components/Footer";
import { navItems, stats, brandHighlights, timelineContent } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CTA = { label: string; href: string };
type Platform = { eyebrow: string; title: string; body: string; cta: CTA };
type Pillar = { title: string; body: string };
type AboutContent = {
  hero: { badge: string; title: string; body: string; primaryCta: CTA; secondaryCta: CTA };
  platforms: Platform[];
  pillars: Pillar[];
  timeline: { badge: string; title: string; body: string };
  partners: { title: string; body: string; cta: CTA };
  work: { badge: string; title: string; body: string; bullets: string[]; primaryCta: CTA; secondaryCta: CTA };
};

const fallbackAbout: AboutContent = {
  hero: {
    badge: "About ICE",
    title: "Production-grade expos with festival energy",
    body:
      "We engineer the arrivals, stages, booths, and broadcasts that make brands feel cinematic and buyers feel invited—online and on-ground.",
    primaryCta: { label: "Talk to production", href: "/contact" },
    secondaryCta: { label: "Review the moments", href: "/gallery" },
  },
  platforms: [
    {
      eyebrow: "ICE 1.0",
      title: "Offline expo platform",
      body: "A decade of physical showcases across India—arches, pavilions, lounges, and stages built to festival standards.",
      cta: { label: "See legacy moments", href: "/gallery" },
    },
    {
      eyebrow: "ICE 2.0 · IGE & IGN",
      title: "Hybrid + digital platform",
      body: "Broadcast-grade streams, press-ready content, and data-backed attendee journeys that extend every launch.",
      cta: { label: "Plan a hybrid drop", href: "/contact" },
    },
  ],
  pillars: [
    { title: "Stagecraft", body: "Cinematic main stages, responsive lighting, and immersive entrances that set the tone the moment guests arrive." },
    { title: "Hybrid by design", body: "ICE 2.0 bridges on-ground experiences with live streams, media pods, and digital routes that keep audiences connected." },
    { title: "Measurable impact", body: "Dwell-time, sentiment, and lead capture measured in real time so every experience maps to outcomes." },
  ],
  timeline: {
    badge: "Legacy in motion",
    title: "Our 30-year timeline",
    body: "The milestones that took ICE from a single-city showcase to a hybrid platform spanning 10 cities.",
  },
  partners: {
    title: "Partners that shape the expo",
    body: "Headline sponsors and indie makers co-create with us to set the tone for every edition.",
    cta: { label: "View a partner story", href: "/brands/techvision-labs" },
  },
  work: {
    badge: "Work with us",
    title: "Let’s design your next launch",
    body: "Bring your product, keynote, or pavilion story. We’ll stage it, film it, and measure it.",
    bullets: [
      "Production: staging, AV, lighting, XR, responsive entrances",
      "Experience design: wayfinding, lounges, interactive installs",
      "Content ops: live streaming, media pods, press kits",
      "Measurement: dwell time, sentiment, and lead capture in real time",
    ],
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See past highlights", href: "/gallery" },
  },
};

const About = () => {
  const [about, setAbout] = useState<AboutContent>(fallbackAbout);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/about`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAbout(data);
      } catch {
        setAbout(fallbackAbout);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-20">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-xs uppercase tracking-[0.25em]">
              {about.hero.badge}
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">{about.hero.title}</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">{about.hero.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero">
                <Link to={about.hero.primaryCta.href}>{about.hero.primaryCta.label}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={about.hero.secondaryCta.href}>{about.hero.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative h-full"
          >
            <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl space-y-4">
              {about.platforms.map((card) => (
                <div key={card.title} className="rounded-2xl border border-border/60 bg-card/80 p-5 space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                    {card.eyebrow}
                  </div>
                  <h3 className="text-xl font-display font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.body}</p>
                  <Link to={card.cta.href || "/"} className="text-primary text-sm font-semibold hover:text-primary/80">
                    {card.cta.label || "Learn more"}
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <StatsStrip stats={stats} className="bg-card/40 border-y border-border/70" />

      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">What we build</h2>
            <p className="text-muted-foreground">
              Every edition blends production, technology, and operations into a single playbook that travels with us.
            </p>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
            {about.pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                <div className="relative space-y-2">
                  <h3 className="text-xl font-display font-semibold">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm">{pillar.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom space-y-6 text-center">
          <Badge variant="secondary" className="mx-auto">
            {about.timeline.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold">{about.timeline.title}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">{about.timeline.body}</p>
        </div>
        <StickyScrollReveal content={timelineContent} />
      </section>

      <section className="section-padding bg-card/40 border-y border-border/60">
        <div className="container-custom space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">{about.partners.title}</h2>
              <p className="text-muted-foreground max-w-2xl">{about.partners.body}</p>
            </div>
            <Button asChild variant="outline">
              <Link to={about.partners.cta.href || "/brands"}>{about.partners.cta.label || "View a partner story"}</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandHighlights.map((brand) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4"
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-36 object-cover rounded-xl mb-3 border border-border/60"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{brand.relationship}</p>
                    <p className="font-display font-semibold">{brand.name}</p>
                  </div>
                  <Badge variant="secondary">{brand.category}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <Badge variant="secondary">{about.work.badge}</Badge>
            <h3 className="text-3xl md:text-4xl font-display font-bold">{about.work.title}</h3>
            <p className="text-muted-foreground">{about.work.body}</p>
            <div className="flex gap-3">
              <Button asChild variant="hero">
                <Link to={about.work.primaryCta.href}>{about.work.primaryCta.label}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={about.work.secondaryCta.href}>{about.work.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-primary/10"
          >
            <ul className="space-y-3 text-sm text-muted-foreground">
              {about.work.bullets.map((b, idx) => (
                <li key={idx}>• {b}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default About;
