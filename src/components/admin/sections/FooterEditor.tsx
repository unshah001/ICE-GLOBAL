import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type FooterLink = { name: string; href: string };
export type FooterContact = { location: string; email: string; phone: string };
export type FooterSocial = { label: string; href: string };

export type FooterData = {
  ctaTitle: string;
  ctaDescription: string;
  partnerHref: string;
  sponsorHref: string;
  copyright?: string;
  exploreLinks: FooterLink[];
  partnersLinks: FooterLink[];
  legalLinks: FooterLink[];
  contact: FooterContact;
  socials: FooterSocial[];
};

interface FooterEditorProps {
  data: FooterData;
  onChange: (data: FooterData) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const FooterEditor = ({ data, onChange, onSave, onRestore, saving, loading }: FooterEditorProps) => {
  const updateField = (key: keyof FooterData, value: any) => onChange({ ...data, [key]: value });

  const updateLinkList = (key: "exploreLinks" | "partnersLinks" | "legalLinks", idx: number, field: keyof FooterLink, value: string) => {
    const next = [...(data[key] || [])];
    next[idx] = { ...next[idx], [field]: value };
    updateField(key, next);
  };

  const addLink = (key: "exploreLinks" | "partnersLinks" | "legalLinks") =>
    updateField(key, [...(data[key] || []), { name: "", href: "" }]);
  const removeLink = (key: "exploreLinks" | "partnersLinks" | "legalLinks", idx: number) =>
    updateField(key, (data[key] || []).filter((_, i) => i !== idx));

  const updateSocial = (idx: number, field: keyof FooterSocial, value: string) => {
    const next = [...(data.socials || [])];
    next[idx] = { ...next[idx], [field]: value };
    updateField("socials", next);
  };
  const addSocial = () => updateField("socials", [...(data.socials || []), { label: "", href: "" }]);
  const removeSocial = (idx: number) => updateField("socials", (data.socials || []).filter((_, i) => i !== idx));

  return (
    <div id="footer" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Footer Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage footer CTA, contact info, links, and socials.
        </p>
      </div>
      <Tabs defaultValue="footer-cta" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="footer-cta">CTA</TabsTrigger>
          <TabsTrigger value="footer-links">Links</TabsTrigger>
          <TabsTrigger value="footer-contact">Contact</TabsTrigger>
          <TabsTrigger value="footer-meta">Meta</TabsTrigger>
          <TabsTrigger value="footer-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="footer-cta" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>CTA</CardTitle>
              <CardDescription>Headline, description, and primary CTAs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.ctaTitle}
                  onChange={(e) => updateField("ctaTitle", e.target.value)}
                  placeholder="Ready to create the next unforgettable expo moment?"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.ctaDescription}
                  onChange={(e) => updateField("ctaDescription", e.target.value)}
                  placeholder="Tap into ICE Exhibitions..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Partner CTA href</label>
                  <Input
                    value={data.partnerHref}
                    onChange={(e) => updateField("partnerHref", e.target.value)}
                    placeholder="/partner"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sponsor CTA href</label>
                  <Input
                    value={data.sponsorHref}
                    onChange={(e) => updateField("sponsorHref", e.target.value)}
                    placeholder="/sponsor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer-meta" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Meta</CardTitle>
              <CardDescription>Copyright/footer note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Copyright text</label>
                <Input
                  value={data.copyright || ""}
                  onChange={(e) => updateField("copyright", e.target.value)}
                  placeholder="© 2025 ICEGLOBAL. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer-links" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Explore, partners, and legal link columns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["exploreLinks", "partnersLinks", "legalLinks"] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{key.replace("Links", "")}</div>
                  {(data[key] || []).map((link, idx) => (
                    <div key={idx} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                      <Input
                        value={link.name}
                        onChange={(e) => updateLinkList(key, idx, "name", e.target.value)}
                        placeholder="Label"
                      />
                      <Input
                        value={link.href}
                        onChange={(e) => updateLinkList(key, idx, "href", e.target.value)}
                        placeholder="/path"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLink(key, idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!data[key] || !data[key].length) && (
                    <p className="text-xs text-muted-foreground">No links yet.</p>
                  )}
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => addLink(key)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add link
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer-contact" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Location, email, phone, and socials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <Input
                  value={data.contact.location}
                  onChange={(e) => updateField("contact", { ...data.contact, location: e.target.value })}
                  placeholder="Mumbai, India"
                />
                <Input
                  value={data.contact.email}
                  onChange={(e) => updateField("contact", { ...data.contact, email: e.target.value })}
                  placeholder="contact@iceexhibitions.com"
                />
                <Input
                  value={data.contact.phone}
                  onChange={(e) => updateField("contact", { ...data.contact, phone: e.target.value })}
                  placeholder="+91-123-456-7890"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Socials</div>
                {(data.socials || []).map((social, idx) => (
                  <div key={idx} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <Input
                      value={social.label}
                      onChange={(e) => updateSocial(idx, "label", e.target.value)}
                      placeholder="LinkedIn"
                    />
                    <Input
                      value={social.href}
                      onChange={(e) => updateSocial(idx, "href", e.target.value)}
                      placeholder="https://"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocial(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {!data.socials.length && (
                  <p className="text-xs text-muted-foreground">No socials yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish footer changes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save footer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FooterEditor;
