import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import {
  ACTIVITIES, CITIES, addActivity, addStop, fmtMoney, getTrip,
  removeActivity, removeStop, reorderStops, updateStop, type Activity, type Trip,
} from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/trips/$tripId/build")({
  component: () => <RequireAuth><Builder /></RequireAuth>,
});

function Builder() {
  const { tripId } = Route.useParams();
  const [trip, loading] = useLive<Trip | null>(() => getTrip(tripId), null);

  if (loading && !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading itinerary...</p>
      </div>
    );
  }

  if (!trip) return (
    <div className="p-8 text-center border-2 border-dashed rounded-2xl">
      <h2 className="text-xl font-bold">Trip not found</h2>
      <p className="text-sm text-muted-foreground mt-2">The trip you are looking for doesn't exist or you don't have access.</p>
    </div>
  );

  const move = async (i: number, dir: -1 | 1) => {
    const ids = trip.stops.sort((a, b) => a.order - b.order).map((s) => s.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await reorderStops(trip.id, ids);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Itinerary builder</h2>
          <p className="text-sm text-muted-foreground">Add stops and activities to build your day-by-day plan.</p>
        </div>
        <AddStopDialog tripId={trip.id} />
      </div>

      {trip.stops.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-12 text-center">
          <p className="font-semibold">Add your first stop</p>
          <p className="text-sm text-muted-foreground mt-1">Pick a city, dates, and start adding activities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trip.stops.sort((a, b) => a.order - b.order).map((s, i) => (
            <div key={s.id} className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col">
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === trip.stops.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{s.city} <span className="text-muted-foreground font-normal text-sm">{s.country}</span></div>
                    <div className="text-xs text-muted-foreground">{s.startDate} → {s.endDate}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <EditStopDialog tripId={trip.id} stop={s} />
                  <Button variant="outline" size="sm" onClick={async () => { if (confirm(`Remove ${s.city}?`)) await removeStop(trip.id, s.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <Stat label="Stay/night" value={fmtMoney(s.stayCost)} />
                <Stat label="Transport" value={fmtMoney(s.transportCost)} />
                <Stat label="Meals/day" value={fmtMoney(s.mealsPerDay)} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Activities ({s.activities.length})</div>
                  <AddActivityDialog tripId={trip.id} stopId={s.id} cityName={s.city} />
                </div>
                {s.activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activities yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {s.activities.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.category} • {a.durationHours}h • {fmtMoney(a.cost)}{a.time ? ` • ${a.time}` : ""}</div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeActivity(trip.id, s.id, a.id)}><X className="h-4 w-4" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground text-sm">{value}</div>
    </div>
  );
}

function AddStopDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stay, setStay] = useState(80);
  const [transport, setTransport] = useState(150);
  const [meals, setMeals] = useState(40);
  const [err, setErr] = useState("");

  const onCity = (name: string) => {
    setCity(name);
    const c = CITIES.find((x) => x.name === name);
    if (c) setCountry(c.country);
  };

  const submit = async () => {
    setErr("");
    if (!city.trim()) return setErr("City is required.");
    if (!start || !end) return setErr("Pick travel dates.");
    if (new Date(end) < new Date(start)) return setErr("End must be after start.");
    await addStop(tripId, { city, country, startDate: start, endDate: end, stayCost: +stay, transportCost: +transport, mealsPerDay: +meals });
    toast.success(`Added ${city}`);
    setOpen(false);
    setCity(""); setCountry(""); setStart(""); setEnd("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="shadow-glow"><Plus /> Add stop</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a stop</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>City</Label>
            <Input list="city-list" value={city} onChange={(e) => onCity(e.target.value)} placeholder="Tokyo" />
            <datalist id="city-list">
              {CITIES.map((c) => <option key={c.name} value={c.name}>{c.country}</option>)}
            </datalist>
          </div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label>End</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Stay/night ($)</Label><Input type="number" min={0} value={stay} onChange={(e) => setStay(+e.target.value)} /></div>
            <div><Label>Transport ($)</Label><Input type="number" min={0} value={transport} onChange={(e) => setTransport(+e.target.value)} /></div>
            <div><Label>Meals/day ($)</Label><Input type="number" min={0} value={meals} onChange={(e) => setMeals(+e.target.value)} /></div>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter><Button onClick={submit}>Add stop</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStopDialog({ tripId, stop }: { tripId: string; stop: Trip["stops"][number] }) {
  const [open, setOpen] = useState(false);
  const [stay, setStay] = useState(stop.stayCost);
  const [transport, setTransport] = useState(stop.transportCost);
  const [meals, setMeals] = useState(stop.mealsPerDay);
  const [start, setStart] = useState(stop.startDate);
  const [end, setEnd] = useState(stop.endDate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit stop — {stop.city}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label>End</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Stay/night</Label><Input type="number" value={stay} onChange={(e) => setStay(+e.target.value)} /></div>
            <div><Label>Transport</Label><Input type="number" value={transport} onChange={(e) => setTransport(+e.target.value)} /></div>
            <div><Label>Meals/day</Label><Input type="number" value={meals} onChange={(e) => setMeals(+e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={async () => { await updateStop(tripId, stop.id, { stayCost: stay, transportCost: transport, mealsPerDay: meals, startDate: start, endDate: end }); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddActivityDialog({ tripId, stopId, cityName }: { tripId: string; stopId: string; cityName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Activity["category"]>("Sightseeing");
  const [cost, setCost] = useState(0);
  const [duration, setDuration] = useState(2);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const suggestions = ACTIVITIES.filter((a) => a.city === cityName);

  const useSuggestion = async (s: typeof suggestions[number]) => {
    await addActivity(tripId, stopId, { name: s.name, category: s.category, cost: s.cost, durationHours: s.durationHours, description: s.description });
    toast.success(`Added "${s.name}"`);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await addActivity(tripId, stopId, { name, category, cost: +cost, durationHours: +duration, description, time: time || undefined });
    setOpen(false);
    setName(""); setCost(0); setDuration(2); setTime(""); setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> Activity</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add activity in {cityName}</DialogTitle></DialogHeader>

        {suggestions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions for {cityName}</div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-44 overflow-auto">
              {suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => useSuggestion(s)} className="text-left rounded-lg border p-2 text-sm hover:bg-accent/10 transition">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.category} • {s.durationHours}h • {fmtMoney(s.cost)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <div className="text-xs font-medium text-muted-foreground">Or add a custom activity</div>
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Activity["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Sightseeing", "Food", "Adventure", "Culture", "Nightlife", "Nature", "Shopping"] as const).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Time (optional)</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
            <div><Label>Cost ($)</Label><Input type="number" min={0} value={cost} onChange={(e) => setCost(+e.target.value)} /></div>
            <div><Label>Duration (h)</Label><Input type="number" min={0.5} step={0.5} value={duration} onChange={(e) => setDuration(+e.target.value)} /></div>
          </div>
          <div><Label>Notes</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} /></div>
        </div>

        <DialogFooter><Button onClick={submit}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
