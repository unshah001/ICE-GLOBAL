

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, LogIn, UserCircle2, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navItems as defaultNavItems } from "@/data/expo-data";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
}

interface FloatingNavbarProps {
  navItems: NavItem[];
  className?: string;
}

type Branding = {
  logoUrl: string;
  darkLogoUrl: string;
  navLogoUrl: string;
  navDarkLogoUrl: string;
  navWidth: number;
  navHeight: number;
  faviconUrl: string;
  logoType: string;
  width: number;
  height: number;
  padding: string;
  background: string;
  href: string;
  alt: string;
};

// ─── Theme engine ─────────────────────────────────────────────────────────────
const STYLE_ID = "ice-theme-override";

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }

  if (dark) {
    el.textContent = `
      :root {
        color-scheme: dark;
        --background: 0 0% 5%;
        --foreground: 0 0% 98%;
        --card: 0 0% 8%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 5%;
        --popover-foreground: 0 0% 98%;
        --primary: 217 91% 60%;
        --primary-foreground: 0 0% 5%;
        --secondary: 0 0% 12%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 12%;
        --muted-foreground: 0 0% 60%;
        --accent: 0 0% 12%;
        --accent-foreground: 0 0% 98%;
        --border: 0 0% 15%;
        --input: 0 0% 15%;
        --ring: 217 91% 60%;
      }
      body, #root {
        background-color: hsl(0, 0%, 5%) !important;
        color: hsl(0, 0%, 98%) !important;
      }
    `;
  } else {
    el.textContent = `
      :root {
        color-scheme: light;
        --background: 0 0% 100%;
        --foreground: 0 0% 5%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 5%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 5%;
        --primary: 217 91% 60%;
        --primary-foreground: 0 0% 100%;
        --secondary: 210 40% 96%;
        --secondary-foreground: 0 0% 5%;
        --muted: 210 40% 96%;
        --muted-foreground: 215 16% 47%;
        --accent: 210 40% 96%;
        --accent-foreground: 0 0% 5%;
        --border: 214 32% 91%;
        --input: 214 32% 91%;
        --ring: 217 91% 60%;
      }
      body, #root {
        background-color: hsl(0, 0%, 100%) !important;
        color: hsl(0, 0%, 5%) !important;
      }
    `;
  }

  localStorage.setItem("theme", dark ? "dark" : "light");
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    applyTheme(isDark);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 52,
        height: 28,
        borderRadius: 9999,
        backgroundColor: isDark ? "#3b82f6" : "#e2e8f0",
        border: isDark ? "1px solid #2563eb" : "1px solid #cbd5e1",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.25s ease",
        outline: "none",
        padding: 0,
      }}
    >
      <Sun
        size={11}
        strokeWidth={2.5}
        style={{
          position: "absolute",
          left: 7,
          color: isDark ? "#93c5fd" : "#eab308",
          pointerEvents: "none",
          transition: "color 0.25s",
        }}
      />
      <Moon
        size={11}
        strokeWidth={2.5}
        style={{
          position: "absolute",
          right: 7,
          color: isDark ? "#ffffff" : "#94a3b8",
          pointerEvents: "none",
          transition: "color 0.25s",
        }}
      />
      <motion.span
        animate={{ x: isDark ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{
          position: "absolute",
          left: 0,
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {isDark
          ? <Moon size={11} style={{ color: "#3b82f6" }} strokeWidth={2.5} />
          : <Sun size={11} style={{ color: "#eab308" }} strokeWidth={2.5} />
        }
      </motion.span>
    </button>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingNavbar = ({ navItems = defaultNavItems, className }: FloatingNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [items, setItems] = useState<NavItem[]>(navItems ?? defaultNavItems);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [showMe, setShowMe] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const loadNav = async () => {
      try {
        const res = await fetch(`${base}/hero`);
        if (!res.ok) throw new Error("nav fetch failed");
        const data = await res.json();
        if (Array.isArray(data.navItems) && data.navItems.length) {
          setItems(data.navItems);
        } else {
          setItems(navItems ?? defaultNavItems);
        }
      } catch {
        setItems(navItems ?? defaultNavItems);
      }
    };
    loadNav();

    const syncAuth = () => {
      const token = localStorage.getItem("user_access_token");
      const email = localStorage.getItem("user_email");
      setShowMe(!!token);
      setUserEmail(email);
      setShowLogin(!token);
    };
    syncAuth();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user_access_token" || e.key === "user_email") syncAuth();
    };
    window.addEventListener("storage", handleStorage);
    const handleAuthChange = () => syncAuth();
    window.addEventListener("auth-change", handleAuthChange as any);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleAuthChange as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const loadBranding = async () => {
      try {
        const res = await fetch(`${base}/branding`);
        if (!res.ok) throw new Error("branding fetch failed");
        const payload = await res.json();
        setBranding(payload);
        if (payload?.faviconUrl) {
          const linkEl = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (linkEl) {
            linkEl.href = payload.faviconUrl;
          } else {
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = payload.faviconUrl;
            document.head.appendChild(link);
          }
        }
      } catch {
        setBranding(null);
      }
    };
    loadBranding();
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 px-4 md:px-6 py-3 transition-all duration-300",
          isScrolled
            ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-xl"
            : "bg-transparent",
          className
        )}
      >
        <div className="flex items-center gap-6 md:gap-10 max-w-6xl mx-auto w-full">
          {/* Logo */}
          <Link
            to={branding?.href || "/"}
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground hover:text-primary transition-colors"
            style={{
              padding: branding?.padding || undefined,
              background: branding?.background || undefined,
            }}
          >
            {branding?.navLogoUrl || branding?.logoUrl ? (
              <img
                src={branding.navLogoUrl || branding.logoUrl}
                alt={branding.alt || "ICE Exhibitions"}
                style={{
                  width: branding.navWidth || branding.width ? `${branding.navWidth || branding.width}px` : undefined,
                  height: branding.navHeight || branding.height ? `${branding.navHeight || branding.height}px` : undefined,
                  objectFit: "contain",
                }}
              />
            ) : (
              <>ICE <span className="text-primary"> GLOBAL </span></>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                {item.name}
              </Link>
            ))}
            {[
              { name: "Igen World", href: "/Igen World" },
              { name: "Igen expo", href: "/igen expo" },
              { name: "Igen news", href: "/igen news" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                {item.name}
              </Link>
            ))}
            {!showMe && showLogin && (
              <Link
                to="/me"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === "/me"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </span>
              </Link>
            )}
            {showMe && (
              <Link
                to="/me"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === "/me"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  Me
                </span>
              </Link>
            )}
            {/* Theme Toggle — far right */}
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6"
          >
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block py-4 text-2xl font-display font-semibold transition-colors",
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {showMe && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: items.length * 0.1 }}
                >
                  <Link
                    to="/me"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block py-4 text-2xl font-display font-semibold transition-colors",
                      location.pathname === "/me" ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <UserCircle2 className="w-5 h-5" />
                      Me
                    </span>
                  </Link>
                </motion.div>
              )}
              {!showMe && showLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: items.length * 0.1 }}
                >
                  <Link
                    to="/me"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block py-4 text-2xl font-display font-semibold transition-colors",
                      location.pathname === "/me" ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Login
                    </span>
                  </Link>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: items.length * 0.1 + 0.1 }}
                className="pt-4"
              >
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" size="lg" className="w-full" asChild>
                    <Link to="/Igen World" onClick={() => setIsMobileMenuOpen(false)}>Igen World</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full" asChild>
                    <Link to="/igen expo" onClick={() => setIsMobileMenuOpen(false)}>Igen expo</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full" asChild>
                    <Link to="/igen news" onClick={() => setIsMobileMenuOpen(false)}>Igen news</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};