import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: localStorage.getItem("admin_name") || "Admin User",
    email: localStorage.getItem("admin_email") || "admin@example.com",
  });
  const [password, setPassword] = useState({ current: "", next: "" });
  const [status, setStatus] = useState("");

  const saveProfile = () => {
    localStorage.setItem("admin_name", profile.name);
    localStorage.setItem("admin_email", profile.email);
    setStatus("Profile saved locally.");
    setTimeout(() => setStatus(""), 2000);
  };

  const savePassword = () => {
    setStatus("Password updated (local demo).");
    setPassword({ current: "", next: "" });
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <AdminLayout
      title="Admin Profile"
      description="Manage your admin identity and credentials."
      navItems={adminNavLinks}
      sections={[
        { id: "profile", label: "Profile" },
        { id: "security", label: "Security" },
      ]}
    >
      {status && <div className="text-sm text-primary">{status}</div>}

      <Card id="profile" className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Role: Admin</Badge>
            <Badge variant="outline">MFA recommended</Badge>
          </div>
          <Button onClick={saveProfile}>Save profile</Button>
        </CardContent>
      </Card>

      <Card id="security" className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Current password</label>
              <Input
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">New password</label>
              <Input
                type="password"
                value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })}
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Button onClick={savePassword}>Update password</Button>
            <p className="text-sm text-muted-foreground">For demo only; wire to auth service if available.</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProfile;
