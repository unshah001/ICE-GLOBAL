import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import { TestimonialsCarousel } from "@/components/ui/testimonials-carousel";
import { StatsStrip } from "@/components/ui/stats-strip";
// import { BackgroundBeams } from "@/components/ui/background-effects";
import BrandHighlightsSection from "@/components/BrandHighlightsSection";
import GalleryPreviewSection from "@/components/GalleryPreviewSection";
import Footer from "@/components/Footer";
import {
  heroProducts,
  timelineContent,
  testimonials,
  stats,
  navItems,
} from "@/data/expo-data";
import { useState } from "react";

const Index = () => {
  const [heroData, setHeroData] = useState([]);
const [heroContent, setHeroContent] = useState(null);
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Floating Navbar */}
      <FloatingNavbar navItems={navItems} />

      {/* Hero Parallax Section */}
      <section className="relative">
        {/* <BackgroundBeams className="z-0" /> */}
        {/* <HeroParallax products={heroProducts} /> */}
  {heroData?.length > 0 && heroContent && (
  <section className="relative">
    <HeroParallax
      products={heroData}
      heroTitle={heroContent.title}
      heroHighlight={heroContent.subtitle}
      heroSubtitle={heroContent.description}
    />
  </section>
)}

        {/* <HeroParallax 
  products={heroProducts}
  heroTitle="Experience the India Global"
  heroHighlight="India Global"
  heroSubtitle="Where brands connect, innovate, and inspire. Explore our visual archive of unforgettable experiences."
/> */}
      </section>

       <GalleryPreviewSection />

      <BrandHighlightsSection />

      <TestimonialsCarousel testimonials={testimonials} />

      <TestimonialsCarousel testimonials={testimonials} />

       <TestimonialsCarousel testimonials={testimonials} />

      {/* Story Scroll Section */}
      <section className="relative">
        <div className="container-custom py-16">
          <div className="text-center mb-8">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mt-2">
              Legacy in Motion
            </h2>
          </div>
        </div>
        <StickyScrollReveal content={timelineContent} />
      </section>

      {/* Brand Highlights */}
      

      {/* Gallery Preview */}
      <GalleryPreviewSection />

      <GalleryPreviewSection />

       <GalleryPreviewSection />

      {/* Testimonials */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* Stats Strip */}
      <StatsStrip stats={stats} />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Index;
