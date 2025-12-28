import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type SellerItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  outcome: string;
  image: string;
  href?: string;
};

export type SellersData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  sellers: SellerItem[];
};

interface SellerEditorProps {
  data: SellersData;
  onChange: (data: SellersData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const SellerEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: SellerEditorProps) => {
  const updateField = (key: keyof SellersData, value: any) => onChange({ ...data, [key]: value });

  const updateSeller = (idx: number, key: keyof SellerItem, value: string) => {
    const next = [...data.sellers];
    next[idx] = { ...next[idx], [key]: value };
    updateField("sellers", next);
  };

  return (
    <div id="sellers" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Seller Signals Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the “Testimony of sellers” section content.</p>
      </div>
      <Tabs defaultValue="sellers-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="sellers-content">Content</TabsTrigger>
          <TabsTrigger value="sellers-list">Sellers</TabsTrigger>
          <TabsTrigger value="sellers-preview">Preview</TabsTrigger>
          <TabsTrigger value="sellers-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, and description for the sellers section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Seller testimonials"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Seller Signals"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Outcomes and wins from sellers."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Label</label>
                  <Input
                    value={data.ctaLabel}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="Sell with us"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                  <Input
                    value={data.ctaHref}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/partner"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sellers</CardTitle>
                <CardDescription>Testimonials displayed in the seller signals section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.sellers.map((seller, idx) => (
                <div key={seller.id || idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={seller.name}
                      onChange={(e) => updateSeller(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <Input
                      value={seller.role}
                      onChange={(e) => updateSeller(idx, "role", e.target.value)}
                      placeholder="Founder"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                    <Input
                      value={seller.company}
                      onChange={(e) => updateSeller(idx, "company", e.target.value)}
                      placeholder="Brand Co."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Quote</label>
                    <Input
                      value={seller.quote}
                      onChange={(e) => updateSeller(idx, "quote", e.target.value)}
                      placeholder="Their experience..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Outcome</label>
                    <Input
                      value={seller.outcome}
                      onChange={(e) => updateSeller(idx, "outcome", e.target.value)}
                      placeholder="e.g., 4x leads"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={seller.image}
                      onChange={(e) => updateSeller(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CTA Href</label>
                    <Input
                      value={seller.href || ""}
                      onChange={(e) => updateSeller(idx, "href", e.target.value)}
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
              {!data.sellers.length && <p className="text-sm text-muted-foreground">No sellers yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add seller
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the seller signals.</CardDescription>
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
                {data.sellers.map((seller) => (
                  <div key={seller.id} className="rounded-xl border border-border/60 bg-card/80 overflow-hidden p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{seller.name}</span>
                      <Badge variant="secondary">{seller.company}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{seller.role}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{seller.quote}</div>
                    <div className="text-xs font-medium">{seller.outcome}</div>
                    {seller.href && <div className="text-[11px] text-primary">{seller.href}</div>}
                  </div>
                ))}
                {!data.sellers.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No sellers to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish seller updates.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save sellers"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerEditor;
