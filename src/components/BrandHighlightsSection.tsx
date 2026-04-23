


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
  image: string;
}

// fallback color generator
const colorFromString = (str: string) => {
  const colors = [
    "#1e3a5f", "#065f46", "#3b0764", "#7c2d12", "#134e4a",
    "#1e40af", "#14532d", "#4c1d95", "#7f1d1d", "#0c4a6e"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// image fallback component
const BrandCardImage = ({
  src,
  name,
  logo,
}: {
  src: string;
  name: string;
  logo: string;
}) => {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: colorFromString(name) }}
      >
        <span className="font-bold text-white text-3xl opacity-80">
          {logo ||
            name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
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

const BrandHighlightsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [eyebrow, setEyebrow] = useState("Our Partners");
  const [title, setTitle] = useState("Trusted by Industry Leaders");
  const [description, setDescription] = useState("");
  const [ctaLabel, setCtaLabel] = useState("View all partner brands");
  const [ctaHref, setCtaHref] = useState("/sellers");
  const [loading, setLoading] = useState(true);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://192.168.1.7:8086";
  const MEDIA_BASE =
    import.meta.env.VITE_MEDIA_BASE_URL || "https://ice-global.b-cdn.net";

  // useEffect(() => {
//     const fetchBrands = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/brandHighlights`);
// const data = await res.json();

// const formattedBrands = (data.data || []).map((brand: Brand) => {
//   let imageUrl = brand.image || "";

//   if (imageUrl && !imageUrl.startsWith("http")) {
//     imageUrl = `${MEDIA_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
//   }

//   return {
//     ...brand,
//     image: imageUrl,
//   };
// });

// setBrands(formattedBrands);

//         setEyebrow(data.eyebrow || "Our Partners");
//         setTitle(data.title || "Trusted by Industry Leaders");
//         setDescription(data.description || "");
//         setCtaLabel(data.ctaLabel || "View all partner brands");
//         setCtaHref(data.ctaHref || "/sellers");
//       } catch (err) {
//         console.error("Failed to fetch brands:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBrands();
//   }, []);


useEffect(() => {
  const controller = new AbortController();

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/brands`, {
        signal: controller.signal,
      });

      const data = await res.json();

      const list =
        Array.isArray(data.data)
          ? data.data
          : [];

      setBrands(list);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchBrands();

  return () => controller.abort();
}, [API_BASE]); // ❗ better: add filters, not only API_BASE



  if (loading) {
    return (
      <section className="py-10">
        <div className="container-custom flex justify-center">
          <span className="text-sm text-muted-foreground">
            Loading brands...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-primary text-sm uppercase tracking-wider">
            {eyebrow}
          </span>

          <h2 className="text-4xl font-bold mt-2 mb-3">{title}</h2>

          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>

        {/* Grid */}
        <BentoGrid className="max-w-5xl mx-auto gap-x-6">
          {brands.map((brand, index) => (
            <Link key={brand.slug} to={`/gallery/${brand.slug}`}>
              <BentoGridItem
                className={index === 0 || index === 3 ? "md:col-span-2" : ""}
                title={brand.name}
                description={
                  <span className="flex items-center gap-2">
                    <span className="text-primary">
                      {brand.relationship}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>{brand.category}</span>
                  </span>
                }
                header={
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <BrandCardImage
                      src={brand.image}
                      name={brand.name}
                      logo={brand.logo}
                    />
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 text-primary font-medium hover:opacity-80"
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