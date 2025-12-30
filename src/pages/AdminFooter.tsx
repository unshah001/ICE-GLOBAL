import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import FooterEditor, { type FooterData } from "@/components/admin/sections/FooterEditor";

const emptyFooter: FooterData = {
  ctaTitle: "",
  ctaDescription: "",
  partnerHref: "",
  sponsorHref: "",
  copyright: "",
  exploreLinks: [],
  partnersLinks: [],
  legalLinks: [],
  contact: { location: "", email: "", phone: "" },
  socials: [],
};

const AdminFooter = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [data, setData] = useState<FooterData>(emptyFooter);
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/footer`);
      if (!res.ok) throw new Error("Failed to load footer");
      const payload = await res.json();
      setData({ ...emptyFooter, ...(payload || {}) });
    } catch {
      setData(emptyFooter);
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
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const attempt = async (authToken: string | null) =>
        fetch(`${base}/footer`, {
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
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await fetch(`${base}/footer/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Footer"
      description="Manage footer CTA, links, contact, and socials."
      navItems={adminNavLinks}
      sections={[{ id: "footer", label: "Footer" }]}
    >
      <FooterEditor data={data} onChange={setData} onSave={save} onRestore={restore} saving={saving} loading={loading} />
    </AdminLayout>
  );
};

export default AdminFooter;
