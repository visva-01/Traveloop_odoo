import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/require-auth";
import { createTrip } from "@/lib/store";
import { useCurrency } from "@/lib/use-store";
import { toast } from "sonner";

export const Route = createFileRoute("/trips/new")({
  head: () => ({ meta: [{ title: "Plan a new trip — Traveloop" }] }),
  component: () => <RequireAuth><NewTrip /></RequireAuth>,
});

function NewTrip() {
  const nav = useNavigate();
  const currency = useCurrency();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [cover, setCover] = useState<string>("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Trip needs a name.");
    if (!startDate || !endDate) return setErr("Pick both start and end dates.");
    if (new Date(endDate) < new Date(startDate)) return setErr("End date must be after start.");
    setBusy(true);
    try {
      const t = await createTrip({
        name, description, startDate, endDate,
        budget: budget ? Number(budget) : undefined,
        cover: cover || undefined,
      });
      toast.success("Trip created!");
      nav({ to: "/trips/$tripId/build", params: { tripId: t.id } });
    } finally {
      setBusy(false);
    }
  };

  const onCover = (f?: File) => {
    if (!f) return;
    if (f.size > 2_000_000) return setErr("Cover image must be under 2MB.");
    const reader = new FileReader();
    reader.onload = () => setCover(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold">Plan a new trip</h1>
      <p className="text-sm text-muted-foreground mt-1">Set the basics — you'll add stops next.</p>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="name">Trip name</Label>
          <Input id="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Japan in spring" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" required value={startDate} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">End date</Label>
            <Input id="end" type="date" required value={endDate} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget ({currency}, optional)</Label>
          <Input id="budget" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="3000" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" maxLength={500} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the vibe of this trip?" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cover">Cover photo (optional)</Label>
          <Input id="cover" type="file" accept="image/*" onChange={(e) => onCover(e.target.files?.[0])} />
          {cover && <img src={cover} alt="" className="mt-2 h-32 w-full object-cover rounded-lg" />}
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy} className="shadow-glow">{busy ? "Creating…" : "Create trip"}</Button>
        </div>
      </form>
    </div>
  );
}
