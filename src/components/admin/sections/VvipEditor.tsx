import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type VvipItem = {
  name: string;
  title: string;
  role: string;
  image: string;
  highlight: string;
  href?: string;
};

export type VvipData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  guests: VvipItem[];
};

interface VvipEditorProps {
  data: VvipData;
  onChange: (data: VvipData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const VvipEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: VvipEditorProps) => {
  const updateField = (key: keyof VvipData, value: any) => onChange({ ...data, [key]: value });

  const updateGuest = (idx: number, key: keyof VvipItem, value: string) => {
    const next = [...data.guests];
    next[idx] = { ...next[idx], [key]: value };
    updateField("guests", next);
  };

  return (
    <div id="vvips" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">VVIP Spotlight Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “VVIPs at ICE Exhibitions” section content.</p>
      </div>
      <Tabs defaultValue="vvip-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="vvip-content">Content</TabsTrigger>
          <TabsTrigger value="vvip-list">Guests</TabsTrigger>
          <TabsTrigger value="vvip-preview">Preview</TabsTrigger>
          <TabsTrigger value="vvip-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="vvip-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the VVIP spotlight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="VVIPs"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="VVIPs at ICE Exhibitions"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Highlights from dignitaries and guests of honour."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="See all VVIPs"
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

        <TabsContent value="vvip-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Guests</CardTitle>
                <CardDescription>Cards shown in the VVIP spotlight section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.guests.map((guest, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={guest.name}
                      onChange={(e) => updateGuest(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={guest.title}
                      onChange={(e) => updateGuest(idx, "title", e.target.value)}
                      placeholder="Minister of ... "
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role/Org</label>
                    <Input
                      value={guest.role}
                      onChange={(e) => updateGuest(idx, "role", e.target.value)}
                      placeholder="Government / Industry body"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                    <Input
                      value={guest.highlight}
                      onChange={(e) => updateGuest(idx, "highlight", e.target.value)}
                      placeholder="Inaugurated the Mumbai edition..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={guest.image}
                      onChange={(e) => updateGuest(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={guest.href || ""}
                      onChange={(e) => updateGuest(idx, "href", e.target.value)}
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
              {!data.guests.length && <p className="text-sm text-muted-foreground">No VVIPs yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add VVIP
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vvip-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the VVIP spotlight.</CardDescription>
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
                {data.guests.map((guest, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    <img src={guest.image} alt={guest.name} className="w-full h-32 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-sm">{guest.name}</div>
                      <div className="text-xs text-muted-foreground">{guest.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{guest.highlight}</div>
                      {guest.href && <div className="text-[11px] text-primary">{guest.href}</div>}
                    </div>
                  </div>
                ))}
                {!data.guests.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No VVIPs to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vvip-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish VVIP changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save VVIPs"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VvipEditor;
