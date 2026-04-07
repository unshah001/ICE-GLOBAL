

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

interface Brand {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string; // this is the path from backend, e.g., "uploads/logo1.jpg"
}

interface BrandHighlightsSectionProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// Generate a fallback background color from brand name
const colorFromString = (str: string) => {
  const colors = ["#1e3a5f","#065f46","#3b0764","#7c2d12","#134e4a","#1e40af","#14532d","#4c1d95","#7f1d1d","#0c4a6e"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Component to show brand image or fallback initials
const BrandCardImage = ({ src, name, logo }: { src: string; name: string; logo: string }) => {
  const [failed, setFailed] = useState(!src);

  useEffect(() => { setFailed(!src); }, [src]);

  if (failed || !src) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: colorFromString(name) }}
      >
        <span className="font-bold text-white select-none" style={{ fontSize: "2.5rem", opacity: 0.85 }}>
          {logo || name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover/bento:scale-110"
      onError={() => setFailed(true)}
    />
  );
};

const BrandHighlightsSection = ({
  title: titleProp,
  eyebrow: eyebrowProp,
  description: descriptionProp,
  ctaLabel: ctaLabelProp,
  ctaHref: ctaHrefProp,
}: BrandHighlightsSectionProps) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [eyebrow, setEyebrow] = useState(eyebrowProp ?? "Our Partners");
  const [title, setTitle] = useState(titleProp ?? "Trusted by Industry Leaders");
  const [description, setDescription] = useState(descriptionProp ?? "");
  const [ctaLabel, setCtaLabel] = useState(ctaLabelProp ?? "View all partner brands");
  const [ctaHref, setCtaHref] = useState(ctaHrefProp ?? "/brands");
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.7:8086";
  const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || "https://ice-global.b-cdn.net";

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API_BASE}/brands/highlights`);
        const data = await res.json();
        console.log("API response:", data);

        if (data.brands?.length) {
          // Map backend paths to full BunnyCDN URLs
          const brandsWithFullImages = data.brands.map((brand: Brand) => {
            let imageUrl = brand.image || "";
            if (imageUrl.startsWith("http")) {
              // Full URL, leave as-is
            } else {
              // Relative path → prepend BunnyCDN base URL
              imageUrl = `${MEDIA_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
            }
            return { ...brand, image: imageUrl };
          });
          setBrands(brandsWithFullImages);
        }

        // Optional metadata from API
        if (data.eyebrow) setEyebrow(data.eyebrow);
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.ctaLabel) setCtaLabel(data.ctaLabel);
        if (data.ctaHref) setCtaHref(data.ctaHref);
      } catch (err) {
        console.error("Failed to fetch brand highlights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [API_BASE, MEDIA_BASE]);

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container-custom flex justify-center items-center h-40">
          <span className="text-muted-foreground text-sm">Loading brands...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          {eyebrow && (
            <span className="text-primary font-medium text-sm uppercase tracking-wider">{eyebrow}</span>
          )}
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2 mb-3">{title}</h2>
          {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </motion.div>

        <BentoGrid className="max-w-5xl mx-auto gap-x-6">
          {brands.map((brand, index) => (
            <Link key={brand.slug} to={`/brands/${brand.slug}`}>
              <BentoGridItem
                className={index === 0 || index === 3 ? "md:col-span-2" : ""}
                title={brand.name}
                description={
                  <span className="flex items-center gap-2">
                    <span className="text-primary">{brand.relationship}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{brand.category}</span>
                  </span>
                }
                header={
                  <div className="relative w-full h-32 md:h-40 rounded-lg overflow-hidden">
                    <BrandCardImage src={brand.image} name={brand.name} logo={brand.logo} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                }
                icon={
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                }
              />
            </Link>
          ))}
        </BentoGrid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandHighlightsSection;