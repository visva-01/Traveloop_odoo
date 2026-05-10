import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { addPackItem, getTrip, removePackItem, resetPacking, togglePack, type PackItem, type Trip } from "@/lib/store";

const CATEGORIES: PackItem["category"][] = ["Clothing", "Documents", "Electronics", "Toiletries", "Other"];

export const Route = createFileRoute("/trips/$tripId/packing")({
  component: () => <RequireAuth><Packing /></RequireAuth>,
});

function Packing() {
  const { tripId } = Route.useParams();
  const trip = useLive<Trip | null>(() => getTrip(tripId), null);
  const [label, setLabel] = useState("");
  const [cat, setCat] = useState<PackItem["category"]>("Other");
  if (!trip) return null;

  const total = trip.packing.length;
  const done = trip.packing.filter((p) => p.packed).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Packing checklist</h2>
            <p className="text-sm text-muted-foreground">{done} of {total} packed</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => resetPacking(trip.id)}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
        </div>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-hero transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </div>

      <form
        className="rounded-2xl border bg-card p-4 flex flex-wrap gap-2 items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!label.trim()) return;
          await addPackItem(trip.id, { label: label.trim(), category: cat });
          setLabel("");
        }}
      >
        <div className="flex-1 min-w-[180px]">
          <Label>Item</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Sunglasses" />
        </div>
        <div className="w-40">
          <Label>Category</Label>
          <Select value={cat} onValueChange={(v) => setCat(v as PackItem["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button type="submit"><Plus /> Add</Button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => {
          const items = trip.packing.filter((p) => p.category === c);
          if (items.length === 0) return null;
          return (
            <div key={c} className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
              <h3 className="font-semibold mb-3">{c}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <Checkbox checked={item.packed} onCheckedChange={() => togglePack(trip.id, item.id)} />
                      <span className={item.packed ? "line-through text-muted-foreground" : ""}>{item.label}</span>
                    </label>
                    <Button size="icon" variant="ghost" onClick={() => removePackItem(trip.id, item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
