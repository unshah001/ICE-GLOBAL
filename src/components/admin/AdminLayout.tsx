import { ReactNode } from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import { Badge } from "@/components/ui/badge";
import AdminSidebar, { type AdminSectionLink } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  title?: string;
  description?: string;
  navItems: { name: string; href: string }[];
  sections: AdminSectionLink[];
  children: ReactNode;
}

/**
 * AdminLayout composes the common admin chrome: navbar, hero header, sidebar, and content grid.
 * Pass a list of section anchors for the sidebar and render your editor blocks as children.
 */
const AdminLayout = ({
  title = "Admin Control Center",
  description = "Manage every section of the experience from one place.",
  navItems,
  sections,
  children,
}: AdminLayoutProps) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-8">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10 max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold">{title}</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">{description}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary">Authenticated</Badge>
              <Badge variant="outline">Live preview enabled</Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px,1fr] items-start">
            <AdminSidebar sections={sections} />
            <div className="space-y-10">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminLayout;
