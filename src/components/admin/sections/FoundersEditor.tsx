import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type FounderItem = {
  name: string;
  title: string;
  era: "ICE 1.0" | "ICE 2.0";
  focus: string;
  image: string;
  highlight: string;
  href?: string;
};

export type FoundersData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  founders: FounderItem[];
};

interface FoundersEditorProps {
  data: FoundersData;
  onChange: (data: FoundersData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const FoundersEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: FoundersEditorProps) => {
  const updateField = (key: keyof FoundersData, value: any) => onChange({ ...data, [key]: value });

  const updateFounder = (idx: number, key: keyof FounderItem, value: string) => {
    const next = [...data.founders];
    next[idx] = { ...next[idx], [key]: value };
    updateField("founders", next);
  };

  return (
    <div id="founders" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Founders Spotlight Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “Founders of ICE 1.0 & ICE 2.0” section content.
        </p>
      </div>
      <Tabs defaultValue="founders-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="founders-content">Content</TabsTrigger>
          <TabsTrigger value="founders-list">Founders</TabsTrigger>
          <TabsTrigger value="founders-preview">Preview</TabsTrigger>
          <TabsTrigger value="founders-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="founders-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the founders spotlight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Founders"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Founders of ICE 1.0 & ICE 2.0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Legends who shaped the platform."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="View full story"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                  <Input
                    value={data.ctaHref}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/about"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founders-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Founders</CardTitle>
                <CardDescription>Cards shown in the founders spotlight section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.founders.map((founder, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={founder.name}
                      onChange={(e) => updateFounder(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={founder.title}
                      onChange={(e) => updateFounder(idx, "title", e.target.value)}
                      placeholder="Founder & Chair"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Era</label>
                    <Input
                      value={founder.era}
                      onChange={(e) => updateFounder(idx, "era", e.target.value as any)}
                      placeholder="ICE 1.0 or ICE 2.0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Focus</label>
                    <Input
                      value={founder.focus}
                      onChange={(e) => updateFounder(idx, "focus", e.target.value)}
                      placeholder="Growth, strategy..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={founder.image}
                      onChange={(e) => updateFounder(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                    <Input
                      value={founder.highlight}
                      onChange={(e) => updateFounder(idx, "highlight", e.target.value)}
                      placeholder="Built the first ICE expo..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={founder.href || ""}
                      onChange={(e) => updateFounder(idx, "href", e.target.value)}
                      placeholder="/about#founders"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.founders.length && <p className="text-sm text-muted-foreground">No founders yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add founder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founders-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the founders spotlight.</CardDescription>
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
                {data.founders.map((founder, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={founder.image} alt={founder.name} className="w-full h-32 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-sm">{founder.name}</div>
                      <div className="text-xs text-muted-foreground">{founder.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{founder.highlight}</div>
                      <Badge variant="secondary">{founder.era}</Badge>
                      {founder.href && <div className="text-[11px] text-primary">{founder.href}</div>}
                    </div>
                  </div>
                ))}
                {!data.founders.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No founders to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founders-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish founders changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save founders"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoundersEditor;
