import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type CountStat = { value: number; suffix?: string; label: string };

export type CountsData = {
  stats: CountStat[];
};

interface CountEditorProps {
  data: CountsData;
  onChange: (data: CountsData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const CountEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: CountEditorProps) => {
  const updateStat = (idx: number, key: keyof CountStat, value: string) => {
    const next = [...data.stats];
    next[idx] = { ...next[idx], [key]: key === "value" ? Number(value) : value };
    onChange({ stats: next });
  };

  return (
    <div id="counts" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Counting Section Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “20M+ buyers | 10,000+ brands | 10 cities | 30 years” stats strip.
        </p>
      </div>
      <Tabs defaultValue="counts-list" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-3">
          <TabsTrigger value="counts-list">Stats</TabsTrigger>
          <TabsTrigger value="counts-preview">Preview</TabsTrigger>
          <TabsTrigger value="counts-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="counts-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Numbers shown in the counting section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.stats.map((stat, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end">
                  <Input
                    type="number"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, "value", e.target.value)}
                    placeholder="20"
                  />
                  <Input
                    value={stat.suffix || ""}
                    onChange={(e) => updateStat(idx, "suffix", e.target.value)}
                    placeholder="M+"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(idx, "label", e.target.value)}
                    placeholder="buyers"
                  />
                  <div className="md:col-span-3 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.stats.length && <p className="text-sm text-muted-foreground">No stats yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add stat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counts-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the counting strip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.stats.map((stat, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/80 p-3 text-center">
                    <div className="text-xl font-display font-semibold">
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
                {!data.stats.length && (
                  <p className="text-sm text-muted-foreground col-span-full text-center">
                    No stats to preview.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counts-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish counts changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save counts"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CountEditor;
