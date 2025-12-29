import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { themeOptions } from "@/data/themes";

const STORAGE_KEY = "expo-theme";

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const [current, setCurrent] = useState<string>("theme-minimal");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && themeOptions.find((t) => t.id === stored)) {
      setCurrent(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    themeOptions.forEach((t) => root.classList.remove(t.id));
    root.classList.add(current);
    localStorage.setItem(STORAGE_KEY, current);
  }, [current]);

  const activeTheme = useMemo(() => themeOptions.find((t) => t.id === current), [current]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/70 px-3 py-2 shadow-none",
        className,
      )}
    >
      <Palette className="w-4 h-4 text-primary" />
      <Select value={current} onValueChange={setCurrent}>
        <SelectTrigger className="w-44 border-0 bg-transparent px-0 h-auto focus:ring-0 focus:ring-offset-0">
          <div className="flex items-center gap-2 text-sm">
            <span
              className="h-4 w-4 rounded-full border border-border/70"
              style={{ backgroundImage: activeTheme?.swatch }}
              aria-hidden
            />
            <span className="text-foreground/90">{activeTheme?.label ?? "Theme"}</span>
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          {themeOptions.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-border/70"
                  style={{ backgroundImage: theme.swatch }}
                  aria-hidden
                />
                <span>{theme.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
