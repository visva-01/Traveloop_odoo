import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { ACTIVITIES, addActivity, fmtMoney, listTrips, type ActivityCatalogItem, type Trip } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/explore/activities")({
  head: () => ({ meta: [{ title: "Discover activities — Traveloop" }] }),
  component: () => <RequireAuth><ActivitiesSearch /></RequireAuth>,
});

const CATS = ["all", "Sightseeing", "Food", "Adventure", "Culture", "Nightlife", "Nature", "Shopping"] as const;
const COSTS = [
  { v: "all", label: "Any cost" },
  { v: "free", label: "Free" },
  { v: "low", label: "$ Under 30" },
  { v: "mid", label: "$$ 30-80" },
  { v: "hi", label: "$$$ Over 80" },
] as const;

function ActivitiesSearch() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const [cost, setCost] = useState<(typeof COSTS)[number]["v"]>("all");

  const results = useMemo(() => ACTIVITIES.filter((a) =>
    (cat === "all" || a.category === cat) &&
    (q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.city.toLowerCase().includes(q.toLowerCase())) &&
    (cost === "all" ||
      (cost === "free" && a.cost === 0) ||
      (cost === "low" && a.cost > 0 && a.cost < 30) ||
      (cost === "mid" && a.cost >= 30 && a.cost <= 80) ||
      (cost === "hi" && a.cost > 80)),
  ), [q, cat, cost]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover activities</h1>
        <p className="text-sm text-muted-foreground">Browse experiences and add them to your stops.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search activities or cities…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={cost} onValueChange={(v) => setCost(v as typeof cost)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{COSTS.map((c) => <SelectItem key={c.v} value={c.v}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((a, i) => <ActivityCard key={i} a={a} />)}
        {results.length === 0 && <p className="text-sm text-muted-foreground">No activities match.</p>}
      </div>
    </div>
  );
}

function ActivityCard({ a }: { a: ActivityCatalogItem }) {
  return (
    <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft hover:shadow-elegant transition flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{a.name}</div>
          <div className="text-xs text-muted-foreground">{a.city} • {a.category}</div>
        </div>
        <div className="text-sm font-semibold text-primary">{a.cost === 0 ? "Free" : fmtMoney(a.cost)}</div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground flex-1">{a.description}</p>
      <div className="mt-3 text-xs text-muted-foreground">{a.durationHours}h</div>
      <div className="mt-3"><AddActivityToStop a={a} /></div>
    </div>
  );
}

function AddActivityToStop({ a }: { a: ActivityCatalogItem }) {
  const trips = useLive<Trip[]>(() => listTrips(), []);
  const [open, setOpen] = useState(false);
  const [stopKey, setStopKey] = useState<string>("");

  const options = trips.flatMap((t) => t.stops.map((s) => ({ key: `${t.id}::${s.id}`, label: `${t.name} — ${s.city}` })));

  const submit = async () => {
    if (!stopKey) return;
    const [tripId, stopId] = stopKey.split("::");
    await addActivity(tripId, stopId, { name: a.name, category: a.category, cost: a.cost, durationHours: a.durationHours, description: a.description });
    toast.success(`Added "${a.name}"`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline" className="w-full"><Plus /> Add to stop</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add to a stop</DialogTitle></DialogHeader>
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">You need a trip with stops first.</p>
        ) : (
          <div>
            <Label>Stop</Label>
            <Select value={stopKey} onValueChange={setStopKey}>
              <SelectTrigger><SelectValue placeholder="Pick a stop" /></SelectTrigger>
              <SelectContent>{options.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <DialogFooter><Button onClick={submit} disabled={options.length === 0}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
