"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroParallaxProps {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  heroTitle?: string;
  heroHighlight?: string;
  heroSubtitle?: string;
}

// export const HeroParallax = ({
//   products,
//   heroTitle,
//   heroHighlight,
//   heroSubtitle,
export const HeroParallax = ({
  products,
  heroTitle = "Experience the India Global",
  heroHighlight = "India Global",
  heroSubtitle = "Where brands connect, innovate, and inspire. Explore our visual archive of unforgettable experiences.",

}: HeroParallaxProps) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 100]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[250vh] md:h-[300vh] py-20 md:py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      {heroTitle && (
        <Header title={heroTitle} highlighted={heroHighlight} subtitle={heroSubtitle} />
      )}
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10 md:space-x-20 mb-10 md:mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-10 md:mb-20 space-x-10 md:space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10 md:space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = ({
  title,
  highlighted,
  subtitle,
}: {
  title: string;
  highlighted?: string;
  subtitle?: string;
}) => {
  const { before, match, after } = useMemo(() => {
    if (!highlighted || !title) return { before: title, match: "", after: "" };

    const idx = title.toLowerCase().indexOf(highlighted.toLowerCase());
    if (idx === -1) return { before: title, match: "", after: "" };

    return {
      before: title.slice(0, idx),
      match: title.slice(idx, idx + highlighted.length),
      after: title.slice(idx + highlighted.length),
    };
  }, [title, highlighted]);

  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h1 className="text-3xl md:text-7xl font-bold font-display text-foreground">
        {before}
        {match && <span className="text-gradient">{match}</span>}
        {after}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-base md:text-xl mt-8 text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: any;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-64 w-[20rem] md:h-96 md:w-[30rem] relative flex-shrink-0"
    >
      <a href={product.link} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="object-cover object-center absolute h-full w-full inset-0 rounded-xl"
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none rounded-xl transition-opacity duration-300"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-foreground font-display font-semibold text-lg transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  );
};