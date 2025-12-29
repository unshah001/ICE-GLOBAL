import { useEffect } from "react";
import { themeOptions } from "@/data/themes";

const DEFAULT_THEME = "theme-minimal";

const ThemeLoader = () => {
  useEffect(() => {
    const applyTheme = (id: string) => {
      const valid = themeOptions.find((t) => t.id === id) ? id : DEFAULT_THEME;
      const root = document.documentElement;
      themeOptions.forEach((t) => root.classList.remove(t.id));
      root.classList.add(valid);
    };

    const load = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || "";
        const res = await fetch(`${base}/theme`);
        if (!res.ok) throw new Error("theme fetch failed");
        const data = await res.json();
        applyTheme(data?.current || DEFAULT_THEME);
      } catch {
        applyTheme(DEFAULT_THEME);
      }
    };
    load();
  }, []);

  return null;
};

export default ThemeLoader;
