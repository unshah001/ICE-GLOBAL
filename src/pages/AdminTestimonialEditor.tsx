import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import TestimonialsEditor, { type TestimonialsData } from "@/components/admin/sections/TestimonialsEditor";

const defaultData: TestimonialsData = {
  hero: { badge: "Testimonials", title: "What our partners say", intro: "Snapshots from brands, buyers, and founders." },
  testimonials: [],
};

const AdminTestimonialEditor = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [data, setData] = useState<TestimonialsData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_access_token");

const res = await fetch(`${base}/testimonials`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      if (!res.ok) throw new Error("Failed to load testimonials");
      const payload = (await res.json()) as TestimonialsData;
      setData({
        hero: {
          badge: payload.hero?.badge || defaultData.hero.badge,
          title: payload.hero?.title || defaultData.hero.title,
          intro: payload.hero?.intro || defaultData.hero.intro,
          ctaLabel: payload.hero?.ctaLabel || "Send feedback",
          ctaHref: payload.hero?.ctaHref || "/feedback",
        },
        testimonials: payload.testimonials || [],
      });
    } catch (err: any) {
      setError(err.message || "Unable to load testimonials");
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_access_token");

const res = await fetch(`${base}/testimonials`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
      if (!res.ok) throw new Error("Failed to save testimonials");
      setSuccess("Testimonials updated");
    } catch (err: any) {
      setError(err.message || "Unable to save testimonials");
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_access_token");

const res = await fetch(`${base}/testimonials`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(defaultData),
});
      if (!res.ok) throw new Error("Restore failed");
      setData(defaultData);
      setSuccess("Defaults restored");
    } catch (err: any) {
      setError(err.message || "Unable to restore defaults");
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () => {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `testimonial-${Date.now()}`;
    setData({
      ...data,
      testimonials: [
        ...data.testimonials,
        { id, name: "", role: "", company: "", image: "", rating: 5, quote: "" },
      ],
    });
  };

  return (
    <AdminLayout
      title="Testimonials (Editor only)"
      description="Quick editor for the home-page testimonials rail."
      navItems={adminNavLinks}
      sections={[{ id: "testimonials", label: "Testimonials" }]}
    >
      <div className="text-sm text-muted-foreground mb-4">
        Saves write directly to the testimonials block. Restore resets to defaults.
      </div>
      {error && <div className="text-sm text-destructive mb-2">{error}</div>}
      {success && <div className="text-sm text-green-600 mb-2">{success}</div>}
      <TestimonialsEditor
        data={data}
        onChange={setData}
        onAdd={addTestimonial}
        onRemove={(idx) => setData({ ...data, testimonials: data.testimonials.filter((_, i) => i !== idx) })}
        onSave={save}
        onRestore={restore}
        saving={saving}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminTestimonialEditor;
