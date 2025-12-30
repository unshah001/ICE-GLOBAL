import { useState } from "react";
import { adminNavGroups } from "@/data/admin";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type AdminSectionLink = { id: string; label: string };

interface AdminRailProps {
  sections?: AdminSectionLink[];
  className?: string;
}

const AdminRail = ({ sections = [], className }: AdminRailProps) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(adminNavGroups.map((g) => [g.label, false]))
  );

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col gap-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pr-2",
        className
      )}
    >
      <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm shadow-primary/5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Navigation</div>
        <div className="space-y-4">
          {adminNavGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    openGroups[group.label] ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
              {openGroups[group.label] && (
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-transparent hover:border-primary/30 hover:text-primary transition-colors"
                      )}
                    >
                      <span>{item.name}</span>
                      <span className="text-[11px] text-muted-foreground">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {sections.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm shadow-primary/5">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Page sections</div>
          <div className="flex flex-col gap-1">
            {sections.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-transparent hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-[11px] text-muted-foreground">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminRail;
