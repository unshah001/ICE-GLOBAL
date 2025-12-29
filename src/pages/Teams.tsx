import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
};

type TeamsResponse = {
  data: TeamItem[];
  cursor?: { next: string | null; limit: number };
  filters?: { departments?: string[] };
};

const PAGE_LIMIT = 24;

const Teams = () => {
  const [items, setItems] = useState<TeamItem[]>([]);
  const [department, setDepartment] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [departments, setDepartments] = useState<string[]>(["All"]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()[0];

  const base = import.meta.env.VITE_API_BASE_URL || "";

  const load = async (reset = true) => {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_LIMIT));
    if (!reset && cursor) params.set("cursor", cursor);
    if (department !== "All") params.set("department", department);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`${base}/teams/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load team");
      const data = (await res.json()) as TeamsResponse;
      const next = data.data || [];
      if (reset) {
        setItems(next);
      } else {
        setItems((prev) => [...prev, ...next]);
      }
      setDepartments(["All", ...(data.filters?.departments || [])]);
      setCursor(data.cursor?.next ?? null);
      setHasMore(Boolean(data.cursor?.next));
    } catch (err: any) {
      setError(err.message || "Unable to load team");
      if (reset) {
        setItems([]);
        setDepartments(["All"]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialDept = searchParams.get("department");
    const initialSearch = searchParams.get("search");
    if (initialDept) setDepartment(initialDept);
    if (initialSearch) setSearch(initialSearch);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(true), 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          load(false);
        }
      },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const matchesDept = department === "All" || t.department === department;
      const q = search.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.focus.toLowerCase().includes(q) ||
        t.highlight.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [items, department, search]);

  return (
    <main className="min-h-screen bg-background">
      <FloatingNavbar navItems={[...navItems, { name: "Team", href: "/teams" }]} />

      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
              <Users className="w-4 h-4" />
              Team
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">The team behind ICE</h1>
            <p className="text-muted-foreground">
              Producers, ops, media, design, and data—search and filter to see who keeps the circuit running.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[2fr,1fr] lg:grid-cols-[2fr,1fr] items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team by name, role, department..."
                className="pl-9"
              />
            </div>
            <Select value={department} onValueChange={(v) => setDepartment(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No team members matched your filters.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-lg shadow-primary/5"
                >
                  <Link to={`/teams/${member.id}`} className="block h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{member.department}</Badge>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      <h3 className="text-xl font-display font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{member.highlight}</p>
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        View profile
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoading && <div className="text-sm text-muted-foreground">Loading more team members...</div>}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Teams;
