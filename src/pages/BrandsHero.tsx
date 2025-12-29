import { useEffect, useState } from "react";
import { BackgroundBeams } from "@/components/ui/background-effects";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BrandsHeroProps = {
  query: string;
  category: string;
  categories: string[];
  onQueryChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
};

type BrandsHeroContent = { badge: string; title: string; subheading: string };

const fallbackHero: BrandsHeroContent = {
  badge: "Partner Brands",
  title: "Brands that trust ICE Exhibitions",
  subheading:
    "Explore our partner roster—long-term collaborators, headline sponsors, and innovators who shaped the expo experience.",
};

export const BrandsHero = ({ query, category, categories, onQueryChange, onCategoryChange }: BrandsHeroProps) => {
  const [hero, setHero] = useState<BrandsHeroContent>(fallbackHero);
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await fetch(`${base}/brands/hero`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHero({
          badge: data.badge || fallbackHero.badge,
          title: data.title || fallbackHero.title,
          subheading: data.subheading || fallbackHero.subheading,
        });
      } catch {
        setHero(fallbackHero);
      }
    };
    loadHero();
  }, [base]);

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
      <BackgroundBeams className="z-0" />
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.2em]">
            <Building2 className="w-4 h-4" />
            {hero.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold">{hero.title}</h1>
          <p className="text-muted-foreground">{hero.subheading}</p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[2fr,1fr] items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search brands by name, relationship, or category..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Select value={category} onValueChange={(v) => onCategoryChange(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsHero;
