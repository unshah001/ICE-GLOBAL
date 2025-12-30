import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import MediaUploadModal, { type MediaUploadResult } from "../MediaUploadModal";

export type GalleryArticleSection = { heading: string; body: string };
export type GalleryItemAdmin = {
  id: string;
  title: string;
  year: string;
  category: string;
  brand: string;
  image: string;
  variants?: { key: string; path?: string; fileName?: string; format?: string; width?: number; height?: number; size?: number }[];
  excerpt: string;
  article: GalleryArticleSection[];
  likes: number;
  comments: { id: string; author: string; message: string; date: string }[];
  tags: string[];
};

interface GalleryItemsEditorProps {
  items: GalleryItemAdmin[];
  onItemChange: (idx: number, key: keyof GalleryItemAdmin, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onAddArticle: (idx: number) => void;
  onRemoveArticle: (idx: number, articleIdx: number) => void;
  onArticleChange: (idx: number, articleIdx: number, key: keyof GalleryArticleSection, value: string) => void;
  onSave: () => void;
  saving: boolean;
}

const GalleryItemsEditor = ({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onAddArticle,
  onRemoveArticle,
  onArticleChange,
  onSave,
  saving,
}: GalleryItemsEditorProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  const isExpanded = (id: string, idx: number) => {
    const key = id || `idx-${idx}`;
    if (typeof expanded[key] === "boolean") return expanded[key];
    // default: first item open
    return idx === 0;
  };

  const totals = useMemo(
    () => ({
      items: items.length,
      sections: items.reduce((acc, cur) => acc + (cur.article?.length || 0), 0),
    }),
    [items]
  );

  return (
    <>
      <div id="gallery-items" className="pt-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-semibold">Gallery Items</h2>
          <p className="text-muted-foreground text-sm">Create, edit, and organize all gallery entries. These power both the gallery grid and each detail page.</p>
          <p className="text-xs text-muted-foreground">
            Managing {totals.items} item{totals.items === 1 ? "" : "s"} • {totals.sections} story section
            {totals.sections === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex justify-between items-center gap-3">
          <Button variant="outline" onClick={onAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add gallery item
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save gallery"}
          </Button>
        </div>

        <div className="grid gap-4">
          {items.map((item, idx) => {
            const key = item.id || `idx-${idx}`;
            const open = isExpanded(key, idx);
            return (
              <Card key={key} className="bg-card/80 border-border/70 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggle(key)}
                      aria-label={open ? "Collapse" : "Expand"}
                      className="border border-border/60"
                    >
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                    <div>
                      <CardTitle>{item.title || "New gallery item"}</CardTitle>
                      <CardDescription>Configure the content and metadata for this gallery entry.</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.year || "Year"}</Badge>
                    <Badge>{item.category || "Category"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {open && (
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">ID / slug</label>
                        <Input value={item.id} onChange={(e) => onItemChange(idx, "id", e.target.value)} placeholder="vr-experience-zone" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                        <Input value={item.title} onChange={(e) => onItemChange(idx, "title", e.target.value)} placeholder="VR Experience Zone" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                        <Input value={item.year} onChange={(e) => onItemChange(idx, "year", e.target.value)} placeholder="2024" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                        <Input value={item.category} onChange={(e) => onItemChange(idx, "category", e.target.value)} placeholder="Stage" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Brand</label>
                        <Input value={item.brand} onChange={(e) => onItemChange(idx, "brand", e.target.value)} placeholder="ICEGLOBAL" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-muted-foreground block">Image path (auto-filled)</label>
                        <Button variant="secondary" size="sm" onClick={() => setUploadingFor(idx)}>
                          Upload image
                        </Button>
                      </div>
                      <Input value={item.image} readOnly placeholder="Upload to fill automatically" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Variants</p>
                          <p className="text-xs text-muted-foreground">main/medium/thumb paths are filled after upload.</p>
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-3">
                        {(item.variants ?? []).map((variant, vIdx) => (
                          <div key={`${variant.key}-${vIdx}`} className="space-y-1">
                            <label className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="secondary">{variant.key}</Badge>
                              <span>Path / file</span>
                            </label>
                            <Input value={variant.path || variant.fileName || ""} readOnly placeholder="e.g. 2024/12/01/image-main.webp" />
                          </div>
                        ))}
                        {!(item.variants && item.variants.length) && (
                          <p className="text-xs text-muted-foreground">Upload to generate variant paths.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Excerpt</label>
                      <Textarea
                        value={item.excerpt}
                        onChange={(e) => onItemChange(idx, "excerpt", e.target.value)}
                        placeholder="Short summary shown in the gallery grid and hero."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Tags (comma separated)</label>
                      <Input
                        value={item.tags.join(", ")}
                        onChange={(e) =>
                          onItemChange(
                            idx,
                            "tags",
                            e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="stage, immersive, lighting"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Article sections</p>
                          <p className="text-xs text-muted-foreground">These paragraphs power the gallery detail page.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onAddArticle(idx)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add section
                        </Button>
                      </div>
                      {item.article.map((section, articleIdx) => (
                        <div key={articleIdx} className="border border-border/60 rounded-xl p-3 space-y-2 bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Story {articleIdx + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => onRemoveArticle(idx, articleIdx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={section.heading}
                            onChange={(e) => onArticleChange(idx, articleIdx, "heading", e.target.value)}
                            placeholder="Immersive Production"
                          />
                          <Textarea
                            value={section.body}
                            onChange={(e) => onArticleChange(idx, articleIdx, "body", e.target.value)}
                            placeholder="Describe the story block shown on the detail page."
                          />
                        </div>
                      ))}
                      {!item.article.length && <p className="text-sm text-muted-foreground">No article sections yet.</p>}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {!items.length && <p className="text-sm text-muted-foreground">No gallery items yet. Add your first entry to begin.</p>}
        </div>
      </div>

      <MediaUploadModal
        open={uploadingFor !== null}
        onOpenChange={(open) => {
          if (!open) setUploadingFor(null);
        }}
        onUploaded={(result: MediaUploadResult) => {
          if (uploadingFor === null) return;
          const mainVariant = result.variants.find((v) => v.key === "main") ?? result.variants[0];
          const imagePath = mainVariant?.path || mainVariant?.fileName || items[uploadingFor].image;
          onItemChange(uploadingFor, "image", imagePath);
          onItemChange(uploadingFor, "variants", result.variants);
          setUploadingFor(null);
        }}
      />
    </>
  );
};

export default GalleryItemsEditor;
