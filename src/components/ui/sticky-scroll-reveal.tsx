"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StickyScrollProps {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
    image?: string;
    id?: string;
    href?: string;
  }[];
  contentClassName?: string;
  showStepLabels?: boolean;
  onItemSelect?: (item: StickyScrollProps["content"][number], index: number) => void;
}

export const StickyScrollReveal = ({
  content,
  contentClassName,
  showStepLabels = true,
  onItemSelect,
}: StickyScrollProps) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const cardLength = content.length;
  const safeActive = Math.min(Math.max(activeCard, 0), cardLength - 1);
  const activeItem = content[safeActive];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const panelY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.4]);

  if (!cardLength) return null;

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-24"
    >
      {/* Soft background glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ opacity: glowOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      </motion.div>

      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] px-4 md:px-6">
        {/* Left: timeline list */}
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/70 to-primary/10" />

          <div className="space-y-12 md:space-y-16">
            {content.map((item, index) => {
              const isActive = index === safeActive;

              return (
                <motion.article
                  key={item.title + index}
                  className={`relative pl-10 ${onItemSelect ? "cursor-pointer" : ""}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.3, once: false }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onViewportEnter={() => setActiveCard(index)}
                  onClick={() => onItemSelect?.(item, index)}
                >
                  {/* Node / dot */}
                  <div className="absolute left-0 top-1.5">
                    <motion.div
                      className="flex h-5 w-5 items-center justify-center"
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    >
                      <div className="h-5 w-5 rounded-full border-2 border-primary/60 bg-background shadow-sm" />
                      {isActive && (
                        <motion.div
                          className="absolute h-8 w-8 rounded-full bg-primary/20"
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          className="absolute h-10 w-10 rounded-full border border-primary/20"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Card content */}
                  <motion.div
                    className={`rounded-2xl border bg-card/60 backdrop-blur-sm px-4 py-4 md:px-6 md:py-6 shadow-sm transition-shadow ${
                      isActive ? "border-primary/60 shadow-lg shadow-primary/10" : "border-border/60"
                    }`}
                    animate={{
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 230, damping: 20 }}
                  >
                    <motion.h3
                      className="text-lg md:text-2xl font-semibold font-display text-foreground"
                      animate={{ opacity: isActive ? 1 : 0.7 }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p
                      className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground"
                      animate={{ opacity: isActive ? 1 : 0.6 }}
                    >
                      {item.description}
                    </motion.p>

                    {/* Optional subtle "step" label */}
                <div className="mt-3 flex items-center gap-2">
                  {showStepLabels && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                        Step {index + 1}
                      </span>
                      {isActive && (
                        <motion.span
                          className="text-[11px] text-muted-foreground"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          Currently viewing
                        </motion.span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.article>
          );
        })}
          </div>
        </div>

        {/* Right: sticky preview panel */}
        <div className="relative">
          <div className="lg:sticky lg:top-24">
            <motion.div
              className="relative h-[260px] md:h-[360px] rounded-3xl border border-border/70 bg-gradient-to-br from-background via-card to-background/80 overflow-hidden shadow-lg"
              style={{ y: panelY }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            >
              {/* Panel glow */}
              <motion.div
                className="pointer-events-none absolute -inset-20 bg-gradient-to-br from-primary/20 via-transparent to-secondary/25"
                style={{ opacity: glowOpacity }}
              />

              {/* Image or custom content */}
              {activeItem?.image && (
                <motion.img
                  key={safeActive}
                  src={activeItem.image}
                  alt={activeItem.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative z-10 h-full w-full object-cover"
                />
              )}

              {activeItem?.content && (
                <div
                  className={`relative z-10 flex h-full w-full items-center justify-center p-6 ${
                    contentClassName ?? ""
                  }`}
                >
                  {activeItem.content}
                </div>
              )}

              {!activeItem?.image && !activeItem?.content && (
                <div className="relative z-10 flex h-full flex-col items-start justify-end p-6 space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Snapshot
                  </span>
                  <h4 className="text-2xl font-semibold font-display text-foreground">
                    {activeItem.title}
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {activeItem.description}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
