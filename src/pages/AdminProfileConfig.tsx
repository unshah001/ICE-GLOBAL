import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type ExtraField = { key: string; label: string; placeholder?: string };

type Config = {
  labels: { name: string; company: string; address: string; bio: string; notes: string };
  header?: { title: string; description: string };
  extraFields: ExtraField[];
};

const defaultConfig: Config = {
  labels: { name: "Name", company: "Company", address: "Professional address", bio: "Bio", notes: "Notes" },
  header: { title: "Your profile", description: "Update your details used for likes and comments." },
  extraFields: [],
};

const AdminProfileConfig = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/profile/config`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setConfig({ ...defaultConfig, ...data });
    } catch {
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/profile/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setConfig((prev) => ({
      ...prev,
      extraFields: [...prev.extraFields, { key: `field-${prev.extraFields.length + 1}`, label: "New field", placeholder: "" }],
    }));
  };

  const updateField = (idx: number, field: Partial<ExtraField>) => {
    setConfig((prev) => {
      const next = [...prev.extraFields];
      next[idx] = { ...next[idx], ...field };
      return { ...prev, extraFields: next };
    });
  };

  const removeField = (idx: number) => {
    setConfig((prev) => ({ ...prev, extraFields: prev.extraFields.filter((_, i) => i !== idx) }));
  };

  return (
    <AdminLayout
      title="Profile configuration"
      description="Control labels and optional extra fields for user profiles."
      navItems={adminNavLinks}
      sections={[{ id: "profile", label: "Profile" }]}
    >
      <Card id="profile" className="bg-card/70 border-border/60">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Profile fields</CardTitle>
            <CardDescription>Rename labels and add extra fields for user profiles.</CardDescription>
          </div>
          <Button onClick={save} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && (
            <>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Header title</label>
                  <Input
                    value={config.header?.title || ""}
                    onChange={(e) => setConfig({ ...config, header: { ...(config.header || {}), title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Header description</label>
                  <Input
                    value={config.header?.description || ""}
                    onChange={(e) =>
                      setConfig({ ...config, header: { ...(config.header || {}), description: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {(["name", "company", "address", "bio", "notes"] as Array<keyof Config["labels"]>).map((key) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground capitalize">{key} label</label>
                    <Input value={config.labels[key]} onChange={(e) => setConfig({ ...config, labels: { ...config.labels, [key]: e.target.value } })} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Extra fields</p>
                  <p className="text-sm text-muted-foreground">Optional fields shown on the profile page.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add field
                </Button>
              </div>
              <div className="space-y-3">
                {config.extraFields.map((field, idx) => (
                  <div key={idx} className="rounded-lg border border-border/60 p-3 grid md:grid-cols-[1fr,1fr,auto] gap-2 items-center">
                    <Input
                      value={field.key}
                      onChange={(e) => updateField(idx, { key: e.target.value })}
                      placeholder="Key (e.g., website)"
                    />
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      placeholder="Label"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        placeholder="Placeholder"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeField(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {config.extraFields.length === 0 && <p className="text-sm text-muted-foreground">No extra fields yet.</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProfileConfig;
