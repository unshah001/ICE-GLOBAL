import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { Badge } from "@/components/ui/badge";

type NotFoundCopy = {
  title: string;
  subtitle: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
};

const defaultCopy: NotFoundCopy = {
  title: "404",
  subtitle: "Oops! Page not found",
  message: "The page you're looking for doesn't exist or was moved.",
  ctaLabel: "Return to Home",
  ctaHref: "/",
  badge: "Not found",
};

const NotFound = () => {
  const location = useLocation();
  const [copy, setCopy] = useState<NotFoundCopy>(defaultCopy);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/not-found`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setCopy({ ...defaultCopy, ...(data || {}) });
      } catch {
        setCopy(defaultCopy);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
            <Badge variant="secondary">{copy.badge}</Badge>
          </div>
          <h1 className="text-5xl font-display font-bold">{copy.title}</h1>
          <p className="text-xl text-muted-foreground">{copy.subtitle}</p>
          <p className="text-muted-foreground">{copy.message}</p>
          <Link to={copy.ctaHref} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            {copy.ctaLabel}
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default NotFound;
