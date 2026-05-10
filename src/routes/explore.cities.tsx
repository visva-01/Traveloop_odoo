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
import { CITIES, addStop, listTrips, type City, type Trip } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/explore/cities")({
  head: () => ({ meta: [{ title: "Discover cities — Traveloop" }] }),
  component: () => <RequireAuth><CitiesSearch /></RequireAuth>,
});

function CitiesSearch() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const regions = useMemo(() => ["all", ...Array.from(new Set(CITIES.map((c) => c.region)))], []);

  const results = CITIES.filter((c) =>
    (region === "all" || c.region === region) &&
    (c.name.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover cities</h1>
        <p className="text-sm text-muted-foreground">Search destinations and add them to a trip.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search cities or countries…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {regions.map((r) => <SelectItem key={r} value={r}>{r === "all" ? "All regions" : r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((c) => <CityCard key={c.name} city={c} />)}
        {results.length === 0 && <p className="text-sm text-muted-foreground">No cities match.</p>}
      </div>
    </div>
  );
}

function CityCard({ city }: { city: City }) {
  return (
    <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft hover:shadow-elegant transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-lg">{city.name}</div>
          <div className="text-xs text-muted-foreground">{city.country} • {city.region}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Cost {"$".repeat(city.costIndex)}</div>
          <div className="text-amber-500">{"★".repeat(city.popularity)}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{city.highlights.join(" • ")}</p>
      <div className="mt-4"><AddToTrip city={city} /></div>
    </div>
  );
}

function AddToTrip({ city }: { city: City }) {
  const trips = useLive<Trip[]>(() => listTrips(), []);
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState<string>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!tripId) return setErr("Pick a trip.");
    if (!start || !end) return setErr("Pick travel dates.");
    await addStop(tripId, { city: city.name, country: city.country, startDate: start, endDate: end, stayCost: 80 + city.costIndex * 30, transportCost: 150, mealsPerDay: 20 + city.costIndex * 10 });
    toast.success(`Added ${city.name}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline" className="w-full"><Plus /> Add to trip</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add {city.name} to a trip</DialogTitle></DialogHeader>
        {trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a trip first, then add cities to it.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Trip</Label>
              <Select value={tripId} onValueChange={setTripId}>
                <SelectTrigger><SelectValue placeholder="Pick a trip" /></SelectTrigger>
                <SelectContent>
                  {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
              <div><Label>End</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>
        )}
        <DialogFooter><Button onClick={submit} disabled={trips.length === 0}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
