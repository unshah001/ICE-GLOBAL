import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuyerTestimonial } from "@/data/buyer-testimonials";

interface BuyerVoicesSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  buyers: BuyerTestimonial[];
  cta?: { label: string; href: string };
  className?: string;
}

const BuyerCard = ({ buyer, delay }: { buyer: BuyerTestimonial; delay: number }) => {
  const Wrapper: any = buyer.href ? motion.a : motion.div;

  return (
    <Wrapper
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/10"
      href={buyer.href || undefined}
      target={buyer.href?.startsWith("http") ? "_blank" : undefined}
      rel={buyer.href?.startsWith("http") ? "noreferrer" : undefined}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.12),transparent_40%)]" />
      <div className="relative p-5 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={buyer.image}
            alt={buyer.name}
            className="w-20 h-20 rounded-2xl object-cover border border-border/70"
          />
          <div>
            <p className="text-sm text-muted-foreground">{buyer.segment}</p>
            <p className="font-display font-semibold text-lg">{buyer.name}</p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
              <MapPin className="w-4 h-4" />
              {buyer.city} • {buyer.visits}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">“{buyer.quote}”</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
            <ShoppingBag className="w-4 h-4" />
            {buyer.spend}
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Wrapper>
  );
};

const BuyerVoicesSection = ({
  eyebrow = "Buyer Voices",
  title,
  description,
  buyers,
  cta,
  className,
}: BuyerVoicesSectionProps) => {
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {buyers.map((buyer, idx) => (
            <BuyerCard key={buyer.id} buyer={buyer} delay={idx * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuyerVoicesSection;
