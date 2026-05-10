import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { computeBudget, fmtMoney, getTrip, type Trip } from "@/lib/store";

export const Route = createFileRoute("/trips/$tripId/budget")({
  component: () => <RequireAuth><Budget /></RequireAuth>,
});

function Budget() {
  const { tripId } = Route.useParams();
  const trip = useLive<Trip | null>(() => getTrip(tripId), null);
  if (!trip) return null;
  const b = computeBudget(trip);

  const slices = [
    { label: "Transport", v: b.transport, color: "var(--coral)" },
    { label: "Stay", v: b.stay, color: "var(--violet)" },
    { label: "Activities", v: b.activities, color: "var(--sunset)" },
    { label: "Meals", v: b.meals, color: "var(--ocean)" },
  ];
  const max = Math.max(1, ...slices.map((s) => s.v));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Big label="Total estimated" value={fmtMoney(b.total)} accent />
        <Big label="Per day" value={fmtMoney(b.perDay)} />
        <Big label="Days" value={b.days.toString()} />
      </div>

      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Cost breakdown</h3>
        <div className="space-y-3">
          {slices.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{s.label}</span>
                <span className="font-medium">{fmtMoney(s.v)} <span className="text-muted-foreground">({b.total ? Math.round((s.v / b.total) * 100) : 0}%)</span></span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(s.v / max) * 100}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {trip.budget && (
          <div className="mt-6 rounded-xl border p-4 bg-card">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget target</span>
              <span className="font-semibold">{fmtMoney(trip.budget)}</span>
            </div>
            <div className="mt-2 h-3 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${b.total > trip.budget ? "bg-destructive" : "bg-gradient-hero"}`} style={{ width: `${Math.min(100, (b.total / trip.budget) * 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {b.total > trip.budget ? `Over budget by ${fmtMoney(b.total - trip.budget)}` : `${fmtMoney(trip.budget - b.total)} remaining`}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <h3 className="font-semibold mb-4">By stop</h3>
        {b.byStop.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stops yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left">
              <tr><th className="py-2">City</th><th>Days</th><th>Total</th><th>Per day</th><th></th></tr>
            </thead>
            <tbody>
              {b.byStop.map((s) => (
                <tr key={s.stopId} className="border-t">
                  <td className="py-3 font-medium">{s.city}</td>
                  <td>{s.days}</td>
                  <td>{fmtMoney(s.total)}</td>
                  <td>{fmtMoney(s.total / s.days)}</td>
                  <td>{s.overBudget && <span className="inline-flex items-center gap-1 text-destructive text-xs"><AlertTriangle className="h-3 w-3" /> over daily budget</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Big({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-soft ${accent ? "bg-gradient-hero text-primary-foreground" : "bg-gradient-card"}`}>
      <div className={`text-xs ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
