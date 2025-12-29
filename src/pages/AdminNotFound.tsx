import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

type NotFoundCopy = {
  title: string;
  subtitle: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
};

const defaultCopy: NotFoundCopy = {
  title: "404",
  subtitle: "Oops! Page not found",
  message: "The page you're looking for doesn't exist or was moved.",
  ctaLabel: "Return to Home",
  ctaHref: "/",
  badge: "Not found",
};

const AdminNotFound = () => {
  const [copy, setCopy] = useState<NotFoundCopy>(defaultCopy);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/not-found`);
        if (!res.ok) throw new Error("Failed to load copy");
        const data = await res.json();
        setCopy({ ...defaultCopy, ...(data || {}) });
      } catch (err: any) {
        setError(err.message || "Unable to load");
        setCopy(defaultCopy);
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
      const attempt = async (authToken: string) =>
        fetch(`${base}/not-found`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(copy),
        });
      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) throw new Error("Session expired. Please login again.");
        res = await attempt(refreshed);
      }
      if (!res.ok) throw new Error("Save failed");
      setSuccess("Not found copy updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="404 Page Copy"
      description="Edit the copy shown on the not-found page."
      navItems={adminNavLinks}
      sections={[{ id: "not-found", label: "Not found" }]}
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
          <CardTitle>Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={copy.badge} onChange={(e) => setCopy({ ...copy, badge: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={copy.title} onChange={(e) => setCopy({ ...copy, title: e.target.value })} />
            </div>
          </div>
          <Input value={copy.subtitle} onChange={(e) => setCopy({ ...copy, subtitle: e.target.value })} placeholder="Subtitle" />
          <Textarea value={copy.message} rows={3} onChange={(e) => setCopy({ ...copy, message: e.target.value })} placeholder="Message" />
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={copy.ctaLabel} onChange={(e) => setCopy({ ...copy, ctaLabel: e.target.value })} placeholder="CTA label" />
            <Input value={copy.ctaHref} onChange={(e) => setCopy({ ...copy, ctaHref: e.target.value })} placeholder="CTA href" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminNotFound;
