import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ParallaxGridScroll } from "@/components/ui/parallax-grid-scroll";
import { galleryImages } from "@/data/expo-data";

const GalleryPreviewSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Gallery Preview
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2 mb-4">
            Relive the Moments
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our curated collection of over 1,000 images from a 
            decade of transformative expo experiences.
          </p>
        </motion.div>
      </div>

     <div className="mt-10">
  <ParallaxGridScroll images={galleryImages} />
</div>

  <div className="mt-10 mb-24">
  <ParallaxGridScroll images={galleryImages} />
</div>

<div className="container-custom pb-16 md:pb-24">
  <motion.div className="text-center  mt-16">
    <Link to="/gallery">
      <span className="block font-display font-semibold text-foreground text-2xl">
        Explore Full Gallery →
      </span>
    </Link>
  </motion.div>
</div>
    </section>
  );
};

export default GalleryPreviewSection;
