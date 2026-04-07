import { motion } from "framer-motion";
import { ArrowRight  } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Celebrity } from "@/data/celebrity-data";

interface CelebritySpotlightSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  celebrities: Celebrity[];
  cta?: { label: string; href: string };
  className?: string;
}

const CelebritySpotlightSection = ({
  eyebrow = "Spotlight",
  title,
  description,
  celebrities,
  cta,
  className,
}: CelebritySpotlightSectionProps) => {
  return (
    <section className={cn("section-padding bg-card/30 border-y border-border/60", className)}>
      <div className="container-custom space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {eyebrow && (
            <span className="text-primary font-medium text-sm uppercase tracking-[0.25em]">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            {title}
          </h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {celebrities.map((celeb, idx) => (
           <motion.div
  key={celeb.name + idx}
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.5, delay: idx * 0.05 }}
  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg shadow-primary/10 flex flex-col"
>
  <Link to={celeb.href || (cta?.href ?? "/gallery")} className="flex flex-col h-full">
    <div className="relative h-72 w-full flex-shrink-0">
      <img
        src={celeb.image}
        alt={celeb.name}
      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      {celeb.badge && (
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
          {celeb.badge}
        </div>
      )}
    </div>
    <div className="relative p-5 space-y-2 flex-grow flex flex-col justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{celeb.title}</p>
        <h3 className="text-xl font-display font-semibold">{celeb.name}</h3>
      </div>
      {celeb.quote && (
        <p className="text-muted-foreground text-sm leading-relaxed mt-4">
          “{celeb.quote}”
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <ArrowRight className="w-5 h-5 text-primary" />
      </div>
    </div>
  </Link>
</motion.div>
          ))}
        </div>

        {cta && (
          <div className="text-center">
            <Link
              to={cta.href}
              className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 bg-color-600 hover:border-primary/60 transition-colors font-medium"
            >
              {cta.label}
              <ArrowRight  className="w-4 h-4 text-primary" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CelebritySpotlightSection;
