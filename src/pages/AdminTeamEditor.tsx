import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import TeamEditor, { type TeamData } from "@/components/admin/sections/TeamEditor";

const emptyTeam: TeamData = {
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "/teams",
  team: [],
};

const AdminTeamEditor = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [data, setData] = useState<TeamData>(emptyTeam);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/teams`);
      if (!res.ok) throw new Error("Failed to load team");
      const payload = (await res.json()) as TeamData;
      setData({
        eyebrow: payload.eyebrow || "",
        title: payload.title || "",
        description: payload.description || "",
        ctaLabel: payload.ctaLabel || "",
        ctaHref: payload.ctaHref || "/teams",
        team: payload.team || [],
      });
    } catch (err: any) {
      setError(err.message || "Unable to load team");
      setData(emptyTeam);
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
      const res = await fetch(`${base}/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save team");
      setSuccess("Team updated");
    } catch (err: any) {
      setError(err.message || "Unable to save team");
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${base}/teams/restore`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Restore failed");
      const payload = await res.json();
      setData({
        eyebrow: payload.eyebrow || "",
        title: payload.title || "",
        description: payload.description || "",
        ctaLabel: payload.ctaLabel || "",
        ctaHref: payload.ctaHref || "/teams",
        team: payload.team || [],
      });
      setSuccess("Defaults restored");
    } catch (err: any) {
      setError(err.message || "Unable to restore defaults");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Team (Editor only)"
      description="Quick edit for the home-page team section. Use the full Team management page for deeper controls."
      navItems={adminNavLinks}
      sections={[{ id: "team", label: "Team" }]}
    >
      <div className="text-sm text-muted-foreground mb-4">
        Save writes directly to the team block used on the home page. Restore resets to empty/defaults.
      </div>
      {error && <div className="text-sm text-destructive mb-2">{error}</div>}
      {success && <div className="text-sm text-green-600 mb-2">{success}</div>}
      <TeamEditor
        data={data}
        onChange={setData}
        onAddMember={() =>
          setData({
            ...data,
            team: [
              ...data.team,
              {
                id: `team-${Date.now()}`,
                name: "",
                role: "",
                department: "",
                focus: "",
                image: "",
                href: "",
              },
            ],
          })
        }
        onRemoveMember={(idx) => setData({ ...data, team: data.team.filter((_, i) => i !== idx) })}
        onSave={save}
        onRestore={restore}
        saving={saving}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminTeamEditor;
