import { motion } from "framer-motion";
import { ArrowRight, Grid, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ParallaxGridScroll } from "@/components/ui/parallax-grid-scroll";

interface Stat {
  label: string;
  value: string;
  icon?: "grid" | "users";
}

interface StallsMosaicSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  images: (string | { src: string; href?: string })[];
  stats?: Stat[];
  cta?: { label: string; href: string };
}

const iconMap = {
  grid: Grid,
  users: Users,
};

const StallsMosaicSection = ({
  eyebrow = "Review the moment",
  title,
  description,
  images,
  stats = [],
  cta,
}: StallsMosaicSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          {eyebrow && (
            <span className="text-primary font-medium text-sm uppercase tracking-[0.25em]">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            {title}
          </h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </motion.div>

        {stats.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon ? iconMap[stat.icon] : undefined;
              return (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold text-foreground"
                >
                  {Icon && <Icon className="w-4 h-4 text-primary" />}
                  <span className="text-primary">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ParallaxGridScroll images={images} />

      {(cta || stats.length > 0) && (
        <div className="container-custom pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            {cta && (
              <Link
                to={cta.href}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 group"
              >
                <span className="font-display font-semibold" style={{ color: "#2563eb" }}>
                  {cta.label}
                </span>
             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "#2563eb" }} />
              </Link>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default StallsMosaicSection;
