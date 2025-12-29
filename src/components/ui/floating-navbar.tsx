"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navItems as defaultNavItems } from "@/data/expo-data";

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

export const FloatingNavbar = ({ navItems = defaultNavItems, className }: FloatingNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [items, setItems] = useState<NavItem[]>(navItems ?? defaultNavItems);
  const [branding, setBranding] = useState<Branding | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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
        <div className="flex items-center justify-between gap-4 md:gap-8 max-w-6xl mx-auto w-full">
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
                  width:
                    branding.navWidth || branding.width ? `${branding.navWidth || branding.width}px` : undefined,
                  height:
                    branding.navHeight || branding.height ? `${branding.navHeight || branding.height}px` : undefined,
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                ICE <span className="text-primary"> GLOBAL </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
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
          </div>

          <div className="hidden md:flex items-center gap-3" />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>


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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: items.length * 0.1 }}
                className="pt-4"
              >
                <div className="flex flex-col gap-3">
                  <ThemeSwitcher />
                  <Button variant="hero" size="lg" className="w-full">
                    Partner With Us
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
