import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  quote: string;
};

export type TestimonialsData = {
  hero: {
    badge: string;
    title: string;
    intro: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  testimonials: TestimonialItem[];
};

interface TestimonialsEditorProps {
  data: TestimonialsData;
  onChange: (data: TestimonialsData) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const TestimonialsEditor = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onRestore,
  saving,
  loading,
}: TestimonialsEditorProps) => {
  const updateHero = (key: keyof TestimonialsData["hero"], value: string) => {
    onChange({ ...data, hero: { ...data.hero, [key]: value } });
  };

  const updateItem = (idx: number, key: keyof TestimonialItem, value: string | number) => {
    const next = [...data.testimonials];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...data, testimonials: next });
  };

  return (
    <div id="testimonials" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Testimonials Editor</h2>
        <p className="text-muted-foreground text-sm">Curate the home-page testimonials block with title, intro, and cards.</p>
      </div>
      <Tabs defaultValue="testimonials-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="testimonials-content">Content</TabsTrigger>
          <TabsTrigger value="testimonials-list">Testimonials</TabsTrigger>
          <TabsTrigger value="testimonials-preview">Preview</TabsTrigger>
          <TabsTrigger value="testimonials-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Headline and CTA copy for the testimonials rail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Badge</label>
                <Input value={data.hero.badge} onChange={(e) => updateHero("badge", e.target.value)} placeholder="Testimonials" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.hero.title}
                  onChange={(e) => updateHero("title", e.target.value)}
                  placeholder="What our partners say"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Intro</label>
                <Textarea
                  value={data.hero.intro}
                  onChange={(e) => updateHero("intro", e.target.value)}
                  placeholder="Hear from brands, buyers, and founders who experienced ICE..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA label</label>
                  <Input
                    value={data.hero.ctaLabel || ""}
                    onChange={(e) => updateHero("ctaLabel", e.target.value)}
                    placeholder="Send feedback"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA href</label>
                  <Input value={data.hero.ctaHref || ""} onChange={(e) => updateHero("ctaHref", e.target.value)} placeholder="/feedback" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Cards shown in the home testimonials carousel.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.testimonials.map((item, idx) => (
                <div key={item.id || idx} className="grid md:grid-cols-3 gap-3 items-start border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Name" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <Input value={item.role} onChange={(e) => updateItem(idx, "role", e.target.value)} placeholder="Role" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                    <Input value={item.company} onChange={(e) => updateItem(idx, "company", e.target.value)} placeholder="Company" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input value={item.image} onChange={(e) => updateItem(idx, "image", e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Rating (1-5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={item.rating}
                      onChange={(e) => updateItem(idx, "rating", Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Quote</label>
                    <Textarea
                      value={item.quote}
                      onChange={(e) => updateItem(idx, "quote", e.target.value)}
                      placeholder="Short quote"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.testimonials.length && <p className="text-sm text-muted-foreground">No testimonials yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add testimonial
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the testimonials rail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.hero.badge}</div>
                <div className="text-xl font-display">{data.hero.title}</div>
                <div className="text-muted-foreground">{data.hero.intro}</div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.testimonials.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.role}, {item.company}
                    </div>
                    <div className="text-xs text-muted-foreground">Rating: {item.rating}/5</div>
                    <div className="text-sm text-muted-foreground line-clamp-3">{item.quote}</div>
                  </div>
                ))}
                {!data.testimonials.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No testimonials to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for the testimonials section.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save testimonials"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestimonialsEditor;
