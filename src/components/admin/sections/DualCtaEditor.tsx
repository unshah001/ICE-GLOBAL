import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";

export type CtaCard = {
  eyebrow?: string;
  title: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export type DualCtaData = {
  sellers: CtaCard;
  buyers: CtaCard;
};

interface DualCtaEditorProps {
  data: DualCtaData;
  onChange: (data: DualCtaData) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const DualCtaEditor = ({ data, onChange, onSave, onRestore, saving, loading }: DualCtaEditorProps) => {
  const updateCard = (key: "sellers" | "buyers", field: keyof CtaCard, value: any) => {
    onChange({
      ...data,
      [key]: { ...data[key], [field]: value },
    });
  };

  const updateLink = (key: "sellers" | "buyers", linkKey: "primary" | "secondary", field: "label" | "href", value: string) => {
    const card = data[key];
    const target = card[linkKey] || { label: "", href: "" };
    onChange({
      ...data,
      [key]: { ...card, [linkKey]: { ...target, [field]: value } },
    });
  };

  return (
    <div id="dual-cta" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Dual CTA Editor</h2>
        <p className="text-muted-foreground text-sm">Manage the sellers & buyers dual CTA section.</p>
      </div>
      <Tabs defaultValue="dualcta-sellers" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="dualcta-sellers">Sellers CTA</TabsTrigger>
          <TabsTrigger value="dualcta-buyers">Buyers CTA</TabsTrigger>
          <TabsTrigger value="dualcta-preview">Preview</TabsTrigger>
          <TabsTrigger value="dualcta-actions">Actions</TabsTrigger>
        </TabsList>

        {(["sellers", "buyers"] as const).map((key) => (
          <TabsContent key={key} value={`dualcta-${key}`} className="mt-4">
            <Card className="bg-card/80 border-border/70">
              <CardHeader>
                <CardTitle>{key === "sellers" ? "Sellers CTA" : "Buyers CTA"}</CardTitle>
                <CardDescription>Eyebrow, title, description, and links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                  <Input
                    value={data[key].eyebrow || ""}
                    onChange={(e) => updateCard(key, "eyebrow", e.target.value)}
                    placeholder="CTA • Sellers"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                  <Input
                    value={data[key].title}
                    onChange={(e) => updateCard(key, "title", e.target.value)}
                    placeholder={key === "sellers" ? "Showcase your brand at ICE Exhibitions" : "Be first to the next ICE edition"}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Input
                    value={data[key].description || ""}
                    onChange={(e) => updateCard(key, "description", e.target.value)}
                    placeholder="Short supporting copy"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary label</label>
                    <Input
                      value={data[key].primary.label}
                      onChange={(e) => updateLink(key, "primary", "label", e.target.value)}
                      placeholder="Plan my showcase"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary href</label>
                    <Input
                      value={data[key].primary.href}
                      onChange={(e) => updateLink(key, "primary", "href", e.target.value)}
                      placeholder="/partner"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Secondary label</label>
                    <Input
                      value={data[key].secondary?.label || ""}
                      onChange={(e) => updateLink(key, "secondary", "label", e.target.value)}
                      placeholder="Talk to production"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Secondary href</label>
                    <Input
                      value={data[key].secondary?.href || ""}
                      onChange={(e) => updateLink(key, "secondary", "href", e.target.value)}
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="dualcta-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the dual CTA cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                {(["sellers", "buyers"] as const).map((key) => (
                  <div key={key} className="rounded-xl border border-border/60 bg-card/80 p-4 space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {data[key].eyebrow}
                    </div>
                    <div className="font-semibold text-lg">{data[key].title}</div>
                    <div className="text-sm text-muted-foreground">{data[key].description}</div>
                    <div className="text-xs text-primary">
                      {data[key].primary.label} → {data[key].primary.href}
                    </div>
                    {data[key].secondary && (
                      <div className="text-xs text-primary">
                        {data[key].secondary?.label} → {data[key].secondary?.href}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dualcta-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish dual CTA changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save dual CTAs"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DualCtaEditor;
