import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EntranceArch } from "@/data/entrance-arches";

interface EntranceArchesSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  arches: EntranceArch[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const EntranceArchesSection = ({
  eyebrow = "Review the moment",
  title,
  description,
  arches,
  ctaLabel = "View all arches",
  ctaHref = "/gallery",
  className,
}: EntranceArchesSectionProps) => {
  return (
    <section className={cn("section-padding bg-card/40 border-y border-border/60", className)}>
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

        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "10 cities", tone: "primary" },
            { label: "30 years", tone: "secondary" },
            { label: "Signature arches", tone: "primary" },
            { label: "Arrival moments", tone: "secondary" },
          ].map((chip) => (
            <span
              key={chip.label}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs uppercase tracking-wide border",
                chip.tone === "primary"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary/10 border-secondary/30 text-secondary"
              )}
            >
              {chip.label}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {arches.map((arch, idx) => (
            <motion.a
              key={arch.city + idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/10"
              href={arch.href || undefined}
              target={arch.href?.startsWith("http") ? "_blank" : undefined}
              rel={arch.href?.startsWith("http") ? "noreferrer" : undefined}
            >
              <div className="relative h-48 md:h-56">
                <img
                  src={arch.image}
                  alt={`${arch.city} entrance arch`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
                <div className="absolute top-3 right-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  {arch.year}
                </div>
              </div>
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold text-foreground">{arch.city}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {arch.highlight}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {ctaLabel && (
          <div className="text-center pt-4">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default EntranceArchesSection;
