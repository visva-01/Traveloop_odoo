import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { addNote, deleteNote, getTrip, updateNote, type Trip } from "@/lib/store";

export const Route = createFileRoute("/trips/$tripId/notes")({
  component: () => <RequireAuth><Notes /></RequireAuth>,
});

function Notes() {
  const { tripId } = Route.useParams();
  const trip = useLive<Trip | null>(() => getTrip(tripId), null);
  const [text, setText] = useState("");
  const [stopId, setStopId] = useState<string>("trip");
  if (!trip) return null;

  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border bg-gradient-card p-5 shadow-soft space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await addNote(trip.id, text.trim(), stopId === "trip" ? undefined : stopId);
          setText("");
        }}
      >
        <h2 className="font-semibold">New note</h2>
        <div>
          <Label>Attach to</Label>
          <Select value={stopId} onValueChange={setStopId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="trip">Whole trip</SelectItem>
              {trip.stops.map((s) => <SelectItem key={s.id} value={s.id}>{s.city}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Note</Label>
          <Textarea rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Hotel check-in code, host phone, day reminder…" />
        </div>
        <div className="flex justify-end"><Button type="submit"><Plus /> Add note</Button></div>
      </form>

      {trip.notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {trip.notes.map((n) => {
            const stop = trip.stops.find((s) => s.id === n.stopId);
            return <NoteCard key={n.id} tripId={trip.id} id={n.id} text={n.text} createdAt={n.createdAt} stopName={stop?.city ?? "Trip"} />;
          })}
        </div>
      )}
    </div>
  );
}

function NoteCard({ tripId, id, text, createdAt, stopName }: { tripId: string; id: string; text: string; createdAt: number; stopName: string }) {
  const [val, setVal] = useState(text);
  const [editing, setEditing] = useState(false);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span className="px-2 py-0.5 rounded-full bg-muted">{stopName}</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>
      {editing ? (
        <Textarea value={val} onChange={(e) => setVal(e.target.value)} rows={4} />
      ) : (
        <p className="text-sm whitespace-pre-wrap">{text}</p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        {editing ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => { setVal(text); setEditing(false); }}>Cancel</Button>
            <Button size="sm" onClick={async () => { await updateNote(tripId, id, val); setEditing(false); }}><Save className="h-3.5 w-3.5" /> Save</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => deleteNote(tripId, id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </>
        )}
      </div>
    </div>
  );
}
