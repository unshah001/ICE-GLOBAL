import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type StallImage = { src: string; href?: string };
export type StallStat = { value: string; label: string; icon?: "grid" | "users" | string };

export type StallsData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  images: StallImage[];
  stats?: StallStat[];
};

interface StallsEditorProps {
  data: StallsData;
  onChange: (data: StallsData) => void;
  onAddImage: () => void;
  onRemoveImage: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const StallsEditor = ({
  data,
  onChange,
  onAddImage,
  onRemoveImage,
  onSave,
  onRestore,
  saving,
  loading,
}: StallsEditorProps) => {
  const updateField = (key: keyof StallsData, value: any) => onChange({ ...data, [key]: value });

  const updateImage = (idx: number, key: keyof StallImage, value: string) => {
    const next = [...data.images];
    next[idx] = { ...next[idx], [key]: value };
    updateField("images", next);
  };

  const updateStat = (idx: number, key: keyof StallStat, value: string) => {
    const next = [...(data.stats || [])];
    next[idx] = { ...next[idx], [key]: value };
    updateField("stats", next);
  };

  const addStat = () => updateField("stats", [...(data.stats || []), { value: "", label: "", icon: "grid" }]);
  const removeStat = () => updateField("stats", data.stats && data.stats.length ? data.stats.slice(0, -1) : []);

  return (
    <div id="stalls" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Stalls Mosaic Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “10,000+ brands & seller stalls” section content.</p>
      </div>
      <Tabs defaultValue="stalls-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="stalls-content">Content</TabsTrigger>
          <TabsTrigger value="stalls-images">Images</TabsTrigger>
          <TabsTrigger value="stalls-preview">Preview</TabsTrigger>
          <TabsTrigger value="stalls-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="stalls-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, stats, and CTA for the stalls mosaic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Review the moment"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="10,000+ brands & seller stalls"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="A visual atlas of the booths and showcases..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="See the full archive"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                  <Input
                    value={data.ctaHref}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/gallery"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Stats</label>
                {(data.stats || []).map((stat, idx) => (
                  <div key={idx} className="grid md:grid-cols-3 gap-3 items-end">
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                      placeholder="10,000+"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder="brands & sellers"
                    />
                    <Input
                      value={stat.icon || ""}
                      onChange={(e) => updateStat(idx, "icon", e.target.value as any)}
                      placeholder="grid or users"
                    />
                  </div>
                ))}
                {(!data.stats || !data.stats.length) && (
                  <p className="text-sm text-muted-foreground">No stats yet.</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={addStat}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add stat
                  </Button>
                  <Button variant="ghost" onClick={removeStat}>
                    Remove last
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stalls-images" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Images</CardTitle>
                <CardDescription>Images shown in the stalls parallax mosaic.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.images.map((img, idx) => (
                <div key={idx} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <Input
                    value={img.src}
                    onChange={(e) => updateImage(idx, "src", e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    value={img.href || ""}
                    onChange={(e) => updateImage(idx, "href", e.target.value)}
                    placeholder="/gallery"
                  />
                  <Button variant="ghost" size="icon" onClick={() => onRemoveImage(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!data.images.length && <p className="text-sm text-muted-foreground">No images yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAddImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add image
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stalls-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the stalls mosaic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
                {data.ctaLabel && (
                  <div className="text-primary text-sm mt-1">
                    {data.ctaLabel} → {data.ctaHref}
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.images.map((img, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={img.src} alt={`Stall ${idx}`} className="w-full h-32 object-cover" />
                    {img.href && <div className="p-2 text-[11px] text-primary">{img.href}</div>}
                  </div>
                ))}
                {!data.images.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No images to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stalls-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish stalls changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save stalls"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StallsEditor;
