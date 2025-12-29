import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks, adminNavGroups } from "@/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, FileText, Layers, Settings, Users, Zap } from "lucide-react";

type Stat = { value: number; suffix?: string; label: string };
type LeadRow = { id: string; slug: string; createdAt: string; data: { label: string; value: unknown }[] };

const AdminDashboard = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${base}/counts`);
        if (res.ok) {
          const payload = await res.json();
          setStats(payload?.stats || []);
        }
      } catch {
        setStats([]);
      }
    };
    const loadLeads = async () => {
      try {
        const token = localStorage.getItem("admin_access_token");
        if (!token) return;
        setLoading(true);
        const res = await fetch(`${base}/forms/submissions?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const payload = await res.json();
          setLeads(payload?.data || []);
        }
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cmsLinks = useMemo(
    () =>
      adminNavGroups
        .filter((g) => ["Experiences", "Pages", "People", "Growth", "Governance", "Forms"].includes(g.label))
        .flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))),
    []
  );

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="A concise control room for content, leads, and governance."
      navItems={adminNavLinks}
      sections={[
        { id: "overview", label: "Overview" },
        { id: "cms", label: "CMS" },
        { id: "leads", label: "Leads" },
        { id: "settings", label: "Settings" },
      ]}
    >
      <div id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(stats.length ? stats : [{ label: "Published sections", value: 42 }, { label: "Pending reviews", value: 8 }]).map(
          (stat, idx) => (
            <Card key={`${stat.label}-${idx}`} className="bg-card/70 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-semibold">
                  {stat.value}
                  {stat.suffix || ""}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div id="cms" className="grid gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> CMS Dashboards
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            {cmsLinks.slice(0, 8).map((item) => (
              <Button
                key={item.href}
                variant="outline"
                className="justify-between w-full"
                onClick={() => navigate(item.href)}
              >
                <span>{item.name}</span>
                <Badge variant="secondary">{item.group}</Badge>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Traffic & Ops
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Cache warm status</span>
              <Badge variant="outline">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Publish approvals</span>
              <Badge variant="secondary">2 pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Uptime</span>
              <Badge variant="outline">99.9%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="leads" className="grid gap-4 items-start">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Loading leads...</div>}
            {!loading && leads.length === 0 && (
              <div className="text-sm text-muted-foreground">No leads yet. Share a form to get started.</div>
            )}
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-lg border border-border/60 p-3 bg-background/60 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{lead.slug}</Badge>
                    <span className="font-medium">#{lead.id.slice(-6)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {lead.data.slice(0, 4).map((field) => (
                    <div key={`${lead.id}-${field.label}`} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{field.label}</span>
                      <span className="font-medium text-right">
                        {typeof field.value === "string" || typeof field.value === "number"
                          ? String(field.value)
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={() => navigate("/admin/leads")}>
              View all leads
            </Button>
          </CardContent>
        </Card>
        <Card id="settings" className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings & Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/admin/platform-branding")}>
              Platform Branding
              <Badge variant="outline">Identity</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/admin/forms")}>
              Form Builder
              <Badge variant="outline">Forms</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/admin/submit-success")}>
              Submit Success Page
              <Badge variant="outline">UX</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/admin/profile")}>
              Admin Profile
              <Badge variant="outline">Account</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" /> CMS Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 p-4 bg-background/70 space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Content</div>
            <div className="text-lg font-semibold">Publish homepage refresh</div>
            <p className="text-sm text-muted-foreground">Hero, testimonials, and brand highlights ready to go.</p>
            <Button size="sm" onClick={() => navigate("/admin")}>
              Open CMS
            </Button>
          </div>
          <div className="rounded-xl border border-border/60 p-4 bg-background/70 space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Data</div>
            <div className="text-lg font-semibold">Review 10 new leads</div>
            <p className="text-sm text-muted-foreground">Prioritize partner and sponsor submissions.</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/leads")}>
              View leads
            </Button>
          </div>
          <div className="rounded-xl border border-border/60 p-4 bg-background/70 space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Governance</div>
            <div className="text-lg font-semibold">Align branding</div>
            <p className="text-sm text-muted-foreground">Confirm navbar/footer logos and CTA targets.</p>
            <Button size="sm" variant="ghost" onClick={() => navigate("/admin/platform-branding")}>
              Update branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
