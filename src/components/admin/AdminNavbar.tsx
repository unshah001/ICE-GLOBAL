import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { adminNavGroups } from "@/data/admin";
import { cn } from "@/lib/utils";

interface AdminNavbarProps {}

/**
 * Dedicated admin top navigation bar (full-width, solid background) to keep the CMS
 * separate from the marketing floating navbar.
 */
const AdminNavbar = ({}: AdminNavbarProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const items = useMemo(() => adminNavGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))), []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <a href="/admin" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="rounded-md bg-primary/15 px-2 py-1 text-primary text-sm uppercase tracking-[0.18em]">
            Admin
          </span>
          <span>Control Center</span>
        </a>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex gap-2"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Search className="w-4 h-4" />
            Quick search
          </Button>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search admin…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {adminNavGroups.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group.label} ${item.name}`}
                  onSelect={() => {
                    setOpen(false);
                    window.location.href = item.href;
                  }}
                  className={cn("flex items-center gap-2")}
                >
                  <span>{item.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{group.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default AdminNavbar;
