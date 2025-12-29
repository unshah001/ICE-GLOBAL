import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { themeOptions } from "@/data/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Paintbrush, Save } from "lucide-react";

const AdminTheme = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [current, setCurrent] = useState("theme-minimal");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/theme`);
        if (!res.ok) throw new Error("Failed to load theme");
        const data = await res.json();
        setCurrent(data?.current || "theme-minimal");
      } catch {
        setCurrent("theme-minimal");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/theme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ current }),
        });
      let res = await attempt(token);
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await attempt(refreshed);
      }
      if (!res || !res.ok) throw new Error("Save failed");
      setMessage("Theme updated. Refresh to apply everywhere.");
    } catch (err: any) {
      setMessage(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const active = useMemo(() => themeOptions.find((t) => t.id === current), [current]);

  return (
    <AdminLayout
      title="Theme Management"
      description="Select the global theme for the platform. Applies to all users."
      navItems={adminNavLinks}
      sections={[{ id: "theme", label: "Theme" }]}
    >
      <Card id="theme" className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Select theme</label>
              <Select value={current} onValueChange={setCurrent} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a theme" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {themeOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-border/70"
                          style={{ backgroundImage: t.swatch }}
                          aria-hidden
                        />
                        <span>{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</div>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="h-10 w-10 rounded-xl border border-border/70"
                  style={{ backgroundImage: active?.swatch }}
                  aria-hidden
                />
                <div>
                  <div className="font-semibold">{active?.label}</div>
                  <div className="text-xs text-muted-foreground">Applies platform-wide</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Global setting, overrides per-user selection.
              {message && (
                <span className="ml-2 text-primary inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {message}
                </span>
              )}
            </div>
            <Button onClick={save} disabled={saving || loading}>
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTheme;
