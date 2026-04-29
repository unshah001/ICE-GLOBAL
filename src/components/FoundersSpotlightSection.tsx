import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FounderProfile } from "@/data/founders";

interface FoundersSpotlightSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  founders: FounderProfile[];
  cta?: { label: string; href: string };
  className?: string;
}

const FoundersSpotlightSection = ({
  eyebrow = "Review the moment",
  title,
  description,
  founders,
  cta,
  className,
}: FoundersSpotlightSectionProps) => {
  return (
    <section className={cn("section-padding bg-gradient-to-b from-background via-card/60 to-background", className)}>
      <div className="container-custom space-y-8">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-xs uppercase tracking-[0.25em]">
              <Sparkles className="w-4 h-4" />
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            {title}
          </h2>
          {description && <p className="text-muted-foreground">{description}</p>}
          {cta?.href && cta?.label && (
            <a
              href={cta.href}
              className="inline-flex items-center gap-2 justify-center text-primary font-semibold"
            >
              {cta.label}
            </a>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {founders.map((founder, idx) => (
            <motion.a
              key={founder.name + idx}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: idx * 0.06 }}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-2xl shadow-primary/10"
              href={founder.href || undefined}
              target={founder.href?.startsWith("http") ? "_blank" : undefined}
              rel={founder.href?.startsWith("http") ? "noreferrer" : undefined}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_45%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.14),transparent_45%)]" />
              <div className="relative h-56">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover object-[center_12%] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/20 to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold backdrop-blur-sm">
                  {founder.era}
                </div>
              </div>
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{founder.title}</p>
                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {founder.name}
                    </h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
                  <span className="h-px flex-1 bg-primary/30" />
                  {founder.focus}
                  <span className="h-px flex-1 bg-primary/30" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {founder.highlight}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoundersSpotlightSection;
