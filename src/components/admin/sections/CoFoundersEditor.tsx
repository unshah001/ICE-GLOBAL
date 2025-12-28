import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type CoFounderItem = {
  name: string;
  track: "IGE" | "IGN" | "IGE & IGN";
  title: string;
  focus: string;
  image: string;
  highlight: string;
  href?: string;
};

export type CoFoundersData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  cofounders: CoFounderItem[];
};

interface CoFoundersEditorProps {
  data: CoFoundersData;
  onChange: (data: CoFoundersData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const CoFoundersEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: CoFoundersEditorProps) => {
  const updateField = (key: keyof CoFoundersData, value: any) => onChange({ ...data, [key]: value });

  const updateCofounder = (idx: number, key: keyof CoFounderItem, value: string) => {
    const next = [...data.cofounders];
    next[idx] = { ...next[idx], [key]: value };
    updateField("cofounders", next);
  };

  return (
    <div id="cofounders" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Co-founders Spotlight Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “Co-founding team of ICE 2.0 (IGE & IGN)” section content.</p>
      </div>
      <Tabs defaultValue="cofounders-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="cofounders-content">Content</TabsTrigger>
          <TabsTrigger value="cofounders-list">Co-founders</TabsTrigger>
          <TabsTrigger value="cofounders-preview">Preview</TabsTrigger>
          <TabsTrigger value="cofounders-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="cofounders-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the co-founders spotlight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Co-founders"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Co-founding team of ICE 2.0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Leads across IGE & IGN tracks."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="See the team"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                  <Input
                    value={data.ctaHref}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/about#team"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cofounders-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Co-founders</CardTitle>
                <CardDescription>Cards shown in the co-founders spotlight section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.cofounders.map((cf, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={cf.name}
                      onChange={(e) => updateCofounder(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Track</label>
                    <Input
                      value={cf.track}
                      onChange={(e) => updateCofounder(idx, "track", e.target.value as any)}
                      placeholder="IGE / IGN / IGE & IGN"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={cf.title}
                      onChange={(e) => updateCofounder(idx, "title", e.target.value)}
                      placeholder="Co-founder, Platform"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Focus</label>
                    <Input
                      value={cf.focus}
                      onChange={(e) => updateCofounder(idx, "focus", e.target.value)}
                      placeholder="Product, ops, partnerships..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={cf.image}
                      onChange={(e) => updateCofounder(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                    <Input
                      value={cf.highlight}
                      onChange={(e) => updateCofounder(idx, "highlight", e.target.value)}
                      placeholder="Built the digital platform..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={cf.href || ""}
                      onChange={(e) => updateCofounder(idx, "href", e.target.value)}
                      placeholder="/about#team"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.cofounders.length && <p className="text-sm text-muted-foreground">No co-founders yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add co-founder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cofounders-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the co-founders spotlight.</CardDescription>
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
                {data.cofounders.map((cf, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={cf.image} alt={cf.name} className="w-full h-32 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-sm">{cf.name}</div>
                      <div className="text-xs text-muted-foreground">{cf.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{cf.highlight}</div>
                      <Badge variant="secondary">{cf.track}</Badge>
                      {cf.href && <div className="text-[11px] text-primary">{cf.href}</div>}
                    </div>
                  </div>
                ))}
                {!data.cofounders.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No co-founders to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cofounders-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish co-founder changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save co-founders"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoFoundersEditor;
