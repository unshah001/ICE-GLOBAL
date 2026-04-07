import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellerTestimonial } from "@/data/seller-testimonials";

interface SellerSignalsSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  sellers: SellerTestimonial[];
  cta?: { label: string; href: string };
  className?: string;
}

const SellerCard = ({ seller, delay }: { seller: SellerTestimonial; delay: number }) => {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(tiltX, [-0.5, 0.5], [-5, 5]);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 12 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 12 });

  const Wrapper: any = seller.href ? motion.a : motion.div;

  return (
    <Wrapper
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-xl shadow-primary/10"
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        tiltX.set(x);
        tiltY.set(y);
      }}
      onMouseLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      href={seller.href || undefined}
      target={seller.href?.startsWith("http") ? "_blank" : undefined}
      rel={seller.href?.startsWith("http") ? "noreferrer" : undefined}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.12),transparent_40%)]" />
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={seller.image}
            alt={seller.name}
            className="w-14 h-14 rounded-2xl object-cover border border-border/70"
          />
          <div> 

            <p className="text-sm text-muted-foreground">{seller.role}</p>
            <p className="font-display font-semibold text-lg">{seller.name}</p>
            <p className="text-xs uppercase tracking-wide text-primary/80">{seller.company}</p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">“{seller.quote}”</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            {seller.outcome}
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Wrapper>
  );
};


const SellerSignalsSection = ({
  eyebrow = "Seller Signals",
  title,
  description,
  sellers,
  cta,
  className,
}: SellerSignalsSectionProps) => {
  return (
    <section className={cn("section-padding", className)}>
      <div className="container-custom grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-3 max-w-2xl mx-auto text-center space-y-4">
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
              className="inline-flex items-center gap-2 text-primary font-semibold"
            >
              {cta.label}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
          <div className="flex flex-wrap gap-20 ml-11 ">
            <span className="px-3 py-1.5 rounded-full bg-card border border-border text-xs uppercase tracking-wide text-muted-foreground">
              Momentum
            </span>
            <span className="px-3 py-1.5 rounded-full bg-card border border-border text-xs uppercase tracking-wide text-muted-foreground">
              Conversion
            </span>
            <span className="px-3 py-1.5 rounded-full bg-card border border-border text-xs uppercase tracking-wide text-muted-foreground">
              Ops Support
            </span>
          </div>
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4 md:gap-6">
          {sellers.map((seller, idx) => (
            <SellerCard key={seller.id} seller={seller} delay={idx * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellerSignalsSection;

