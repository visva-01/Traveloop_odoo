import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Copy, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeBudget, duplicateTrip, fmtDate, fmtMoney, getTripBySlug, type Trip } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/share/$slug")({
  head: () => ({ meta: [{ title: "Shared trip — Traveloop" }] }),
  component: SharedTrip,
});

function SharedTrip() {
  const { slug } = Route.useParams();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => { getTripBySlug(slug).then((t) => setTrip(t ?? null)); }, [slug]);

  if (trip === undefined) return <div className="p-12 text-sm text-muted-foreground">Loading…</div>;
  if (!trip) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Compass className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">This trip isn't available</h1>
        <p className="mt-1 text-sm text-muted-foreground">It may have been made private or deleted.</p>
        <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  const b = computeBudget(trip);

  const onCopy = async () => {
    if (!user) { nav({ to: "/signup" }); return; }
    const c = await duplicateTrip(trip.id);
    if (c) { toast.success("Trip copied to your account"); nav({ to: "/trips/$tripId", params: { tripId: c.id } }); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      <div className="rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-glow">
        <div className="text-xs uppercase tracking-wider opacity-90">Public itinerary</div>
        <h1 className="text-3xl sm:text-4xl font-bold mt-1">{trip.name}</h1>
        {trip.description && <p className="opacity-90 mt-2">{trip.description}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 text-sm opacity-90">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.stops.length} stops</span>
          <span>Estimated {fmtMoney(b.total)}</span>
        </div>
        <Button variant="secondary" size="lg" className="mt-5" onClick={onCopy}><Copy /> Copy this trip</Button>
      </div>

      <div className="space-y-5">
        {trip.stops.sort((a, b) => a.order - b.order).map((s, i) => (
          <div key={s.id} className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">{i + 1}. {s.city}, <span className="text-muted-foreground font-normal">{s.country}</span></h2>
              <span className="text-sm text-muted-foreground">{fmtDate(s.startDate)} → {fmtDate(s.endDate)}</span>
            </div>
            {s.activities.length > 0 && (
              <ul className="mt-4 space-y-2">
                {s.activities.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.category} • {a.durationHours}h</div>
                    </div>
                    <div className="text-sm font-semibold text-primary">{a.cost === 0 ? "Free" : fmtMoney(a.cost)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pt-6">
        Made with <Link to="/" className="text-gradient font-semibold">Traveloop</Link>
      </p>
    </div>
  );
}
