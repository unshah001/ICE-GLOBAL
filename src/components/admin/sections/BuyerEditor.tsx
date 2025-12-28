import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type BuyerItem = {
  id: string;
  name: string;
  city: string;
  segment: string;
  quote: string;
  spend: string;
  visits: string;
  image: string;
  href?: string;
};

export type BuyersData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  buyers: BuyerItem[];
};

interface BuyerEditorProps {
  data: BuyersData;
  onChange: (data: BuyersData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const BuyerEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: BuyerEditorProps) => {
  const updateField = (key: keyof BuyersData, value: any) => onChange({ ...data, [key]: value });

  const updateBuyer = (idx: number, key: keyof BuyerItem, value: string) => {
    const next = [...data.buyers];
    next[idx] = { ...next[idx], [key]: value };
    updateField("buyers", next);
  };

  return (
    <div id="buyers" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Buyer Voices Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “Testimony of buyers” section content.</p>
      </div>
      <Tabs defaultValue="buyers-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="buyers-content">Content</TabsTrigger>
          <TabsTrigger value="buyers-list">Buyers</TabsTrigger>
          <TabsTrigger value="buyers-preview">Preview</TabsTrigger>
          <TabsTrigger value="buyers-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="buyers-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the buyers section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Buyer Voices"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Why buyers return"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="City, segment, and spend proof."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="Explore buyers"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                  <Input
                    value={data.ctaHref}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/buyers"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Buyers</CardTitle>
                <CardDescription>Testimonials displayed in the buyer voices section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.buyers.map((buyer, idx) => (
                <div key={buyer.id || idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={buyer.name}
                      onChange={(e) => updateBuyer(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City</label>
                    <Input
                      value={buyer.city}
                      onChange={(e) => updateBuyer(idx, "city", e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Segment</label>
                    <Input
                      value={buyer.segment}
                      onChange={(e) => updateBuyer(idx, "segment", e.target.value)}
                      placeholder="Retailer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Quote</label>
                    <Input
                      value={buyer.quote}
                      onChange={(e) => updateBuyer(idx, "quote", e.target.value)}
                      placeholder="Their experience..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Spend</label>
                    <Input
                      value={buyer.spend}
                      onChange={(e) => updateBuyer(idx, "spend", e.target.value)}
                      placeholder="$25k"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Visits</label>
                    <Input
                      value={buyer.visits}
                      onChange={(e) => updateBuyer(idx, "visits", e.target.value)}
                      placeholder="6 visits"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={buyer.image}
                      onChange={(e) => updateBuyer(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={buyer.href || ""}
                      onChange={(e) => updateBuyer(idx, "href", e.target.value)}
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
              {!data.buyers.length && <p className="text-sm text-muted-foreground">No buyers yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add buyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the buyer voices.</CardDescription>
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
                {data.buyers.map((buyer) => (
                  <div key={buyer.id} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{buyer.name}</span>
                      <Badge variant="secondary">{buyer.segment}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{buyer.city}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{buyer.quote}</div>
                    <div className="text-xs font-medium">Spend: {buyer.spend} • Visits: {buyer.visits}</div>
                    {buyer.href && <div className="text-[11px] text-primary">{buyer.href}</div>}
                  </div>
                ))}
                {!data.buyers.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No buyers to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish buyer updates.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save buyers"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerEditor;
