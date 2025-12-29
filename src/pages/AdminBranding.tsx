import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Image, Link as LinkIcon, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BrandingPayload = {
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  navLogoUrl: string;
  navDarkLogoUrl: string;
  navWidth: number;
  navHeight: number;
  footerLogoUrl: string;
  footerDarkLogoUrl: string;
  footerWidth: number;
  footerHeight: number;
  logoType: string;
  width: number;
  height: number;
  padding: string;
  background: string;
  href: string;
  alt: string;
};

const defaults: BrandingPayload = {
  logoUrl: "",
  darkLogoUrl: "",
  faviconUrl: "",
  navLogoUrl: "",
  navDarkLogoUrl: "",
  navWidth: 160,
  navHeight: 48,
  footerLogoUrl: "",
  footerDarkLogoUrl: "",
  footerWidth: 160,
  footerHeight: 48,
  logoType: "horizontal",
  width: 160,
  height: 48,
  padding: "6px 10px",
  background: "transparent",
  href: "/",
  alt: "ICE Exhibitions",
};

const AdminBranding = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [data, setData] = useState<BrandingPayload>(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/branding`);
        if (!res.ok) throw new Error("Failed to load branding");
        const payload = await res.json();
        setData({ ...defaults, ...(payload || {}) });
      } catch (err: any) {
        setError(err.message || "Unable to load branding");
        setData(defaults);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) return null;
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      return null;
    }
    const tokenData = await res.json();
    if (tokenData.accessToken) {
      localStorage.setItem("admin_access_token", tokenData.accessToken);
      return tokenData.accessToken as string;
    }
    return null;
  };

  const getAccessToken = async () => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken();
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated.");
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/branding`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(data),
        });
      let res = await attempt(token);
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await attempt(refreshed);
      }
      if (!res || !res.ok) throw new Error("Save failed");
      setSuccess("Branding updated");
    } catch (err: any) {
      setError(err.message || "Unable to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Branding"
      description="Manage logos, favicons, sizing, and click-through targets used across the site."
      navItems={adminNavLinks}
      sections={[{ id: "branding", label: "Branding" }]}
    >
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Logos
          </CardTitle>
          <CardDescription>Provide light/dark variants and favicons via URLs or CDN uploads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Primary logo URL</label>
              <Input value={data.logoUrl} onChange={(e) => setData({ ...data, logoUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Dark mode logo URL</label>
              <Input value={data.darkLogoUrl} onChange={(e) => setData({ ...data, darkLogoUrl: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Navbar logo URL</label>
              <Input value={data.navLogoUrl} onChange={(e) => setData({ ...data, navLogoUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Navbar dark logo URL</label>
              <Input
                value={data.navDarkLogoUrl}
                onChange={(e) => setData({ ...data, navDarkLogoUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Navbar width (px)</label>
              <Input
                type="number"
                value={data.navWidth}
                onChange={(e) => setData({ ...data, navWidth: Number(e.target.value || 0) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Navbar height (px)</label>
              <Input
                type="number"
                value={data.navHeight}
                onChange={(e) => setData({ ...data, navHeight: Number(e.target.value || 0) })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Footer logo URL</label>
              <Input
                value={data.footerLogoUrl}
                onChange={(e) => setData({ ...data, footerLogoUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Footer dark logo URL</label>
              <Input
                value={data.footerDarkLogoUrl}
                onChange={(e) => setData({ ...data, footerDarkLogoUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Footer width (px)</label>
              <Input
                type="number"
                value={data.footerWidth}
                onChange={(e) => setData({ ...data, footerWidth: Number(e.target.value || 0) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Footer height (px)</label>
              <Input
                type="number"
                value={data.footerHeight}
                onChange={(e) => setData({ ...data, footerHeight: Number(e.target.value || 0) })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Favicon URL</label>
              <Input value={data.faviconUrl} onChange={(e) => setData({ ...data, faviconUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Alt text</label>
              <Input value={data.alt} onChange={(e) => setData({ ...data, alt: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60 mt-4">
        <CardHeader>
          <CardTitle>Sizing & Style</CardTitle>
          <CardDescription>Control display size, padding, and background when rendered in navs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Logo type</label>
              <Select value={data.logoType} onValueChange={(v) => setData({ ...data, logoType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="stacked">Stacked</SelectItem>
                  <SelectItem value="icon">Icon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Width (px)</label>
              <Input
                type="number"
                value={data.width}
                onChange={(e) => setData({ ...data, width: Number(e.target.value || 0) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Height (px)</label>
              <Input
                type="number"
                value={data.height}
                onChange={(e) => setData({ ...data, height: Number(e.target.value || 0) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Padding (CSS)</label>
              <Input value={data.padding} onChange={(e) => setData({ ...data, padding: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Background</label>
              <Input value={data.background} onChange={(e) => setData({ ...data, background: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Logo href</label>
              <Input value={data.href} onChange={(e) => setData({ ...data, href: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60 mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Usage guidance
          </CardTitle>
          <CardDescription>Provide the destination link used wherever the logo is clickable.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Click-through URL</label>
            <Input value={data.href} onChange={(e) => setData({ ...data, href: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button onClick={save} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminBranding;
