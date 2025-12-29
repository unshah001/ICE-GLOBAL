import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminNavLinks } from "@/data/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCcw } from "lucide-react";

type UserRow = {
  id?: string;
  email: string;
  name: string;
  company: string;
  address: string;
  bio: string;
  notes?: string;
  extras?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
};

const AdminUsers = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState<string | null>(null);

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

  const load = async (reset = false) => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      if (!reset && cursor) params.set("cursor", cursor);
      const res = await fetch(`${base}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setUsers(reset ? data.data || [] : [...users, ...(data.data || [])]);
      setNext(data.cursor?.next || null);
      setCursor(reset ? data.cursor?.next || null : data.cursor?.next || null);
    } catch (err) {
      console.error(err);
      setUsers(reset ? [] : users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setCursor(null);
    load(true);
  };

  return (
    <AdminLayout
      title="User profiles"
      description="Browse user profile submissions with search and date filters."
      navItems={adminNavLinks}
      sections={[{ id: "users", label: "Users" }]}
    >
      <Card id="users" className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
          <CardDescription>Search by email/name/company and filter by date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Input placeholder="Search email, name, company" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={applyFilters} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Apply
              </Button>
              <Button variant="ghost" onClick={() => { setSearch(""); setStart(""); setEnd(""); setCursor(null); load(true); }} disabled={loading}>
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id || u.email}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.name || "—"}</TableCell>
                    <TableCell>{u.company || "—"}</TableCell>
                    <TableCell>{u.address || "—"}</TableCell>
                    <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
                {!users.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => { setCursor(next); load(); }} disabled={loading || !next}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {next ? "Load more" : "No more"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
