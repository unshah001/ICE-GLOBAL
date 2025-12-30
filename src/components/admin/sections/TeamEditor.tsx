import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department?: string;
  focus?: string;
  image: string;
  href?: string;
};

export type TeamData = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  team: TeamMember[];
};

interface TeamEditorProps {
  data: TeamData;
  onChange: (data: TeamData) => void;
  onAddMember: () => void;
  onRemoveMember: (idx: number) => void;
  onSave: () => void;
  onRestore: () => void;
  saving: boolean;
  loading: boolean;
}

const TeamEditor = ({
  data,
  onChange,
  onAddMember,
  onRemoveMember,
  onSave,
  onRestore,
  saving,
  loading,
}: TeamEditorProps) => {
  const updateField = (key: keyof TeamData, value: any) => onChange({ ...data, [key]: value });

  const updateMember = (idx: number, key: keyof TeamMember, value: string) => {
    const next = [...data.team];
    next[idx] = { ...next[idx], [key]: value };
    updateField("team", next);
  };

  return (
    <div id="team" className="pt-10 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold">Team Editor</h2>
        <p className="text-muted-foreground text-sm">
          Manage the home-page team spotlight (eyebrow, copy, CTA, and members list).
        </p>
      </div>
      <Tabs defaultValue="team-content" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="team-content">Content</TabsTrigger>
          <TabsTrigger value="team-list">Members</TabsTrigger>
          <TabsTrigger value="team-preview">Preview</TabsTrigger>
          <TabsTrigger value="team-actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="team-content" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Eyebrow, title, description, and CTA for the team block.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Eyebrow</label>
                <Input value={data.eyebrow} onChange={(e) => updateField("eyebrow", e.target.value)} placeholder="Team" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="The team behind ICE"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Producers, ops, media, design, and data..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA label</label>
                  <Input
                    value={data.ctaLabel || ""}
                    onChange={(e) => updateField("ctaLabel", e.target.value)}
                    placeholder="Meet the full team"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CTA href</label>
                  <Input
                    value={data.ctaHref || ""}
                    onChange={(e) => updateField("ctaHref", e.target.value)}
                    placeholder="/teams"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-list" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>People cards displayed on the home page.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.team.map((member, idx) => (
                <div key={member.id || idx} className="grid md:grid-cols-3 gap-3 items-end border border-border/60 rounded-xl p-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <Input value={member.name} onChange={(e) => updateMember(idx, "name", e.target.value)} placeholder="Name" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">ID</label>
                    <Input value={member.id} onChange={(e) => updateMember(idx, "id", e.target.value)} placeholder="team-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <Input value={member.role} onChange={(e) => updateMember(idx, "role", e.target.value)} placeholder="Role" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Department</label>
                    <Input
                      value={member.department || ""}
                      onChange={(e) => updateMember(idx, "department", e.target.value)}
                      placeholder="Operations"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Focus</label>
                    <Input
                      value={member.focus || ""}
                      onChange={(e) => updateMember(idx, "focus", e.target.value)}
                      placeholder="Large-format builds"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                    <Input
                      value={member.image}
                      onChange={(e) => updateMember(idx, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Profile href (optional)</label>
                    <Input
                      value={member.href || ""}
                      onChange={(e) => updateMember(idx, "href", e.target.value)}
                      placeholder="/teams/priya-menon"
                    />
                  </div>
                  <div className="flex justify-end md:col-span-3">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveMember(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data.team.length && <p className="text-sm text-muted-foreground">No members yet.</p>}
              <div className="flex justify-end">
                <Button variant="outline" onClick={onAddMember}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-preview" className="mt-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Static preview of the team spotlight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-semibold">{data.eyebrow}</div>
                <div className="text-xl font-display">{data.title}</div>
                <div className="text-muted-foreground">{data.description}</div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.team.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2 flex flex-col gap-2"
                  >
                    <img src={member.image} alt={member.name} className="w-full h-32 object-cover rounded-lg" />
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                      {member.focus && <div className="text-xs text-muted-foreground">{member.focus}</div>}
                    </div>
                    {member.department && <Badge variant="secondary">{member.department}</Badge>}
                  </div>
                ))}
                {!data.team.length && (
                  <p className="text-sm text-muted-foreground col-span-full">No members to preview.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-actions" className="mt-4">
          <Card className="bg-card/80 border-border/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Restore defaults or publish changes for the team section.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={onRestore} disabled={saving || loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore defaults
              </Button>
              <Button onClick={onSave} disabled={saving || loading}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save team"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamEditor;
