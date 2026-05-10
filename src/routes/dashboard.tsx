import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Plane, Sparkles, Wallet, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/use-store";
import { CITIES, computeBudget, daysBetween, fmtDate, fmtMoney, listTrips, type Trip } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Traveloop" }] }),
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
});

function Dashboard() {
  const { user } = useAuth();
  const trips = useLive<Trip[]>(() => listTrips(), []);
  const upcoming = [...trips].sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)).slice(0, 3);
  const totalSpend = trips.reduce((n, t) => n + computeBudget(t).total, 0);
  const totalDays = trips.reduce((n, t) => n + daysBetween(t.startDate, t.endDate), 0);
  const recommended = CITIES.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      <div className="rounded-3xl bg-gradient-hero p-8 sm:p-10 text-primary-foreground shadow-glow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="opacity-90 text-sm">Welcome back,</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">{user?.name}</h1>
          <p className="mt-2 opacity-90 max-w-md">Where to next? Pick up where you left off or start a new adventure.</p>
        </div>
        <Button asChild size="lg" variant="secondary" className="shrink-0">
          <Link to="/trips/new"><Plus /> Plan new trip</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={Plane} label="Trips planned" value={trips.length.toString()} />
        <Stat icon={Calendar} label="Total travel days" value={totalDays.toString()} />
        <Stat icon={Wallet} label="Estimated spend" value={fmtMoney(totalSpend)} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming trips</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/trips">View all <ArrowRight /></Link></Button>
        </div>
        {upcoming.length === 0 ? (
          <EmptyTrips />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Recommended destinations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((c) => (
            <Link to="/explore/cities" key={c.name} className="rounded-2xl border bg-gradient-card p-5 shadow-soft hover:shadow-elegant transition group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg group-hover:text-primary transition">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.country} • {c.region}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{"$".repeat(c.costIndex)}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.highlights.join(" • ")}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Plane; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-hero grid place-items-center text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyTrips() {
  return (
    <div className="rounded-2xl border-2 border-dashed p-10 text-center">
      <Plane className="h-10 w-10 mx-auto text-muted-foreground" />
      <p className="mt-3 font-semibold">No trips yet</p>
      <p className="text-sm text-muted-foreground">Start with your first multi-city itinerary.</p>
      <Button asChild className="mt-4"><Link to="/trips/new"><Plus /> Plan a trip</Link></Button>
    </div>
  );
}

export function TripCard({ trip }: { trip: Trip }) {
  const days = daysBetween(trip.startDate, trip.endDate);
  return (
    <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="block rounded-2xl border bg-gradient-card overflow-hidden shadow-soft hover:shadow-elegant transition group">
      <div className="h-32 bg-gradient-sunset relative">
        {trip.cover && <img src={trip.cover} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4 text-primary-foreground">
          <div className="text-lg font-bold drop-shadow">{trip.name}</div>
          <div className="text-xs opacity-90">{trip.stops.length} stops • {days} days</div>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}</span>
        <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {trip.stops[0]?.city ?? "—"}</span>
      </div>
    </Link>
  );
}
