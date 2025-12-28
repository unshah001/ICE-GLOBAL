import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type TimelineItem = { title: string; description: string; image?: string };

export type TimelineData = {
  eyebrow: string;
  title: string;
  description: string;
  milestones: TimelineItem[];
};

interface TimelineEditorProps {
  data: TimelineData;
  onChange: (data: TimelineData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const TimelineEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: TimelineEditorProps) => {
  const updateField = (key: keyof TimelineData, value: any) => onChange({ ...data, [key]: value });

  const updateMilestone = (idx: number, key: keyof TimelineItem, value: string) => {
    const next = [...data.milestones];
    next[idx] = { ...next[idx], [key]: value };
    updateField("milestones", next);
  };

  return (
    <div id="timeline" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Timeline Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “30 Years History / Journey Timeline (Legacy in Motion)” section content.
        </p>
      </div>
      <Tabs defaultValue="timeline-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="timeline-content">Content</TabsTrigger>
          <TabsTrigger value="timeline-list">Milestones</TabsTrigger>
          <TabsTrigger value="timeline-preview">Preview</TabsTrigger>
          <TabsTrigger value="timeline-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, and description for the timeline intro block.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="30 Years • Legacy in Motion"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="ICE Exhibitions Journey Timeline"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Milestones from 1994–2024 with imagery."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Items shown in the sticky scroll timeline.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.milestones.map((item, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                      placeholder="1994 • First ICE Expo"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateMilestone(idx, "description", e.target.value)}
                      placeholder="Opened in Mumbai with 200 brands..."
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={item.image || ""}
                      onChange={(e) => updateMilestone(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.milestones.length && <p className="text-sm text-muted-foreground">No milestones yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add milestone
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the timeline cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {data.milestones.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />}
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                    </div>
                  </div>
                ))}
                {!data.milestones.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No milestones to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish timeline changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save timeline"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimelineEditor;
