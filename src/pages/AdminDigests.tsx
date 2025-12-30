import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type DigestConfig = {
  _id?: string;
  name: string;
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "annual";
  timeOfDay: string;
  timezone: string;
  recipients: string[];
  formSlugs?: string[];
  includeMetrics: { leads: boolean; comments: boolean; likes: boolean; users: boolean };
  includeStatusBreakdown?: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
};

const emptyConfig: DigestConfig = {
  name: "",
  enabled: true,
  frequency: "daily",
  timeOfDay: "09:00",
  timezone: "UTC",
  recipients: [],
  formSlugs: [],
  includeMetrics: { leads: true, comments: true, likes: true, users: true },
  includeStatusBreakdown: false,
};

const frequencies: DigestConfig["frequency"][] = ["daily", "weekly", "monthly", "quarterly", "semiannual", "annual"];

type FormDef = { slug: string; title: string };
type DigestLog = {
  id: string;
  name: string;
  status: "success" | "failed";
  rangeFrom?: string;
  rangeTo?: string;
  createdAt?: string;
  recipients?: string[];
  metrics?: any;
  error?: string;
};

type LoggingSettings = {
  retentionDays: number;
  graceDays?: number;
};

const AdminDigests = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [configs, setConfigs] = useState<DigestConfig[]>([]);
  const [active, setActive] = useState<DigestConfig>(emptyConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [enqueuing, setEnqueuing] = useState(false);
  const [forms, setForms] = useState<FormDef[]>([]);
  const [logs, setLogs] = useState<DigestLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSettings, setLogSettings] = useState<LoggingSettings>({ retentionDays: 30, graceDays: 15 });
  const [activitySettings, setActivitySettings] = useState<{ retentionDays: number }>({ retentionDays: 30 });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) return null;
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      return null;
    }
    const tokenData = await res.json();
    if (tokenData.accessToken) {
      localStorage.setItem("admin_access_token", tokenData.accessToken);
      return tokenData.accessToken as string;
    }
    return null;
  };

  const getAccessToken = async () => {
    const token = localStorage.getItem("admin_access_token");
    if (token) return token;
    return refreshAccessToken();
  };

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/admin/digests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load digests");
      const payload = await res.json();
      const data: DigestConfig[] = payload?.data || [];
      setConfigs(data);
      if (!active._id && data.length) {
        setActive(data[0]);
      }
    } catch (err) {
      console.error(err);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async () => {
    try {
      const res = await fetch(`${base}/forms`);
      if (!res.ok) return;
      const defs = await res.json();
      setForms(defs.map((d: any) => ({ slug: d.slug, title: d.title || d.slug })));
    } catch {
      setForms([]);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/admin/digests/logs?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load logs");
      const payload = await res.json();
      setLogs(payload?.data || []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadLoggingSettings = async () => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/admin/settings/logging`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLogSettings(data);
      }
      const resAct = await fetch(`${base}/admin/settings/activity-logging`, { headers: { Authorization: `Bearer ${token}` } });
      if (resAct.ok) {
        const data = await resAct.json();
        setActivitySettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConfigs();
    loadForms();
    loadLogs();
    loadLoggingSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async () => {
    if (!active.name) {
      alert("Name is required");
      return;
    }
    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const isNew = !active._id;
      const url = isNew ? `${base}/admin/digests` : `${base}/admin/digests/${active._id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...active,
          recipients: active.recipients.filter(Boolean),
          formSlugs: active.formSlugs?.filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      await loadConfigs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async () => {
    if (!active._id) return;
    setSending(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${base}/admin/digests/${active._id}/send-now`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Send failed");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const disableConfig = async () => {
    if (!active._id) return;
    if (!confirm("Disable this digest config?")) return;
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await fetch(`${base}/admin/digests/${active._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setActive(emptyConfig);
      await loadConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const runDue = async () => {
    setEnqueuing(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await fetch(`${base}/admin/digests/run-due`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEnqueuing(false);
    }
  };

  const quickRun = async () => {
    if (!active._id) return;
    setEnqueuing(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await fetch(`${base}/admin/digests/run-due`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEnqueuing(false);
    }
  };

  const setRecipients = (value: string) =>
    setActive((prev) => ({ ...prev, recipients: value.split(",").map((s) => s.trim()).filter(Boolean) }));

  const setFormSlugs = (value: string) =>
    setActive((prev) => ({ ...prev, formSlugs: value.split(",").map((s) => s.trim()).filter(Boolean) }));

  const selectedLabel = useMemo(() => {
    if (!active._id) return "New digest";
    return active.name || "Digest";
  }, [active]);

  const toggleFormSlug = (slug: string) => {
    setActive((prev) => {
      const current = new Set(prev.formSlugs || []);
      if (current.has(slug)) {
        current.delete(slug);
      } else {
        current.add(slug);
      }
      return { ...prev, formSlugs: Array.from(current) };
    });
  };

  return (
    <AdminLayout
      title="Digests"
      description="Configure scheduled lead/engagement summaries and recipients."
      navItems={adminNavLinks}
      sections={[
        { id: "configs", label: "Configs" },
        { id: "editor", label: "Editor" },
        { id: "logs", label: "Digest Logs" },
        { id: "logging-settings", label: "Logging Settings" },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card/70 border-border/60" id="configs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configs</CardTitle>
              <CardDescription>Manage digest schedules</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setActive(emptyConfig)}>
              New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading digests...
              </div>
            ) : configs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No digests yet.</p>
            ) : (
              <div className="space-y-2">
                {configs.map((cfg) => (
                  <button
                    key={cfg._id}
                    onClick={() => setActive(cfg)}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${
                      active._id === cfg._id ? "border-primary bg-primary/10" : "border-border hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cfg.name}</span>
                      {!cfg.enabled && <Badge variant="secondary">Disabled</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cfg.frequency} · {cfg.timeOfDay} {cfg.timezone}
                    </p>
                    {cfg.lastRunAt && (
                      <p className="text-[11px] text-muted-foreground">
                        Last run: {new Date(cfg.lastRunAt).toLocaleString()}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
            <Button variant="secondary" className="w-full" onClick={runDue} disabled={enqueuing}>
              {enqueuing && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Run due digests
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/70 border-border/60" id="editor">
          <CardHeader className="space-y-2">
            <CardTitle>{selectedLabel}</CardTitle>
            <CardDescription>Configure schedule, recipients, and metric mix.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={active.name} onChange={(e) => setActive({ ...active, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  placeholder="e.g., Asia/Kolkata"
                  value={active.timezone}
                  onChange={(e) => setActive({ ...active, timezone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={active.frequency}
                  onValueChange={(v: DigestConfig["frequency"]) => setActive({ ...active, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time of day (HH:MM)</Label>
                <Input
                  value={active.timeOfDay}
                  onChange={(e) => setActive({ ...active, timeOfDay: e.target.value })}
                  placeholder="09:00"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch
                  checked={active.enabled}
                  onCheckedChange={(v) => setActive({ ...active, enabled: v })}
                />
                <Label className="text-sm">Enabled</Label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipients (comma separated)</Label>
                <Textarea
                  rows={2}
                  placeholder="ops@example.com, team@example.com"
                  value={active.recipients.join(", ")}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Form slugs to include</Label>
                <Select
                  value={(active.formSlugs || [])[0] || "all"}
                  onValueChange={(v) => {
                    if (v === "all") {
                      setActive((prev) => ({ ...prev, formSlugs: [] }));
                    } else {
                      setActive((prev) => ({ ...prev, formSlugs: [v] }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All forms</SelectItem>
                    {forms.map((form) => (
                      <SelectItem key={form.slug} value={form.slug}>
                        {form.title || form.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {active.formSlugs && active.formSlugs.length > 1 && (
                  <p className="text-xs text-muted-foreground">Multiple selections not supported yet; using first value.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Metrics to include</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {(["leads", "comments", "likes", "users"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      checked={active.includeMetrics[key]}
                      onCheckedChange={(v) =>
                        setActive((prev) => ({ ...prev, includeMetrics: { ...prev.includeMetrics, [key]: v } }))
                      }
                    />
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={saveConfig} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save
              </Button>
              <Button variant="secondary" onClick={quickRun} disabled={enqueuing}>
                {enqueuing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Run digest
              </Button>
              <Button variant="secondary" onClick={sendNow} disabled={sending || !active._id}>
                {sending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Mail className="w-4 h-4 mr-2" />
                Send now
              </Button>
              {active._id && (
                <Button variant="outline" onClick={disableConfig}>
                  <Trash className="w-4 h-4 mr-2" />
                  Disable
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Send now triggers an immediate digest using the configured frequency window.</p>
              <p>“Run due digests” enqueues any configs past their next run time (use via cron).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card/70 border-border/60" id="logs">
          <CardHeader className="space-y-2">
            <CardTitle>Digest Logs</CardTitle>
            <CardDescription>Recent digest executions (latest 20).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No logs yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left py-2 pr-3">Name</th>
                      <th className="text-left py-2 pr-3">Status</th>
                      <th className="text-left py-2 pr-3">Range</th>
                      <th className="text-left py-2 pr-3">Sent</th>
                      <th className="text-left py-2 pr-3">Recipients</th>
                      <th className="text-left py-2 pr-3">Leads</th>
                      <th className="text-left py-2 pr-3">Comments</th>
                      <th className="text-left py-2 pr-3">Likes</th>
                      <th className="text-left py-2 pr-3">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 pr-3">{log.name}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={log.status === "success" ? "secondary" : "destructive"}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="text-xs">
                            {log.rangeFrom ? new Date(log.rangeFrom).toLocaleString() : "-"}
                          </div>
                          <div className="text-xs">
                            {log.rangeTo ? new Date(log.rangeTo).toLocaleString() : "-"}
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {log.recipients?.length ? log.recipients.join(", ") : "-"}
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {log.metrics?.leads?.total ?? 0}
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {log.metrics?.comments?.total ?? 0}
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {log.metrics?.likes?.total ?? 0}
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {log.metrics?.users?.total ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card/70 border-border/60" id="logging-settings">
          <CardHeader className="space-y-2">
            <CardTitle>Logging Settings</CardTitle>
            <CardDescription>Retention for digest logs and activity events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Digest log retention (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={logSettings.retentionDays}
                  onChange={(e) => setLogSettings((prev) => ({ ...prev, retentionDays: Number(e.target.value) }))}
                />
                <Label>Grace days</Label>
                <Input
                  type="number"
                  min={0}
                  max={180}
                  value={logSettings.graceDays ?? 15}
                  onChange={(e) => setLogSettings((prev) => ({ ...prev, graceDays: Number(e.target.value) }))}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      setSettingsSaving(true);
                      try {
                        const token = await getAccessToken();
                        if (!token) throw new Error("Not authenticated");
                        await fetch(`${base}/admin/settings/logging`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify(logSettings),
                        });
                        await fetch(`${base}/admin/digests/logs/prune-now`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        await loadLogs();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSettingsSaving(false);
                      }
                    }}
                    disabled={settingsSaving}
                  >
                    {settingsSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save & prune
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity retention (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={activitySettings.retentionDays}
                  onChange={(e) => setActivitySettings({ retentionDays: Number(e.target.value) })}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      setSettingsSaving(true);
                      try {
                        const token = await getAccessToken();
                        if (!token) throw new Error("Not authenticated");
                        await fetch(`${base}/admin/settings/activity-logging`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify(activitySettings),
                        });
                        await fetch(`${base}/admin/activity/prune-now`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSettingsSaving(false);
                      }
                    }}
                    disabled={settingsSaving}
                  >
                    {settingsSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save & prune
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDigests;
