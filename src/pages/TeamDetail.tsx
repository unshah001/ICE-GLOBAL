
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
// import { BackgroundBeams } from "@/components/ui/background-effects";
import { StatsStrip } from "@/components/ui/stats-strip";
import Footer from "@/components/Footer";
import { navItems, stats } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NotFound from "./NotFound";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";

type TeamStory = {
  headline?: string;
  summary?: string;
  heroImage?: string;
};

type TeamItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  focus: string;
  image: string; // e.g. "/team/rajesh.jpg"
  highlight: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  detail?: TeamStory;
};

const defaultCopy = {
  moreEyebrow: "More team",
  moreTitle: "Explore more team profiles",
  moreDescription:
    "Scroll to reveal more team members—tap to open their detailed profiles.",
};

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamItem | null>(null);
  const [more, setMore] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copy, setCopy] = useState(defaultCopy);

  const base = import.meta.env.VITE_API_BASE_URL || "";
  const mediaBase = (import.meta.env.VITE_MEDIA_BASE_URL || "").replace(/\/$/, "");

  const resolveMedia = (path?: string) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return mediaBase ? `${mediaBase}/${path}` : path;
  };

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/teams/${id}`);
        if (!res.ok) throw new Error("Team fetch failed");
        const data = await res.json() as TeamItem;
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

    const loadCopy = async () => {
      try {
        const res = await fetch(`${base}/teams/detail-copy`);
        if (!res.ok) throw new Error("Copy fetch failed");
        const data = await res.json();
        setCopy({
          moreEyebrow: data.moreEyebrow || defaultCopy.moreEyebrow,
          moreTitle: data.moreTitle || defaultCopy.moreTitle,
          moreDescription:
            data.moreDescription || defaultCopy.moreDescription,
        });
      } catch {
        setCopy(defaultCopy);
      }
    };

    Promise.all([load(), loadMore(), loadCopy()]);
  }, [base, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </main>
    );
  }

  if (!member) {
    return <NotFound />;
  }

  const story = member.detail || {
    headline: member.name,
    summary: member.highlight,
  };

  // “StickyScroll” content from more team members
  const timelineContent = more.map((item) => ({
    title: item.name,
    description: item.highlight,
    image: resolveMedia(item.image),
    id: item.id,
    content: (
      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-black/45 via-black/20 to-black/55 shadow-[0_15px_60px_-35px_rgba(0,0,0,0.9)]">
        <div className="relative z-10 flex flex-col gap-3 h-full justify-center text-left text-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex px-3 py-1 rounded-full bg-white/15 text-[11px] uppercase tracking-wide">
              {item.department}
            </span>
            <span className="inline-flex px-3 py-1 rounded-full bg-primary/90 text-[11px] uppercase tracking-wide text-background">
              {item.role}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-semibold drop-shadow-sm">
            {item.name}
          </h3>
          <p className="text-sm text-white/85 line-clamp-3">{item.highlight}</p>
          <div className="flex items-center justify-between text-xs text-white/70 mt-auto">
            <span>#{item.id}</span>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full px-4 py-2"
            >
              <Link to={`/teams/${item.id}`}>View profile</Link>
            </Button>
          </div>
        </div>
      </div>
    ),
  }));

  // Use hero’s image if present, otherwise current member’s image
  const heroImage = resolveMedia(story.heroImage || member.image);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      {/* HERO – like About hero */}
      <section
        className="relative pt-28 pb-20 text-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />

        <div className="container-custom relative z-10 space-y-6">
          <Badge variant="secondary">{copy.moreEyebrow}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            {story.headline || member.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {story.summary || member.highlight}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/teams">Back to team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/teams/${id}`}>View profile</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MORE TEAM – like About timeline section */}
      <section className="section-padding bg-card/40">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="space-y-6 text-center">
            <Badge variant="secondary">{copy.moreEyebrow}</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              {copy.moreTitle}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {copy.moreDescription}
            </p>
          </div>
          <StickyScrollReveal
            content={timelineContent}
            contentClassName="text-white"
            showStepLabels={false}
            onItemSelect={(item) => {
              const target = (item as any).id;
              if (target) navigate(`/teams/${target}`);
            }}
          />
        </div>
      </section>

      <StatsStrip stats={stats} />

      <Footer />
    </main>
  );
};

export default TeamDetail;
