import { NavLink } from "react-router-dom";
import { adminNavLinks } from "@/data/admin";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type AdminNavItem = { name: string; href: string };

interface AdminNavbarProps {
  items?: AdminNavItem[];
}

/**
 * Dedicated admin top navigation bar (full-width, solid background) to keep the CMS
 * separate from the marketing floating navbar.
 */
const AdminNavbar = ({ items = adminNavLinks }: AdminNavbarProps) => {
  const byName = Object.fromEntries(items.map((i) => [i.name, i]));
  const grouped = [
    { label: "Overview", names: ["Dashboard", "Content", "Users", "Settings"] },
    { label: "Experience", names: ["Gallery", "Gallery Detail", "Brands", "Testimonials", "About", "Contact"] },
    { label: "People", names: ["Team", "Founders", "Co-Founders"] },
    { label: "Growth", names: ["Buyers", "Sellers", "Partner", "Sponsor"] },
    { label: "Policies", names: ["Privacy", "Cookies", "Terms", "Not Found"] },
    { label: "Forms", names: ["Form Builder"] },
    { label: "Session", names: ["Logout"] },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <NavLink to="/admin" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="rounded-md bg-primary/15 px-2 py-1 text-primary text-sm uppercase tracking-[0.18em]">
            Admin
          </span>
          <span>Control Center</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-2">
          {grouped.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-border/60 hover:border-primary/40 hover:text-primary transition-colors">
                {group.label}
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {group.names
                  .map((name) => byName[name])
                  .filter(Boolean)
                  .map((item) => (
                    <DropdownMenuItem asChild key={item.href}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "flex w-full items-center justify-between text-sm px-2 py-1.5 rounded-md",
                            isActive ? "text-primary bg-primary/10" : "text-foreground"
                          )
                        }
                      >
                        <span>{item.name}</span>
                        <span className="text-[11px] text-muted-foreground">↗</span>
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
