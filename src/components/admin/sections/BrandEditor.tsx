import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type BrandItem = {
  slug: string;
  name: string;
  logo: string;
  relationship: string;
  category: string;
  image: string;
};

export type BrandsData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  brands: BrandItem[];
};

interface BrandEditorProps {
  data: BrandsData;
  onChange: (data: BrandsData) => void;
  onAddBrand: () => void;
  onRemoveBrand: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const BrandEditor = ({
  data,
  onChange,
  onAddBrand,
  onRemoveBrand,
  onSave,
  onRestore,
  saving,
  loading,
}: BrandEditorProps) => {
  const updateField = (key: keyof BrandsData, value: any) => onChange({ ...data, [key]: value });

  const updateBrand = (idx: number, key: keyof BrandItem, value: string) => {
    const next = [...data.brands];
    next[idx] = { ...next[idx], [key]: value };
    updateField("brands", next);
  };

  return (
    <div id="brands" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Brand Highlights Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the “Brands logo / Trustworthy Leaders” section content.
        </p>
      </div>
      <Tabs defaultValue="brands-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="brands-content">Content</TabsTrigger>
          <TabsTrigger value="brands-list">Brands</TabsTrigger>
          <TabsTrigger value="brands-preview">Preview</TabsTrigger>
          <TabsTrigger value="brands-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="brands-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, and description for the brand highlights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input
                  value={data.eyebrow}
                  onChange={(e) => updateField("eyebrow", e.target.value)}
                  placeholder="Trustworthy Leaders"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Brands that trust ICE Exhibitions"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Logos and stories from partners..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA label</label>
                  <Input
                    value={data.ctaLabel || ""}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="View all partner brands"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA href</label>
                  <Input
                    value={data.ctaHref || ""}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/brands"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Brands</CardTitle>
                <CardDescription>Cards shown in the brand highlights section.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.brands.map((brand, idx) => (
                <div key={idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={brand.name}
                      onChange={(e) => updateBrand(idx, "name", e.target.value)}
                      placeholder="Brand name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
                    <Input
                      value={brand.slug}
                      onChange={(e) => updateBrand(idx, "slug", e.target.value)}
                      placeholder="brand-slug"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Logo</label>
                    <Input
                      value={brand.logo}
                      onChange={(e) => updateBrand(idx, "logo", e.target.value)}
                      placeholder="TV"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Relationship</label>
                    <Input
                      value={brand.relationship}
                      onChange={(e) => updateBrand(idx, "relationship", e.target.value)}
                      placeholder="3-Year Partner"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                    <Input
                      value={brand.category}
                      onChange={(e) => updateBrand(idx, "category", e.target.value)}
                      placeholder="Technology"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={brand.image}
                      onChange={(e) => updateBrand(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveBrand(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.brands.length && <p className="text-sm text-muted-foreground">No brands yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAddBrand}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add brand
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the brand highlights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.brands.map((brand) => (
                  <div key={brand.slug || brand.name} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
                    <img src={brand.image} alt={brand.name} className="w-full h-24 object-cover rounded-lg" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{brand.name}</div>
                        <div className="text-xs text-muted-foreground">{brand.relationship}</div>
                      </div>
                      <Badge variant="secondary">{brand.category}</Badge>
                    </div>
                  </div>
                ))}
                {!data.brands.length && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No brands to preview.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for brand highlights.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save brands"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandEditor;
