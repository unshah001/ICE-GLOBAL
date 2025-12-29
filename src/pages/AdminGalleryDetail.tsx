import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

type DetailCopy = {
  badge: string;
  backLabel: string;
  spreadTitle: string;
  spreadBody: string;
  commentTitle: string;
  commentPlaceholderName: string;
  commentPlaceholderMessage: string;
  commentButton: string;
  emptyComments: string;
  shareLabel: string;
  likesLabel: string;
  storyLabelPrefix: string;
};

const defaultCopy: DetailCopy = {
  badge: "Gallery",
  backLabel: "Back to gallery",
  spreadTitle: "Spread the word",
  spreadBody: "Share this moment with your team or friends. Every repost helps the community grow.",
  commentTitle: "Comments",
  commentPlaceholderName: "Your name",
  commentPlaceholderMessage: "Share your thoughts...",
  commentButton: "Post Comment",
  emptyComments: "Be the first to start the conversation.",
  shareLabel: "Share",
  likesLabel: "Likes",
  storyLabelPrefix: "Story",
};

const AdminGalleryDetail = () => {
  const [copy, setCopy] = useState<DetailCopy>(defaultCopy);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const base = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/gallery-detail/copy`);
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
        fetch(`${base}/gallery-detail/copy`, {
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
      setSuccess("Gallery detail copy updated");
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Gallery Detail Copy"
      description="Edit labels and helper text for gallery detail pages."
      navItems={adminNavLinks}
      sections={[{ id: "gallery-detail", label: "Gallery detail" }]}
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
          <CardTitle>Hero & labels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge</label>
              <Input value={copy.badge} onChange={(e) => setCopy({ ...copy, badge: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Back label</label>
              <Input value={copy.backLabel} onChange={(e) => setCopy({ ...copy, backLabel: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Share label</label>
              <Input value={copy.shareLabel} onChange={(e) => setCopy({ ...copy, shareLabel: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Likes label</label>
              <Input value={copy.likesLabel} onChange={(e) => setCopy({ ...copy, likesLabel: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Story label prefix</label>
            <Input value={copy.storyLabelPrefix} onChange={(e) => setCopy({ ...copy, storyLabelPrefix: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={copy.commentTitle}
            onChange={(e) => setCopy({ ...copy, commentTitle: e.target.value })}
            placeholder="Comments"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={copy.commentPlaceholderName}
              onChange={(e) => setCopy({ ...copy, commentPlaceholderName: e.target.value })}
              placeholder="Name placeholder"
            />
            <Input
              value={copy.commentPlaceholderMessage}
              onChange={(e) => setCopy({ ...copy, commentPlaceholderMessage: e.target.value })}
              placeholder="Message placeholder"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={copy.commentButton} onChange={(e) => setCopy({ ...copy, commentButton: e.target.value })} placeholder="CTA" />
            <Input value={copy.emptyComments} onChange={(e) => setCopy({ ...copy, emptyComments: e.target.value })} placeholder="Empty state" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Spread the word</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={copy.spreadTitle} onChange={(e) => setCopy({ ...copy, spreadTitle: e.target.value })} />
          <Textarea value={copy.spreadBody} rows={2} onChange={(e) => setCopy({ ...copy, spreadBody: e.target.value })} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save all"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminGalleryDetail;
