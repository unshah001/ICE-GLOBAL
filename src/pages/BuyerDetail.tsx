import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
// import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { buyerTestimonials, type BuyerTestimonial } from "@/data/buyer-testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, Loader2, MapPin } from "lucide-react";
import NotFound from "./NotFound";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";

type BuyerStory = {
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

type BuyerDetailItem = BuyerTestimonial & { detail?: BuyerStory; variants?: { key: string; path: string }[] };

const BuyerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<BuyerDetailItem | null>(null);
  const [moreBuyers, setMoreBuyers] = useState<BuyerDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    const fallback = buyerTestimonials.find((b) => b.id === id) || null;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/buyers/${id}`);
        if (!res.ok) throw new Error("Buyer fetch failed");
        const data = (await res.json()) as BuyerDetailItem;
        setBuyer(data);
      } catch {
        setBuyer(fallback);
      } finally {
        setLoading(false);
      }
    };
    const loadMore = async () => {
      try {
        const res = await fetch(`${base}/buyers/list?limit=12`);
        if (!res.ok) throw new Error("List fetch failed");
        const data = await res.json();
        setMoreBuyers((data.data || []).filter((b: BuyerDetailItem) => b.id !== id));
      } catch {
        setMoreBuyers(buyerTestimonials.filter((b) => b.id !== id));
      }
    };
    load();
    loadMore();
  }, [base, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!buyer) {
    return <NotFound />;
  }

  const story = buyer.detail || {
    headline: buyer.quote,
    summary: buyer.spend,
    heroImage: buyer.image,
    highlights: [],
    metrics: [],
  };
  const heroImg =
    resolveMedia(
      pickVariant(story.heroVariants, ["main", "hero", "medium"]) ||
        story.heroImage ||
        pickVariant(buyer.variants, ["main", "medium", "thumb"]) ||
        buyer.image
    ) || "";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative min-h-[70vh] flex items-end pb-16 pt-28 md:pt-36 overflow-hidden">
        {/* <BackgroundBeams className="z-0" /> */}
        <motion.img
          src={heroImg}
          alt={buyer.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imageScale, opacity: imageOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="container-custom relative z-10 space-y-6">
          <Link to="/buyers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to buyers
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {buyer.city}
            </Badge>
            <Badge>{buyer.segment}</Badge>
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">{story.headline || buyer.name}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">{story.summary || buyer.quote}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              {buyer.spend} • {buyer.visits}
            </Badge>
            <Button asChild variant="hero-outline" size="sm">
              <a href="#highlights" className="flex items-center gap-2">
                Read the story <ArrowUpRight className="w-4 h-4" />
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
                          {story.pullQuote || buyer.quote}
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
                Impact snapshot
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
              {(story.summary || buyer.quote) && (
                <p className="text-sm text-muted-foreground">
                  {story.summary || buyer.quote}
                </p>
              )}
              <Button asChild variant="hero" className="w-full">
                <Link to={story.ctaHref || "/contact"}>
                  {story.ctaLabel || "Plan a buyer route"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container-custom space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">More buyers</p>
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Explore more buyer journeys</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Scroll to reveal more buyer stories—tap to open their detailed journeys.
            </p>
          </div>
          <StickyScrollReveal
            content={(moreBuyers.length ? moreBuyers : buyerTestimonials.filter((b) => b.id !== id)).map((item, idx) => ({
              title: item.name,
              description: item.quote,
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
                        {item.city}
                      </span>
                      <span className="inline-flex px-3 py-1 rounded-full bg-primary/90 text-[11px] uppercase tracking-wide text-background">
                        {item.segment}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold drop-shadow-sm">{item.name}</h3>
                    <p className="text-sm text-white/85 line-clamp-3">{item.quote}</p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>#{idx + 1}</span>
                      <Button asChild variant="secondary" size="sm" className="rounded-full px-4 py-2">
                        <Link to={`/buyers/${item.id}`}>View buyer</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            }))}
            showStepLabels={false}
            onItemSelect={(item) => {
              const target = (item as any).id;
              if (target) navigate(`/buyers/${target}`);
            }}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BuyerDetail;
