import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { deleteTrip, fmtDate, listTrips, type Trip } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/trips/")({
  head: () => ({ meta: [{ title: "My trips — Traveloop" }] }),
  component: () => <RequireAuth><MyTrips /></RequireAuth>,
});

function MyTrips() {
  const trips = useLive<Trip[]>(() => listTrips(), []);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My trips</h1>
          <p className="text-sm text-muted-foreground">{trips.length} trip{trips.length === 1 ? "" : "s"}</p>
        </div>
        <Button asChild><Link to="/trips/new"><Plus /> New trip</Link></Button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="font-semibold">No trips yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first one to get started.</p>
          <Button asChild className="mt-4"><Link to="/trips/new"><Plus /> Plan a trip</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-gradient-card overflow-hidden shadow-soft">
              <Link to="/trips/$tripId" params={{ tripId: t.id }} className="block">
                <div className="h-28 bg-gradient-sunset relative">
                  {t.cover && <img src={t.cover} alt="" className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-primary-foreground">
                    <div className="font-bold drop-shadow">{t.name}</div>
                    <div className="text-xs opacity-90">{fmtDate(t.startDate)} → {fmtDate(t.endDate)}</div>
                  </div>
                </div>
                <div className="p-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.stops.length} stops</span>
                    <span>{t.stops.map((s) => s.city).slice(0, 2).join(", ") || "No stops yet"}</span>
                  </div>
                </div>
              </Link>
              <div className="px-3 pb-3 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/trips/$tripId" params={{ tripId: t.id }}><Eye className="h-3.5 w-3.5" /> View</Link></Button>
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/trips/$tripId/build" params={{ tripId: t.id }}><Pencil className="h-3.5 w-3.5" /> Edit</Link></Button>
                <Button
                  variant="outline" size="sm"
                  onClick={async () => { if (confirm(`Delete "${t.name}"?`)) { await deleteTrip(t.id); toast.success("Trip deleted"); } }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
