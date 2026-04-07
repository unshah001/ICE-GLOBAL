
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import BrandEditor, { type BrandsData, type BrandItem } from "@/components/admin/sections/BrandEditor";

const emptyBrands: BrandsData = {
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "/brands",
  brands: [],
};

type BrandsResponse = {
  data: BrandItem[];
};

const AdminBrandEditor = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [data, setData] = useState<BrandsData>(emptyBrands);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", "24");
      const res = await fetch(`${base}/brands?${params.toString()}`);
      const heroRes = await fetch(`${base}/brands/hero`);
      const payload = (await res.json()) as BrandsResponse;
      const hero = heroRes.ok ? await heroRes.json() : {};
      setData({
        eyebrow: hero?.badge || "",
        title: hero?.title || "",
        description: hero?.subtitle || "",
        ctaLabel: hero?.ctaLabel || "",
        ctaHref: hero?.ctaHref || "/brands",
        brands: payload?.data || [],
      });
    } catch {
      setData(emptyBrands);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
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
    const json = await res.json();
    if (json.accessToken) {
      localStorage.setItem("admin_access_token", json.accessToken);
      return json.accessToken as string;
    }
    return null;
  };

  const getAccessToken = async (): Promise<string | null> => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken();
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let token = await getAccessToken();
      if (!token) {
        setError("Not authenticated. Please log in again.");
        return;
      }

      const authHeader = (t: string) => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      });

      // Save hero section (eyebrow/badge, title, description/subtitle)
      const heroPayload = {
        badge: data.eyebrow,
        title: data.title,
        subheading: data.description,
        ctaLabel: data.ctaLabel,
        ctaHref: data.ctaHref,
      };

      let heroRes = await fetch(`${base}/brands/hero`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify(heroPayload),
      });

      if (heroRes.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) throw new Error("Session expired. Please log in again.");
        token = refreshed;
        heroRes = await fetch(`${base}/brands/hero`, {
          method: "PUT",
          headers: authHeader(token),
          body: JSON.stringify(heroPayload),
        });
      }

      if (!heroRes.ok) {
        const body = await heroRes.json().catch(() => ({}));
        throw new Error(body.message || `Hero save failed (${heroRes.status})`);
      }

      // Save each brand
      const brandsToSave = (data.brands || []).filter(
        (b) => b.slug?.trim() || b.name?.trim()
      );

      for (const brand of brandsToSave) {
        const { _id, createdAt, updatedAt, ...rest } = brand as any;

        const slug = (
          rest.slug?.trim() ||
          rest.name
            ?.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") ||
          ""
        ).trim();

        if (!slug) continue;

        const doPut = (t: string) =>
          fetch(`${base}/brands/${encodeURIComponent(slug)}`, {
            method: "PUT",
            headers: authHeader(t),
            body: JSON.stringify({ ...rest, slug }),
          });

        let brandRes = await doPut(token);

        if (brandRes.status === 401) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) throw new Error("Session expired. Please log in again.");
          token = refreshed;
          brandRes = await doPut(token);
        }

        if (!brandRes.ok) {
          const body = await brandRes.json().catch(() => ({}));
          throw new Error(body.message || `Save failed for "${slug}" (${brandRes.status})`);
        }
      }

      setSuccess(`Saved hero and ${brandsToSave.length} brand(s) successfully`);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout
      title="Brand Highlights Editor"
      description="Manage the Brands logo / Trustworthy Leaders section content."
      navItems={adminNavLinks}
      sections={[{ id: "brands", label: "Brand Highlights" }]}
    >
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
          <span>⚠ {error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3 mb-4">
          <span>✓ {success}</span>
        </div>
      )}

      <BrandEditor
        data={data}
        onChange={setData}
        onAddBrand={() =>
          setData({
            ...data,
            brands: [
              ...(data.brands || []),
              { slug: "", name: "", logo: "", relationship: "", category: "", image: "" },
            ],
          })
        }
        onRemoveBrand={(idx) =>
          setData({ ...data, brands: (data.brands || []).filter((_, i) => i !== idx) })
        }
        onSave={handleSave}
        onRestore={() => load()}
        saving={saving}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminBrandEditor;