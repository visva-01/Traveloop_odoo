import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Calendar, MapPin, Eye, Pencil, Wallet, ListChecks, StickyNote, Share2 } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { fmtDate, getTrip, type Trip } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trips/$tripId")({
  head: () => ({ meta: [{ title: "Trip — Traveloop" }] }),
  component: () => <RequireAuth><TripLayout /></RequireAuth>,
});

const tabs = [
  { to: "", label: "Itinerary", icon: Eye },
  { to: "build", label: "Builder", icon: Pencil },
  { to: "budget", label: "Budget", icon: Wallet },
  { to: "packing", label: "Packing", icon: ListChecks },
  { to: "notes", label: "Notes", icon: StickyNote },
  { to: "share", label: "Share", icon: Share2 },
] as const;

function TripLayout() {
  const { tripId } = Route.useParams();
  const [trip, loading] = useLive<Trip | null>(() => getTrip(tripId), null);
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (loading && !trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <p className="text-sm text-muted-foreground mt-2">The trip you are looking for doesn't exist.</p>
      </div>
    );
  }

  const base = `/trips/${trip.id}`;

  return (
    <div>
      <div className="relative">
        <div className="h-44 sm:h-56 bg-gradient-sunset relative overflow-hidden">
          {trip.cover && <img src={trip.cover} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-16 relative">
          <div className="rounded-2xl border bg-card p-6 shadow-elegant">
            <h1 className="text-2xl sm:text-3xl font-bold">{trip.name}</h1>
            {trip.description && <p className="text-muted-foreground mt-1 text-sm">{trip.description}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.stops.length} stops</span>
              {trip.isPublic && <span className="text-primary font-medium">Public</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-6">
        <div className="flex gap-1 overflow-x-auto pb-1 border-b">
          {tabs.map((t) => {
            const target = t.to ? `${base}/${t.to}` : base;
            const active = t.to ? path.startsWith(target) : path === base;
            return (
              <Button key={t.to} asChild variant="ghost" size="sm" className={`shrink-0 ${active ? "text-primary border-b-2 border-primary rounded-b-none" : ""}`}>
                <Link to={target}><t.icon className="h-4 w-4" /> {t.label}</Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
}
