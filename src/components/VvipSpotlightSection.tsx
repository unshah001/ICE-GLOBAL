import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vvip } from "@/data/vvip-data";

interface VvipSpotlightSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  guests: Vvip[];
  cta?: { label: string; href: string };
  className?: string;
}

const VvipSpotlightSection = ({
  eyebrow = "VVIP Spotlight",
  title,
  description,
  guests,
  cta,
  className,
}: VvipSpotlightSectionProps) => {
  return (
    <section className={cn("section-padding bg-card/30 border-y border-border/60", className)}>
      <div className="container-custom space-y-8">
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
          {cta?.href && cta?.label && (
            <a
              href={cta.href}
              className="inline-flex items-center gap-2 justify-center text-primary font-semibold"
            >
              {cta.label}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {guests.map((guest, idx) => (
            <motion.a
              key={guest.name + idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/10"
              href={guest.href || undefined}
              target={guest.href?.startsWith("http") ? "_blank" : undefined}
              rel={guest.href?.startsWith("http") ? "noreferrer" : undefined}
            >
          <div className="relative h-52 md:h-60 lg:h-72">
  <img
    src={guest.image}
    alt={guest.name}
    className={cn(
      "w-full h-full object-buttom transition-transform duration-500 group-hover:scale-105",
      idx === 2 ? "object-top" : "object-center" // fixes the third image
    )}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
  {guest.badge && (
    <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold z-20">
      <Crown className="w-4 h-4" />
      {guest.role}
    </div>
  )}
</div>
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{guest.title}</p>
                    <h3 className="text-xl font-display font-semibold text-foreground">{guest.name}</h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guest.highlight}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VvipSpotlightSection;
