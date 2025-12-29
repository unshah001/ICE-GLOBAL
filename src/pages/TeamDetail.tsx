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

type TeamStory = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  highlights?: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  pullQuote?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type TeamItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  focus: string;
  image: string;
  highlight: string;
  href?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  detail?: TeamStory;
};

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamItem | null>(null);
  const [more, setMore] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/teams/${id}`);
        if (!res.ok) throw new Error("Team fetch failed");
        const data = (await res.json()) as TeamItem;
        setMember(data);
      } catch {
        setMember(null);
      } finally {
        setLoading(false);
      }
    };
    const loadMore = async () => {
      try {
        const res = await fetch(`${base}/teams/list?limit=12`);
        if (!res.ok) throw new Error("List fetch failed");
        const data = await res.json();
        setMore((data.data || []).filter((t: TeamItem) => t.id !== id));
      } catch {
        setMore([]);
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

  if (!member) {
    return <NotFound />;
  }

  const story = member.detail || {
    headline: member.name,
    summary: member.highlight,
    heroImage: member.image,
    highlights: [],
    metrics: [],
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative min-h-[70vh] flex items-end pb-16 pt-28 md:pt-36 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <motion.img
          src={story.heroImage || member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imageScale, opacity: imageOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="container-custom relative z-10 space-y-6">
          <Link to="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to team
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{member.department}</Badge>
            <Badge variant="outline">{member.role}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {member.social?.linkedin && (
              <Button asChild variant="secondary" size="sm">
                <a href={member.social.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </Button>
            )}
            {member.social?.twitter && (
              <Button asChild variant="outline" size="sm">
                <a href={member.social.twitter} target="_blank" rel="noreferrer">
                  Twitter
                </a>
              </Button>
            )}
            {member.social?.website && (
              <Button asChild variant="ghost" size="sm">
                <a href={member.social.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              </Button>
            )}
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">{story.headline || member.name}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">{story.summary || member.highlight}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              {member.focus}
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
                          {story.pullQuote || member.highlight}
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
              {(story.summary || member.highlight) && (
                <p className="text-sm text-muted-foreground">
                  {story.summary || member.highlight}
                </p>
              )}
              <Button asChild variant="hero" className="w-full">
                <Link to={story.ctaHref || "/contact"}>
                  {story.ctaLabel || "Book a walkthrough"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container-custom space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">More team</p>
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Explore more team profiles</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Scroll to reveal more team members—tap to open their detailed profiles.
            </p>
          </div>
          <StickyScrollReveal
            content={(more.length ? more : []).map((item, idx) => ({
              title: item.name,
              description: item.highlight,
              image: item.image,
              id: item.id,
              content: (
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-black/45 via-black/20 to-black/55 shadow-[0_15px_60px_-35px_rgba(0,0,0,0.9)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_30%)]" />
                  <div className="relative z-10 flex flex-col gap-3 h-full justify-end text-left text-white p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex px-3 py-1 rounded-full bg-white/15 text-[11px] uppercase tracking-wide">
                        {item.department}
                      </span>
                      <span className="inline-flex px-3 py-1 rounded-full bg-primary/90 text-[11px] uppercase tracking-wide text-background">
                        {item.role}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-semibold drop-shadow-sm">{item.name}</h3>
                    <p className="text-sm text-white/85 line-clamp-3">{item.highlight}</p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>#{idx + 1}</span>
                      <Button asChild variant="secondary" size="sm" className="rounded-full px-4 py-2">
                        <Link to={`/teams/${item.id}`}>View profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            }))}
            showStepLabels={false}
            onItemSelect={(item) => {
              const target = (item as any).id;
              if (target) navigate(`/teams/${target}`);
            }}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default TeamDetail;
