import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type CelebItem = {
  name: string;
  title: string;
  quote: string;
  image: string;
  badge: string;
  href?: string;
};

export type CelebData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  celebrities: CelebItem[];
};

interface CelebEditorProps {
  data: CelebData;
  onChange: (data: CelebData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const CelebEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: CelebEditorProps) => {
  const updateField = (key: keyof CelebData, value: any) => onChange({ ...data, [key]: value });

  const updateCeleb = (idx: number, key: keyof CelebItem, value: string) => {
    const next = [...data.celebrities];
    next[idx] = { ...next[idx], [key]: value };
    updateField("celebrities", next);
  };

  return (
    <div id="celebs" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Celebrity Spotlight Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “Celebrity photos” section content.</p>
      </div>
      <Tabs defaultValue="celeb-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="celeb-content">Content</TabsTrigger>
          <TabsTrigger value="celeb-list">Celebrities</TabsTrigger>
          <TabsTrigger value="celeb-preview">Preview</TabsTrigger>
          <TabsTrigger value="celeb-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="celeb-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, and description for the celebrity section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Celebrity Photos"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Faces that amplify the spotlight"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="A rotating showcase..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="See all appearances"
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

        <TabsContent value="celeb-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Celebrities</CardTitle>
                <CardDescription>Cards shown in the celebrity spotlight section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.celebrities.map((celeb, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={celeb.name}
                      onChange={(e) => updateCeleb(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title/Role</label>
                    <Input
                      value={celeb.title}
                      onChange={(e) => updateCeleb(idx, "title", e.target.value)}
                      placeholder="Film Actor"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                    <Input
                      value={celeb.badge}
                      onChange={(e) => updateCeleb(idx, "badge", e.target.value)}
                      placeholder="Keynote Guest"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Quote</label>
                    <Input
                      value={celeb.quote}
                      onChange={(e) => updateCeleb(idx, "quote", e.target.value)}
                      placeholder="Quote"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={celeb.image}
                      onChange={(e) => updateCeleb(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={celeb.href}
                      onChange={(e) => updateCeleb(idx, "href", e.target.value)}
                      placeholder="/gallery"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.celebrities.length && <p className="text-sm text-muted-foreground">No celebrities yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add celebrity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="celeb-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the celebrity spotlight.</CardDescription>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.celebrities.map((celeb, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={celeb.image} alt={celeb.name} className="w-full h-40 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{celeb.name}</span>
                        {celeb.badge && <Badge variant="secondary">{celeb.badge}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{celeb.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{celeb.quote}</div>
                      {celeb.href && <div className="text-[11px] text-primary">{celeb.href}</div>}
                    </div>
                  </div>
                ))}
                {!data.celebrities.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No celebrities to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="celeb-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for celebrity spotlight.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save celebrities"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CelebEditor;
