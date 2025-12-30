import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export type FooterData = {
  ctaTitle: string;
  ctaDescription: string;
  partnerHref: string;
  sponsorHref: string;
  copyright?: string;
  exploreLinks: { name: string; href: string }[];
  partnersLinks: { name: string; href: string }[];
  legalLinks: { name: string; href: string }[];
  contact: { location: string; email: string; phone: string };
  socials: { label: string; href: string }[];
};

const Footer = ({
  data,
}: {
  data?: FooterData;
}) => {
  const [branding, setBranding] = useState<{
    logoUrl: string;
    darkLogoUrl: string;
    navLogoUrl: string;
    navDarkLogoUrl: string;
    footerLogoUrl: string;
    footerDarkLogoUrl: string;
    navWidth: number;
    navHeight: number;
    footerWidth: number;
    footerHeight: number;
    href: string;
    width: number;
    height: number;
    padding: string;
    background: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const loadBranding = async () => {
      try {
        const res = await fetch(`${base}/branding`);
        if (!res.ok) throw new Error("branding fetch failed");
        const payload = await res.json();
        setBranding(payload);
      } catch {
        setBranding(null);
      }
    };
    loadBranding();
  }, []);

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore:
      data?.exploreLinks ||
      [
        { name: "Gallery", href: "/gallery" },
        { name: "About Us", href: "/about" },
        { name: "Past Events", href: "/gallery" },
        { name: "Testimonials", href: "/testimonials" },
      ],
    partners:
      data?.partnersLinks ||
      [
        { name: "Become a Partner", href: "/partner" },
        { name: "Sponsor an Event", href: "/sponsor" },
        { name: "Brand Guidelines", href: "/brand-guidelines" },
        { name: "Media Kit", href: "/contact" },
      ],
    legal:
      data?.legalLinks ||
      [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
      ],
  };

  const socialLinks =
    data?.socials?.map((s) => ({ icon: s.label === "LinkedIn" ? Linkedin : s.label === "Twitter" ? Twitter : Instagram, href: s.href, label: s.label })) ||
    [
      { icon: Instagram, href: "https://instagram.com/iceglobal", label: "Instagram" },
      { icon: Twitter, href: "https://twitter.com/iceglobal", label: "Twitter" },
      { icon: Linkedin, href: "https://linkedin.com/company/iceglobal", label: "LinkedIn" },
    ];

  return (
    <footer className="bg-card border-t border-border">
      {/* CTA Section */}
      <div className="container-custom section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 px-6 py-10 md:px-10 md:py-14 shadow-xl shadow-primary/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
                Let's team up
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {data?.ctaTitle || "Ready to create the next unforgettable expo moment?"}
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                {data?.ctaDescription ||
                  "Choose your path—co-create as a partner or own the spotlight as a sponsor. We’ll craft an experience that people replay and share."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="hero" size="lg" className="shadow-lg hover:-translate-y-1 transition">
                <a href={data?.partnerHref || "/partner"}>Become a Partner</a>
              </Button>
              <Button asChild variant="hero-outline" size="lg" className="shadow-lg hover:-translate-y-1 transition">
                <a href={data?.sponsorHref || "/sponsor"}>Sponsor an Event</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-border">
        <div className="container-custom py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link
                to={branding?.href || "/"}
                className="font-display font-bold text-2xl text-foreground hover:text-primary transition-colors inline-block mb-4"
                style={{
                  padding: branding?.padding || undefined,
                  background: branding?.background || undefined,
                }}
              >
                {branding?.footerLogoUrl || branding?.logoUrl ? (
                  <img
                    src={branding.footerLogoUrl || branding.logoUrl}
                    alt={branding.alt || "ICE Exhibitions"}
                    style={{
                      width:
                        branding.footerWidth || branding.width
                          ? `${branding.footerWidth || branding.width}px`
                          : undefined,
                      height:
                        branding.footerHeight || branding.height
                          ? `${branding.footerHeight || branding.height}px`
                          : undefined,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <>
                    ICE <span className="text-primary"> GLOBAL </span>
                  </>
                )}
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6">
                {data?.ctaDescription ||
                  "A decade of immersive expos, captured in over 1,000 moments. Where brands connect, innovate, and inspire."}
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{data?.contact?.location || "Bangalore, India"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{data?.contact?.email || "hello@ICEGLOBAL.com"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{data?.contact?.phone || "+91 98765 43210"}</span>
                </div>
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">
                Explore
              </h4>
              <ul className="space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">
                Partners
              </h4>
              <ul className="space-y-3">
                {footerLinks.partners.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {data?.copyright?.trim()
              ? data.copyright
              : `© ${currentYear} ICEGLOBAL. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
