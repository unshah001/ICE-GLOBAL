"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxGridScrollProps {
  images: (string | { src: string; href?: string })[];
  className?: string;
}

export const ParallaxGridScroll = ({
  images,
  className,
}: ParallaxGridScrollProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const normalized = images.map((img) =>
    typeof img === "string" ? { src: img, href: undefined } : img
  );

  const third = Math.ceil(normalized.length / 3);
  const firstPart = normalized.slice(0, third);
  const secondPart = normalized.slice(third, 2 * third);
  const thirdPart = normalized.slice(2 * third);

  return (
    <div
      ref={gridRef}
      className={cn(
        "h-[50rem] md:h-[90rem] items-start overflow-hidden w-full",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-7xl mx-auto gap-4 md:gap-8 py-20 md:py-40 px-4 md:px-10">
        <div className="grid gap-4 md:gap-8">
          {firstPart.map((image, idx) => (
            <motion.a
              href={image.href || undefined}
              style={{ y: translateFirst }}
              key={"grid-1" + idx}
              className="relative"
            >
              <img
                src={image.src}
                className="h-70 md:h-90 w-full object-cover object-center rounded-xl gap-4 md:gap-10 !m-0 !p-0"
                alt={`Expo image ${idx + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </motion.a>
          ))}
        </div>
        <div className="grid gap-4 md:gap-8">
          {secondPart.map((image, idx) => (
            <motion.a
              href={image.href || undefined}
              style={{ y: translateSecond }}
              key={"grid-2" + idx}
              className="relative"
            >
              <img
                src={image.src}
                className="h-70 md:h-90 w-full object-cover object-center rounded-xl gap-4 md:gap-10 !m-0 !p-0"
                alt={`Expo image ${idx + third + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </motion.a>
          ))}
        </div>
        <div className="grid gap-4 md:gap-8">
          {thirdPart.map((image, idx) => (
            <motion.a
              href={image.href || undefined}
              style={{ y: translateThird }}
              key={"grid-3" + idx}
              className="relative"
            >
              <img
                src={image.src}
                className="h-70 md:h-90 w-full object-cover object-center rounded-xl gap-4 md:gap-10 !m-0 !p-0"
                alt={`Expo image ${idx + 2 * third + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};
