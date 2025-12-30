import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

type MediaVariant = { key: string; path: string; fileName?: string; format?: string; width?: number; height?: number; size?: number };

export type MediaUploadResult = {
  id: string;
  variants: MediaVariant[];
};

interface MediaUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (result: MediaUploadResult) => void;
  folder?: string;
}

/**
 * Reusable admin modal that uploads a single image and returns generated variants.
 * Defaults: main (90% quality), medium (60%), thumb (40%), no resizing.
 */
const MediaUploadModal = ({ open, onOpenChange, onUploaded, folder }: MediaUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const base = import.meta.env.VITE_API_BASE_URL || "";

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

  const handleUpload = async () => {
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }
    setUploading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const config = {
        variants: [
          { key: "main", format: "webp", quality: 90 },
          { key: "medium", format: "webp", quality: 60 },
          { key: "thumb", format: "webp", quality: 40 },
        ],
        folder,
      };

      const form = new FormData();
      form.append("file", file);
      form.append("config", JSON.stringify(config));

      const attempt = async (auth: string | null) =>
        fetch(`${base}/media/upload`, {
          method: "POST",
          headers: auth ? { Authorization: `Bearer ${auth}` } : undefined,
          body: form,
        });

      let res = await attempt(token);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await attempt(refreshed);
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Upload failed");
      }
      const payload = await res.json();
      onUploaded({ id: payload.id, variants: payload.variants || [] });
      toast.success("Image uploaded and variants generated");
      setFile(null);
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="media-file">Select image</Label>
            <Input id="media-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
          </div>
          <p className="text-xs text-muted-foreground">
            Generates: main (90% quality), medium (60%), thumb (40%). No resizing applied so original dimensions are preserved.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadModal;
