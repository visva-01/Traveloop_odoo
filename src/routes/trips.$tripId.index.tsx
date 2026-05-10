import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { fmtDate, fmtMoney, getTrip, type Trip } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trips/$tripId/")({
  component: () => <RequireAuth><Itinerary /></RequireAuth>,
});

function Itinerary() {
  const { tripId } = Route.useParams();
  const [trip] = useLive<Trip | null>(() => getTrip(tripId), null);
  if (!trip) return null;

  if (trip.stops.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-12 text-center">
        <p className="font-semibold">No stops yet</p>
        <p className="text-sm text-muted-foreground mt-1">Add cities and activities in the builder.</p>
        <Button asChild className="mt-4"><Link to="/trips/$tripId/build" params={{ tripId: trip.id }}>Open builder</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {trip.stops.sort((a, b) => a.order - b.order).map((s, idx) => (
        <div key={s.id} className="relative">
          <div className="absolute -left-2 top-0 hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-gradient-hero text-primary-foreground font-bold text-sm shadow-glow">
            {idx + 1}
          </div>
          <div className="sm:pl-12 rounded-2xl border bg-gradient-card p-6 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />{s.city}, <span className="text-muted-foreground font-normal">{s.country}</span></h2>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmtDate(s.startDate)} → {fmtDate(s.endDate)}</span>
            </div>
            {s.activities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No activities scheduled for this stop.</p>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {s.activities.map((a) => (
                  <div key={a.id} className="rounded-xl border bg-card p-4 hover:shadow-soft transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-3">
                          <span className="px-1.5 py-0.5 rounded bg-muted">{a.category}</span>
                          {a.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.time}</span>}
                          <span>{a.durationHours}h</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-primary">{fmtMoney(a.cost)}</div>
                    </div>
                    {a.description && <p className="mt-2 text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
