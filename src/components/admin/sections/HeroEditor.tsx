import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type NavItem = { name: string; href: string };
export type HeroItem = { title: string; link: string; thumbnail: string };
export type HeroContent = { title: string; subtitle: string; description: string };

interface HeroEditorProps {
  navItems: NavItem[];
  heroItems: HeroItem[];
  heroContent: HeroContent;
  onNavChange: (idx: number, key: keyof NavItem, value: string) => void;
  onNavAdd: () => void;
  onNavRemove: (idx: number) => void;
  onHeroChange: (idx: number, key: keyof HeroItem, value: string) => void;
  onHeroAdd: () => void;
  onHeroRemove: (idx: number) => void;
  onHeroContentChange: (key: keyof HeroContent, value: string) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const HeroEditor = ({
  navItems,
  heroItems,
  heroContent,
  onNavChange,
  onNavAdd,
  onNavRemove,
  onHeroChange,
  onHeroAdd,
  onHeroRemove,
  onHeroContentChange,
  onSave,
  onRestore,
  saving,
  loading,
}: HeroEditorProps) => {
  return (
    <div id="hero" className="pt-6 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Hero Editor</h2>
        <p className="text-muted-foreground text-sm">
          Edit nav items and hero products for the home page hero section.
        </p>
      </div>
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-5">
          <TabsTrigger value="content">Hero content</TabsTrigger>
          <TabsTrigger value="nav">Nav items</TabsTrigger>
          <TabsTrigger value="products">Hero items</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Hero content</CardTitle>
              <CardDescription>Headline, subtitle, and description displayed above the hero parallax.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={heroContent.title}
                  onChange={(e) => onHeroContentChange("title", e.target.value)}
                  placeholder="Experience the Expo Legacy"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
                <Input
                  value={heroContent.subtitle}
                  onChange={(e) => onHeroContentChange("subtitle", e.target.value)}
                  placeholder="A decade of immersive expos..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={heroContent.description}
                  onChange={(e) => onHeroContentChange("description", e.target.value)}
                  placeholder="Where brands connect, innovate, and inspire..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nav" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Navigation</CardTitle>
                <CardDescription>Links displayed in the floating navbar.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {navItems.map((item, idx) => (
                <div key={idx} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                    <Input
                      value={item.name}
                      onChange={(e) => onNavChange(idx, "name", e.target.value)}
                      placeholder="Home"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Href</label>
                    <Input
                      value={item.href}
                      onChange={(e) => onNavChange(idx, "href", e.target.value)}
                      placeholder="/"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onNavRemove(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!navItems.length && <p className="text-sm text-muted-foreground">No nav items yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onNavAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add nav item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hero products</CardTitle>
                <CardDescription>Cards shown in the parallax hero.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroItems.map((item, idx) => (
                <div key={idx} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={item.title}
                      onChange={(e) => onHeroChange(idx, "title", e.target.value)}
                      placeholder="Main Stage"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Link</label>
                    <Input
                      value={item.link}
                      onChange={(e) => onHeroChange(idx, "link", e.target.value)}
                      placeholder="/gallery"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Thumbnail URL</label>
                    <Input
                      value={item.thumbnail}
                      onChange={(e) => onHeroChange(idx, "thumbnail", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onHeroRemove(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!heroItems.length && <p className="text-sm text-muted-foreground">No hero items yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onHeroAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add hero item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Hero preview</CardTitle>
              <CardDescription>Quick glance at how hero items will appear (static grid preview).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 overflow-hidden bg-card/80">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-36 object-cover border-b border-border/60"
                    />
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.link}</div>
                    </div>
                  </div>
                ))}
                {!heroItems.length && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No hero items to preview.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save hero"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroEditor;
