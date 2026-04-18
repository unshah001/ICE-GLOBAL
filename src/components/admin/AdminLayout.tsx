import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminRail, { type AdminSectionLink } from "@/components/admin/AdminRail";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  title?: string;
  description?: string;
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
  sections,
  children,
}: AdminLayoutProps) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <section className="relative pt-20 md:pt-24 pb-16 md:pb-8">
        <div className="relative z-10 max-w-full px-14 mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold">{title}</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">{description}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary">Authenticated</Badge>
              <Badge variant="outline">Live preview enabled</Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px,1fr,240px] items-start">
            <AdminRail sections={[]} />
            <div className="space-y-10">{children}</div>
            <AdminSidebar sections={sections} />
           
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminLayout;
