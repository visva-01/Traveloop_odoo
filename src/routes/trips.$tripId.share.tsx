import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Globe, Lock, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RequireAuth } from "@/components/require-auth";
import { useLive } from "@/lib/use-store";
import { getTrip, updateTrip, type Trip } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/trips/$tripId/share")({
  component: () => <RequireAuth><ShareTab /></RequireAuth>,
});

function ShareTab() {
  const { tripId } = Route.useParams();
  const trip = useLive<Trip | null>(() => getTrip(tripId), null);
  const [origin, setOrigin] = useState(typeof window !== "undefined" ? window.location.origin : "");
  if (!trip) return null;
  const url = `${origin}/share/${trip.shareSlug}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">{trip.isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />}Public link</h2>
            <p className="text-sm text-muted-foreground">Anyone with the link can view your itinerary.</p>
          </div>
          <Switch checked={trip.isPublic} onCheckedChange={(v) => updateTrip(trip.id, { isPublic: v })} />
        </div>

        {trip.isPublic && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={url} />
              <Button onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }}><Copy /> Copy</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><a target="_blank" rel="noopener" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out my trip on Traveloop: " + trip.name)}`}><Twitter className="h-4 w-4" /> Twitter</a></Button>
              <Button asChild variant="outline" size="sm"><a target="_blank" rel="noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}><Facebook className="h-4 w-4" /> Facebook</a></Button>
              <Button asChild variant="outline" size="sm"><a href={`mailto:?subject=${encodeURIComponent("My Traveloop trip: " + trip.name)}&body=${encodeURIComponent(url)}`}><Mail className="h-4 w-4" /> Email</a></Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Visitors will see a read-only itinerary and can copy it as a starting point for their own trip.
      </p>
    </div>
  );
}
