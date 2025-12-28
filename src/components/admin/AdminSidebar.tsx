import { cn } from "@/lib/utils";

export type AdminSectionLink = { id: string; label: string };

interface AdminSidebarProps {
  sections: AdminSectionLink[];
  className?: string;
}

const AdminSidebar = ({ sections, className }: AdminSidebarProps) => {
  return (
    <aside
      className={cn(
        "hidden lg:block sticky top-24 bg-card/60 border border-border/60 rounded-2xl p-4 space-y-3 shadow-md shadow-primary/5",
        className
      )}
    >
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sections</div>
      <div className="space-y-2">
        {sections.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm border border-transparent hover:border-primary/40 hover:text-primary transition-colors"
          >
            <span>{link.label}</span>
            <span className="text-[10px] text-muted-foreground">↗</span>
          </a>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
