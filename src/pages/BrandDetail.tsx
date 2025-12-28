import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { brandHighlights, brandStories, navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";

type BrandDetailStory = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
};

type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
  summary?: string;
  detail?: BrandDetailStory;
};

const BrandDetail = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState<BrandItem | null>(null);
  const [story, setStory] = useState<BrandDetailStory | null>(null);
  const [moreBrands, setMoreBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!slug) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const fallbackBrand = brandHighlights.find((b) => b.slug === slug) || null;
    const fallbackStory = brandStories[slug] || null;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/brands/${slug}`);
        if (!res.ok) throw new Error("Brand fetch failed");
        const data = (await res.json()) as BrandItem;
        setBrand(data);
        const detail = data.detail || fallbackStory || null;
        setStory(detail);
      } catch {
        setBrand(fallbackBrand);
        setStory(fallbackStory);
      } finally {
        setLoading(false);
      }
    };
    const loadMore = async () => {
      try {
        const res = await fetch(`${base}/brands?page=1&pageSize=50`);
        if (!res.ok) throw new Error("List fetch failed");
        const data = await res.json();
        setMoreBrands((data.data || []).filter((b: BrandItem) => b.slug !== slug));
      } catch {
        setMoreBrands(brandHighlights.filter((b) => b.slug !== slug));
      }
    };
    load();
    loadMore();
  }, [slug]);

  useEffect(() => {
    if (!carouselApi) return;
    const timer = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselApi]);

  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!brand || !story) {
    return <NotFound />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative min-h-[70vh] flex items-end pb-16 pt-28 md:pt-36 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <motion.img
          src={story.heroImage || brand.image}
          alt={brand.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imageScale, opacity: imageOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="container-custom relative z-10 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{brand.relationship}</Badge>
            <Badge>{brand.category}</Badge>
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              {story.headline || brand.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">{story.summary || brand.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              Trusted by Industry Leaders
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
                          {story.pullQuote}
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
              {(story.impactDescription || story.summary || brand.summary) && (
                <p className="text-sm text-muted-foreground">
                  {story.impactDescription || story.summary || brand.summary}
                </p>
              )}
              <Button asChild variant="hero" className="w-full">
                <Link to={story.ctaHref || "/contact"}>
                  {story.ctaLabel || "Plan a showcase with us"}
                </Link>
              </Button>
            </div>



            <div className="rounded-2xl border border-border p-6 bg-card/80 space-y-4 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary/80">More partners</p>
                  <h3 className="text-lg font-display font-semibold">Explore more brand stories</h3>
                </div>
              </div>
              <Carousel opts={{ align: "start", slidesToScroll: 1 }} setApi={setCarouselApi}>
                <CarouselContent>
                  {moreBrands.map((item) => (
                    <CarouselItem key={item.slug} className="">
                      <Link
                        to={`/brands/${item.slug}`}
                        className="group block rounded-xl border border-border/70 bg-background/70 overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        <div className="relative h-28 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center font-display font-bold text-primary text-sm">
                            {item.logo}
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <Badge variant="outline">{item.relationship}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-semibold text-base">{item.name}</h4>
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.summary || "Discover how this partner shaped their showcase."}
                          </p>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-3">
                  <CarouselPrevious className="h-9 w-9" />
                  <CarouselNext className="h-9 w-9" />
                </div>
              </Carousel>
            </div>


            
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BrandDetail;
