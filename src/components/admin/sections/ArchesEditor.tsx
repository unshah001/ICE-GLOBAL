import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type ArchItem = {
  city: string;
  year: string;
  highlight: string;
  image: string;
  href?: string;
};

export type ArchesData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  arches: ArchItem[];
};

interface ArchesEditorProps {
  data: ArchesData;
  onChange: (data: ArchesData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const ArchesEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: ArchesEditorProps) => {
  const updateField = (key: keyof ArchesData, value: any) => onChange({ ...data, [key]: value });

  const updateArch = (idx: number, key: keyof ArchItem, value: string) => {
    const next = [...data.arches];
    next[idx] = { ...next[idx], [key]: value };
    updateField("arches", next);
  };

  return (
    <div id="arches" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Entrance Arches Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “Mega Entrance Arches (10 cities, 30 years)” section content.
        </p>
      </div>
      <Tabs defaultValue="arches-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="arches-content">Content</TabsTrigger>
          <TabsTrigger value="arches-list">Arches</TabsTrigger>
          <TabsTrigger value="arches-preview">Preview</TabsTrigger>
          <TabsTrigger value="arches-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="arches-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, and description for the entrance arches section.</CardDescription>
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
                  placeholder="Mega Entrance Arches across 10 cities"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Three decades of arches engineered for arrivals..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA label</label>
                  <Input
                    value={data.ctaLabel || ""}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="View entrance arches"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA href</label>
                  <Input
                    value={data.ctaHref || ""}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/gallery#arches"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arches-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Arches</CardTitle>
                <CardDescription>Cards shown in the mega entrance arches section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.arches.map((arch, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City</label>
                    <Input
                      value={arch.city}
                      onChange={(e) => updateArch(idx, "city", e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                    <Input
                      value={arch.year}
                      onChange={(e) => updateArch(idx, "year", e.target.value)}
                      placeholder="1994"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={arch.image}
                      onChange={(e) => updateArch(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                    <Input
                      value={arch.highlight}
                      onChange={(e) => updateArch(idx, "highlight", e.target.value)}
                      placeholder="Immersive entryway for 50k visitors..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={arch.href || ""}
                      onChange={(e) => updateArch(idx, "href", e.target.value)}
                      placeholder="/gallery/mumbai-arch"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.arches.length && <p className="text-sm text-muted-foreground">No arches yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add arch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arches-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the entrance arches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.arches.map((arch, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={arch.image} alt={arch.city} className="w-full h-28 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{arch.city}</span>
                        <span className="text-xs text-primary">{arch.year}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{arch.highlight}</div>
                      {arch.href && <div className="text-[11px] text-primary">{arch.href}</div>}
                    </div>
                  </div>
                ))}
                {!data.arches.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No arches to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arches-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for entrance arches.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save arches"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchesEditor;
