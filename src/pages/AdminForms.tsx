import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, RefreshCw } from "lucide-react";

type Field = { id: string; label: string; type: "text" | "email" | "textarea" | "select" | "number"; required: boolean; options?: string[] };
type FormDef = { slug: string; title: string; description: string; fields: Field[] };

const baseFields: Field[] = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
];

const fixedForms: FormDef[] = [
  {
    slug: "contact",
    title: "Contact",
    description: "General inquiry",
    fields: [...baseFields, { id: "company", label: "Company", type: "text", required: false }],
  },
  {
    slug: "partner",
    title: "Partner inquiry",
    description: "Partnership goals",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "goals", label: "Goals", type: "textarea", required: true },
    ],
  },
  {
    slug: "sponsor",
    title: "Sponsor inquiry",
    description: "Sponsorship objectives",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "budget", label: "Budget range", type: "text", required: true },
      { id: "goals", label: "Objectives", type: "textarea", required: true },
    ],
  },
  {
    slug: "brand-guidelines",
    title: "Brand guidelines request",
    description: "Asset request",
    fields: [
      ...baseFields,
      { id: "company", label: "Company", type: "text", required: false },
      { id: "intent", label: "Intended use", type: "textarea", required: true },
    ],
  },
  {
    slug: "feedback",
    title: "Feedback",
    description: "Experience feedback",
    fields: [
      ...baseFields,
      { id: "role", label: "Role", type: "text", required: false },
      { id: "rating", label: "Rating (1-5)", type: "number", required: true },
      { id: "message", label: "Feedback", type: "textarea", required: true },
    ],
  },
];

const AdminForms = () => {
  const [forms, setForms] = useState<FormDef[]>(fixedForms);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const base = import.meta.env.VITE_API_BASE_URL || "";

  const current = forms[selectedIndex] || defaultForm;

  const loadForms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/forms`);
      if (!res.ok) throw new Error("Failed to load forms");
      const data = await res.json();
      const mapped: FormDef[] = fixedForms.map((f) => {
        const existing = (data as FormDef[]).find((d) => d.slug === f.slug);
        if (existing) {
          return enforceForm({ ...existing, title: existing.title || f.title, description: existing.description || f.description });
        }
        return enforceForm(f);
      });
      setForms(mapped);
      setSelectedIndex(0);
    } catch (err: any) {
      setError(err.message || "Unable to load forms");
      setForms(fixedForms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enforceBase = (fields: Field[]) => {
    const map = new Map(fields.map((f) => [f.id, f]));
    for (const base of baseFields) {
      const existing = map.get(base.id);
      map.set(base.id, existing ? { ...existing, ...base } : base);
    }
    return Array.from(map.values());
  };

  const updateForm = (idx: number, updated: Partial<FormDef>) =>
    setForms((prev) => {
      const next = [...prev];
      next[idx] = enforceForm({ ...next[idx], ...updated });
      return next;
    });

  const enforceForm = (form: FormDef) => ({
    ...form,
    fields: enforceBase(form.fields || []),
  });

  const removeField = (fieldId: string) => {
    if (fieldId === "name" || fieldId === "email") return;
    updateForm(selectedIndex, {
      fields: current.fields.filter((f) => f.id !== fieldId),
    });
  };

  const addField = (type: Field["type"]) => {
    const id = `field-${Date.now()}`;
    updateForm(selectedIndex, {
      fields: [...current.fields, { id, label: "New field", type, required: false }],
    });
  };

  const updateField = (fieldId: string, updated: Partial<Field>) => {
    updateForm(selectedIndex, {
      fields: current.fields.map((f) => (f.id === fieldId ? { ...f, ...updated } : f)),
    });
  };

  const saveForm = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const form = enforceForm(current);
      const token = localStorage.getItem("admin_access_token");
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/forms/${form.slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(form),
        });
      let res = await attempt(token);
      if (res && res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await attempt(refreshed);
      }
      if (!res || !res.ok) throw new Error("Save failed");
      setSuccess("Form saved");
      await loadForms();
    } catch (err: any) {
      setError(err.message || "Unable to save form");
    } finally {
      setSaving(false);
    }
  };

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
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("admin_access_token", data.accessToken);
      return data.accessToken as string;
    }
    return null;
  };

  return (
    <AdminLayout
      title="Form Builder"
      description="Create or edit forms. Name and Email are always required."
      navItems={adminNavLinks}
      sections={[{ id: "forms", label: "Forms" }]}
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

      <div className="flex flex-wrap gap-2 mb-4">
        {forms.map((form, idx) => (
          <Button
            key={form.slug}
            variant={idx === selectedIndex ? "default" : "outline"}
            onClick={() => setSelectedIndex(idx)}
          >
            {form.slug}
          </Button>
        ))}
        <Button variant="ghost" onClick={loadForms}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reload
        </Button>
      </div>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Form settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Slug</label>
              <Input value={current.slug} disabled className="bg-muted/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={current.title} onChange={(e) => updateForm(selectedIndex, { title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={current.description}
              onChange={(e) => updateForm(selectedIndex, { description: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60 mt-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Fields</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addField("text")}>
              <Plus className="w-4 h-4 mr-1" /> Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("textarea")}>
              <Plus className="w-4 h-4 mr-1" /> Textarea
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("select")}>
              <Plus className="w-4 h-4 mr-1" /> Select
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("number")}>
              <Plus className="w-4 h-4 mr-1" /> Number
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {current.fields.map((field) => (
            <div
              key={field.id}
              className="border border-border/60 rounded-xl p-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-center"
            >
              <div>
                <label className="text-xs text-muted-foreground">Field ID</label>
                <Input
                  value={field.id}
                  onChange={(e) => updateField(field.id, { id: e.target.value })}
                  disabled={field.id === "name" || field.id === "email"}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Label</label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  disabled={field.id === "name" || field.id === "email"}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <Input value={field.type} disabled className="bg-muted/40" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    disabled={field.id === "name" || field.id === "email"}
                  />
                  <span className="text-sm">Required</span>
                </div>
              </div>
              {field.type === "select" && (
                <div className="md:col-span-3">
                  <label className="text-xs text-muted-foreground">Options (comma-separated)</label>
                  <Input
                    value={(field.options || []).join(", ")}
                    onChange={(e) =>
                      updateField(field.id, { options: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })
                    }
                  />
                </div>
              )}
              <div className="md:col-span-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(field.id)}
                  disabled={field.id === "name" || field.id === "email"}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button onClick={saveForm} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save form"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminForms;
