import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { navItems } from "@/data/expo-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { Mail, ShieldCheck } from "lucide-react";

type Profile = {
  email: string;
  name: string;
  company: string;
  address: string;
  bio: string;
  notes?: string;
  extras?: Record<string, string>;
};

type ProfileConfig = {
  labels: { name: string; company: string; address: string; bio: string; notes: string };
  header?: { title: string; description: string };
  extraFields: { key: string; label: string; placeholder?: string }[];
};

const Me = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authSending, setAuthSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem("user_access_token");
    if (!t) {
      setLoading(false);
      return;
    }
    setToken(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`${base}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        setProfile(data);
      } catch {
        toast({ title: "Unable to load profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(`${base}/profile/config`);
        if (!res.ok) throw new Error("Config fetch failed");
        const data = await res.json();
        setConfig(data);
      } catch {
        setConfig(null);
      }
    };
    loadConfig();
  }, [base]);

  const save = async () => {
    if (!token || !profile) return;
    setSaving(true);
    try {
      const res = await fetch(`${base}/user/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Profile saved" });
      setEditing(false);
    } catch {
      toast({ title: "Unable to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const requestOtp = async () => {
    if (cooldown > 0) return;
    setAuthSending(true);
    try {
      const res = await fetch(`${base}/user-auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      if (!res.ok) throw new Error("Failed to send code");
      toast({ title: "Check your email for the code" });
      setAuthStep("code");
      setCooldown(90);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast({ title: "Unable to send code", variant: "destructive" });
    } finally {
      setAuthSending(false);
    }
  };

  const verifyOtp = async () => {
    setAuthSending(true);
    try {
      const res = await fetch(`${base}/user-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, otp: authCode }),
      });
      if (!res.ok) throw new Error("Invalid code");
      const data = await res.json();
      setToken(data.accessToken);
      localStorage.setItem("user_access_token", data.accessToken);
      localStorage.setItem("user_email", data.user?.email || authEmail);
      window.dispatchEvent(new Event("auth-change"));
      setAuthStep("email");
      setAuthCode("");
      toast({ title: "Logged in" });
      setLoading(true);
      // trigger profile reload
      const profileRes = await fetch(`${base}/user/me`, { headers: { Authorization: `Bearer ${data.accessToken}` } });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch {
      toast({ title: "Unable to verify code", variant: "destructive" });
    } finally {
      setAuthSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />
      <section className="container-custom pt-28 pb-16 max-w-4xl">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{config?.header?.title || "Your profile"}</CardTitle>
              <CardDescription>{config?.header?.description || "Update your details used for likes and comments."}</CardDescription>
            </div>
            {token && profile && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!token && (
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Secure email login</p>
                    <p className="text-sm text-muted-foreground">Get a one-time code in your inbox to continue.</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                    />
                    <Button className="w-full" onClick={requestOtp} disabled={authSending || !authEmail || cooldown > 0}>
                      {authSending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
                    <label className="text-sm font-medium">6-digit code</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1" onClick={() => setAuthStep("email")} disabled={authSending}>
                        Back
                      </Button>
                      <Button className="flex-1" onClick={verifyOtp} disabled={authSending || authCode.length !== 6 || authStep !== "code"}>
                        {authSending ? "Verifying..." : "Verify & login"}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  We never share your email. Codes expire in 10 minutes.
                </p>
              </div>
            )}
            {token && !profile && loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {token && profile && (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{config?.labels.name || "Name"}</label>
                    {editing ? (
                      <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    ) : (
                      <p className="font-medium">{profile.name || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{config?.labels.company || "Company"}</label>
                    {editing ? (
                      <Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                    ) : (
                      <p className="font-medium">{profile.company || "—"}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground">{config?.labels.address || "Professional address"}</label>
                    {editing ? (
                      <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                    ) : (
                      <p className="font-medium">{profile.address || "—"}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{config?.labels.bio || "Bio"}</label>
                  {editing ? (
                    <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
                  ) : (
                    <p className="font-medium text-muted-foreground">{profile.bio || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{config?.labels.notes || "Notes"}</label>
                  {editing ? (
                    <Textarea
                      value={profile.notes || ""}
                      onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="font-medium text-muted-foreground whitespace-pre-wrap">{profile.notes || "—"}</p>
                  )}
                </div>
                {config?.extraFields?.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Additional info</p>
                    {config.extraFields.map((field) => (
                      <div key={field.key}>
                        <label className="text-xs text-muted-foreground">{field.label}</label>
                        {editing ? (
                          <Input
                            value={profile.extras?.[field.key] || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                extras: { ...(profile.extras || {}), [field.key]: e.target.value },
                              })
                            }
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <p className="font-medium">{profile.extras?.[field.key] || "—"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                {editing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                      Cancel
                    </Button>
                    <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                  </div>
                )}
                {!editing && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        localStorage.removeItem("user_access_token");
                        localStorage.removeItem("user_email");
                        setToken(null);
                        setProfile(null);
                        window.dispatchEvent(new Event("auth-change"));
                        navigate("/gallery");
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>
      <Footer />
    </main>
  );
};

export default Me;
