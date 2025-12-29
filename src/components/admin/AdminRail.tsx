import { NavLink } from "react-router-dom";
import { adminNavGroups } from "@/data/admin";
import { cn } from "@/lib/utils";

export type AdminSectionLink = { id: string; label: string };

interface AdminRailProps {
  sections?: AdminSectionLink[];
  className?: string;
}

const AdminRail = ({ sections = [], className }: AdminRailProps) => {
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
              <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{group.label}</div>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-transparent hover:border-primary/30 hover:text-primary transition-colors",
                        isActive && "text-primary bg-primary/10 border-primary/20"
                      )
                    }
                  >
                    <span>{item.name}</span>
                    <span className="text-[11px] text-muted-foreground">↗</span>
                  </NavLink>
                ))}
              </div>
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
