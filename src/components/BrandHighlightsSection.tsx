import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { brandHighlights } from "@/data/expo-data";

interface BrandHighlightsSectionProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  brands?: typeof brandHighlights;
}

const BrandHighlightsSection = ({
  eyebrow = "Our Partners",
  title = "Trusted by Industry Leaders",
  description = "From startups to Fortune 500 companies, our expo has been the launchpad for brands that shape the future.",
  ctaLabel = "View all partner brands",
  ctaHref = "/brands",
  brands = brandHighlights,
}: BrandHighlightsSectionProps) => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {eyebrow && (
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2 mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>

        <BentoGrid className="max-w-5xl mx-auto">
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
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/bento:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center font-display font-bold text-primary text-lg">
                      {brand.logo}
                    </div>
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
          className="text-center mt-12"
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
