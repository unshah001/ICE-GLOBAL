import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ParallaxGridScroll } from "@/components/ui/parallax-grid-scroll";
import { cn } from "@/lib/utils";

type Cta = {
  label: string;
  href: string;
};

interface ReviewMomentsSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  images: { src: string; href: string }[];
  cta?: Cta;
  className?: string;
}

const ReviewMomentsSection = ({
  eyebrow = "Review the moment",
  title,
  description,
  images,
  cta,
  className,
}: ReviewMomentsSectionProps) => {
  const imagesWithLinks = images.map((img) => ({
    src: img.src,
    href: img.href || cta?.href || "/gallery",
  }));

  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="container mx-auto px-4 pt-16 md:pt-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl w-full mx-auto mb-10"
        >
          {eyebrow && (
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-1">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </motion.div>
      </div>

      <ParallaxGridScroll images={imagesWithLinks} />

      {cta && (
        <div className="container-custom pb-16 md:pb-24 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to={cta.href}
              className="inline-flex items-center gap-1.5 px-8 py-4 "
            >
              <span className="font-display font-semibold !text-blue-600">
                {cta.label}
              </span>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default ReviewMomentsSection;
