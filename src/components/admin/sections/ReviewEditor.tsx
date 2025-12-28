import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type ReviewImage = { src: string; href: string };
export type ReviewData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  images: ReviewImage[];
};

interface ReviewEditorProps {
  data: ReviewData;
  onChange: (data: ReviewData) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const ReviewEditor = ({ data, onChange, onSave, onRestore, saving, loading }: ReviewEditorProps) => {
  const updateField = (key: keyof ReviewData, value: any) => onChange({ ...data, [key]: value });

  const updateImage = (idx: number, key: keyof ReviewImage, value: string) => {
    const next = [...data.images];
    next[idx] = { ...next[idx], [key]: value };
    updateField("images", next);
  };

  const addImage = () => updateField("images", [...data.images, { src: "https://via.placeholder.com/800x600", href: "/gallery" }]);
  const removeImage = (idx: number) => updateField("images", data.images.filter((_, i) => i !== idx));

  return (
    <div id="review" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Review Moments Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “What is ICE Exhibitions (Infographics & Photos)” section content.
        </p>
      </div>
      <Tabs defaultValue="review-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="review-content">Content</TabsTrigger>
          <TabsTrigger value="review-images">Images</TabsTrigger>
          <TabsTrigger value="review-preview">Preview</TabsTrigger>
          <TabsTrigger value="review-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="review-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the review moments section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="What is ICE Exhibitions"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Infographics & Photos"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="A quick visual walkthrough..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="Explore Full Gallery"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review-images" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Images shown in the review moments mosaic.</CardDescription>
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
                    value={img.href}
                    onChange={(e) => updateImage(idx, "href", e.target.value)}
                    placeholder="/gallery/some-id"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeImage(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!data.images.length && (
                <p className="text-sm text-muted-foreground">No images yet.</p>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={addImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add image
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the review moments section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
                <div className="text-primary text-sm mt-1">
                  {data.ctaLabel} → {data.ctaHref}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-border/60 bg-card/80">
                    <img src={img.src} alt={`Preview ${idx}`} className="w-full h-32 object-cover" />
                    <div className="p-2 text-xs text-primary">{img.href}</div>
                  </div>
                ))}
                {!data.images.length && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No images to preview.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for the review section.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save review"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewEditor;
