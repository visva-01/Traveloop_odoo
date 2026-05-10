import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Plane, MapPin, Sparkles } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth";
import { listAllTrips, listUsers, type Trip, type User } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Traveloop" }] }),
  component: () => <RequireAuth><Admin /></RequireAuth>,
});

function Admin() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (user && !user.isAdmin) nav({ to: "/dashboard" });
    Promise.all([listUsers(), listAllTrips()]).then(([u, t]) => { setUsers(u); setTrips(t); });
  }, [user, nav]);

  if (!user?.isAdmin) return null;

  const cityCount: Record<string, number> = {};
  const actCount: Record<string, number> = {};
  trips.forEach((t) => t.stops.forEach((s) => {
    cityCount[s.city] = (cityCount[s.city] ?? 0) + 1;
    s.activities.forEach((a) => { actCount[a.name] = (actCount[a.name] ?? 0) + 1; });
  }));
  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topAct = Object.entries(actCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin analytics</h1>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat icon={Users} label="Users" v={users.length} />
        <Stat icon={Plane} label="Trips" v={trips.length} />
        <Stat icon={MapPin} label="Total stops" v={trips.reduce((n, t) => n + t.stops.length, 0)} />
        <Stat icon={Sparkles} label="Activities" v={trips.reduce((n, t) => n + t.stops.reduce((m, s) => m + s.activities.length, 0), 0)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Bars title="Top cities" rows={topCities} />
        <Bars title="Top activities" rows={topAct} />
      </div>

      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <h2 className="font-semibold mb-3">Users</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground text-left"><tr><th className="py-2">Name</th><th>Email</th><th>Joined</th><th>Trips</th><th>Role</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>{trips.filter((t) => t.ownerId === u.id).length}</td>
                <td>{u.isAdmin ? <span className="text-primary font-medium">Admin</span> : "User"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, v }: { icon: typeof Users; label: string; v: number }) {
  return (
    <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-hero grid place-items-center text-primary-foreground"><Icon className="h-5 w-5" /></div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{v}</div></div>
    </div>
  );
}

function Bars({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
      <h2 className="font-semibold mb-3">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : (
        <ul className="space-y-2">
          {rows.map(([k, n]) => (
            <li key={k}>
              <div className="flex justify-between text-sm"><span>{k}</span><span className="text-muted-foreground">{n}</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-hero" style={{ width: `${(n / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
