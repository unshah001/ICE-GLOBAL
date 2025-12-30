import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import NotFound from "./NotFound";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";

type FounderStory = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  heroVariants?: { key: string; path: string }[];
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type FounderItem = {
  id: string;
  name: string;
  title: string;
  era: string;
  focus: string;
  image: string;
  variants?: { key: string; path: string }[];
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: FounderStory;
};

const defaultCopy = {
  moreEyebrow: "More founders",
  moreTitle: "Explore more founder profiles",
  moreDescription: "Scroll to reveal more founders—tap to open their detailed profiles.",
};

const FounderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [founder, setFounder] = useState<FounderItem | null>(null);
  const [moreFounders, setMoreFounders] = useState<FounderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copy, setCopy] = useState(defaultCopy);
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const mediaBase = (import.meta.env.VITE_MEDIA_BASE_URL || "").replace(/\/$/, "");
  const resolveMedia = (path?: string) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return mediaBase ? `${mediaBase}/${path}` : path;
  };
  const pickVariant = (variants?: { key: string; path: string }[], preferred: string[] = []) => {
    if (!variants?.length) return undefined;
    for (const key of preferred) {
      const hit = variants.find((v) => v.key === key);
      if (hit) return hit.path;
    }
    return variants[0]?.path;
  };

  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/founders/${id}`);
        if (!res.ok) throw new Error("Founder fetch failed");
        const data = (await res.json()) as FounderItem;
        setFounder(data);
      } catch {
        setFounder(null);
      } finally {
        setLoading(false);
      }
    };
    const loadMore = async () => {
      try {
        const res = await fetch(`${base}/founders/list?limit=12`);
        if (!res.ok) throw new Error("List fetch failed");
        const data = await res.json();
        setMoreFounders((data.data || []).filter((f: FounderItem) => f.id !== id));
      } catch {
        setMoreFounders([]);
      }
    };
    const loadCopy = async () => {
      try {
        const res = await fetch(`${base}/founders/detail-copy`);
        if (!res.ok) throw new Error("Copy fetch failed");
        const data = await res.json();
        setCopy({
          moreEyebrow: data.moreEyebrow || defaultCopy.moreEyebrow,
          moreTitle: data.moreTitle || defaultCopy.moreTitle,
          moreDescription: data.moreDescription || defaultCopy.moreDescription,
        });
      } catch {
        setCopy(defaultCopy);
      }
    };
    load();
    loadMore();
    loadCopy();
  }, [base, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!founder) {
    return <NotFound />;
  }

  const story = founder.detail || {
    headline: founder.name,
    summary: founder.highlight,
    heroImage: founder.image,
    highlights: [],
    metrics: [],
  };
  const heroImg =
    resolveMedia(
      pickVariant(story.heroVariants, ["main", "hero", "medium"]) ||
        story.heroImage ||
        pickVariant(founder.variants, ["main", "medium", "thumb"]) ||
        founder.image
    ) || "";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative min-h-[70vh] flex items-end pb-16 pt-28 md:pt-36 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <motion.img
          src={heroImg}
          alt={founder.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imageScale, opacity: imageOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="container-custom relative z-10 space-y-6">
          <Link to="/founders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to founders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{founder.era}</Badge>
            <Badge variant="outline">{founder.title}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {founder.social?.linkedin && (
              <Button asChild variant="secondary" size="sm">
                <a href={founder.social.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </Button>
            )}
            {founder.social?.twitter && (
              <Button asChild variant="outline" size="sm">
                <a href={founder.social.twitter} target="_blank" rel="noreferrer">
                  Twitter
                </a>
              </Button>
            )}
            {founder.social?.website && (
              <Button asChild variant="ghost" size="sm">
                <a href={founder.social.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              </Button>
            )}
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">{story.headline || founder.name}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">{story.summary || founder.highlight}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              {founder.focus}
            </Badge>
            <Button asChild variant="hero-outline" size="sm">
              <a href="#highlights" className="flex items-center gap-2">
                View profile <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="highlights" className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-2 space-y-12">
            {(story.highlights || []).map((section, index) => {
              const delay = index * 0.1;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid md:grid-cols-5 gap-6 md:gap-10 items-start"
                >
                  <div className={`md:col-span-2 space-y-3 ${isEven ? "" : "md:order-last"}`}>
                    <div className="text-sm uppercase tracking-[0.2em] text-primary">Chapter {index + 1}</div>
                    <h2 className="text-2xl md:text-3xl font-display font-semibold">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                  </div>
                  <div className="md:col-span-3">
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: delay + 0.05 }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="relative overflow-hidden rounded-2xl bg-card border border-border/70 h-full min-h-[240px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.18),transparent_45%)]" />
                      <div className="relative h-full p-6 flex items-end">
                        <p className="text-lg text-foreground/90 leading-relaxed">
                          {story.pullQuote || founder.highlight}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-6 sticky top-28">
            <div className="glass rounded-2xl p-6 border border-border/70 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                Professional snapshot
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(story.metrics || []).map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-border/60 p-4 bg-card/70">
                    <div className="text-2xl font-display font-semibold">{metric.value}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
              {(story.summary || founder.highlight) && (
                <p className="text-sm text-muted-foreground">
                  {story.summary || founder.highlight}
                </p>
              )}
              <Button asChild variant="hero" className="w-full">
                <Link to={story.ctaHref || "/contact"}>
                  {story.ctaLabel || "Book a profile walkthrough"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container-custom space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">{copy.moreEyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-display font-semibold">{copy.moreTitle}</h2>
            <p className="text-muted-foreground text-sm md:text-base">{copy.moreDescription}</p>
          </div>
          <StickyScrollReveal
            content={(moreFounders.length ? moreFounders : []).map((item, idx) => ({
              title: item.name,
              description: item.highlight,
              image: resolveMedia(
                pickVariant(item.detail?.heroVariants, ["main", "hero", "medium"]) ||
                  pickVariant(item.variants, ["main", "medium", "thumb"]) ||
                  item.image
              ),
              id: item.id,
              content: (
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-black/45 via-black/20 to-black/55 shadow-[0_15px_60px_-35px_rgba(0,0,0,0.9)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_30%)]" />
                  <div className="relative z-10 flex flex-col gap-3 h-full justify-end text-left text-white p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex px-3 py-1 rounded-full bg-white/15 text-[11px] uppercase tracking-wide">
                        {item.era}
                      </span>
                      <span className="inline-flex px-3 py-1 rounded-full bg-primary/90 text-[11px] uppercase tracking-wide text-background">
                        {item.title}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold drop-shadow-sm">{item.name}</h3>
                    <p className="text-sm text-white/85 line-clamp-3">{item.highlight}</p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>#{idx + 1}</span>
                      <Button asChild variant="secondary" size="sm" className="rounded-full px-4 py-2">
                        <Link to={`/founders/${item.id}`}>View founder</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            }))}
            showStepLabels={false}
            onItemSelect={(item) => {
              const target = (item as any).id;
              if (target) navigate(`/founders/${target}`);
            }}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default FounderDetail;
