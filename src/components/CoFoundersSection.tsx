import { motion } from "framer-motion";
import { Network, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoFounderProfile } from "@/data/cofounders";

interface CoFoundersSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cofounders: CoFounderProfile[];
  cta?: { label: string; href: string };
  className?: string;
  
}

const trackIcon = (track: CoFounderProfile["track"]) => {
  if (track === "IGE") return <Radio className="w-4 h-4" />;
  if (track === "IGN") return <Network className="w-4 h-4" />;
  return (
    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[11px] font-semibold">
      IGE/IGN
    </div>
  );
};

const CoFoundersSection = ({
  eyebrow = "Review the moment",
  title,
  description,
  cofounders,
  cta,
  className,
}: CoFoundersSectionProps) => {
  return (
    <section className={cn("section-padding bg-gradient-to-b from-background via-card/50 to-background", className)}>
      <div className="container-custom space-y-8">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-xs uppercase tracking-[0.25em]">
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
          {cofounders.map((person, idx) => (
            <motion.a
              key={person.name + idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: idx * 0.06 }}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-2xl shadow-primary/10"
              href={person.href || undefined}
              target={person.href?.startsWith("http") ? "_blank" : undefined}
              rel={person.href?.startsWith("http") ? "noreferrer" : undefined}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.12),transparent_45%)]" />
              <div className="relative h-52">
                <img
                  src={person.image}
                  alt={person.name}
         className="w-full h-full  object-[center_12%] object-cover transition-transform duration-700" 
        />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  {trackIcon(person.track)}
                  {person.track}
                </div>
              </div>
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{person.title}</p>
                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {person.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
                  <span className="h-px flex-1 bg-primary/30" />
                  {person.focus}
                  <span className="h-px flex-1 bg-primary/30" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {person.highlight}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoFoundersSection;
