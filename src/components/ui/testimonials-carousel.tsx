"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, ArrowUpRight } from "lucide-react";

interface TestimonialCardProps {
  image: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  quote?: string;
}

const TestimonialCard = ({
  image,
  name,
  role,
  company,
  rating,
  quote,
}: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-primary/10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.12),transparent_40%)]" />
      <div className="relative p-5 space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-3">
          <img
            src={image}
            alt={name}
            className="w-14 h-14 rounded-2xl object-cover border border-border/70"
          />
          <div>
            <p className="text-sm text-muted-foreground">{role}</p>
            <p className="font-display font-semibold text-lg">{name}</p>
            <div className="text-xs uppercase tracking-wide text-primary/80">{company}</div>
          </div>
        </div>
        {quote && <p className="text-muted-foreground leading-relaxed text-sm md:text-base">“{quote}”</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
            <Star className="w-4 h-4 fill-primary text-primary" />
            {rating.toFixed(1)}
          </div>
          <ArrowUpRight className="w-5 h-5 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
};

interface TestimonialsCarouselProps {
  testimonials: TestimonialCardProps[];
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const TestimonialsCarousel = ({
  testimonials,
  title = "What our partners say",
  subtitle = "Hear from brands and visitors who've experienced our expos firsthand",
  ctaLabel = "Send feedback",
  ctaHref = "/feedback",
}: TestimonialsCarouselProps) => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2">
              {title}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg">{subtitle}</p>
            {(ctaHref || ctaLabel) && (
              <div className="flex flex-wrap gap-3 mt-5">
                {ctaHref && ctaLabel && (
                  <a
                    href={ctaHref}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors"
                  >
                    {ctaLabel}
                  </a>
                )}
                <a
                  href="/testimonials"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  View all testimonials
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};
