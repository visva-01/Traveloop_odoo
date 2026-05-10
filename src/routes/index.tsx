import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Map, Wallet, Share2, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Plan unforgettable trips" },
      { name: "description", content: "Build multi-city itineraries, discover activities, and track every dollar." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="Travelers on a coastal sunset trail" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/30" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-primary" /> Personalized travel planning
            </span>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
              Dream it. Plan it. <span className="text-gradient">Live it.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Traveloop turns scattered ideas into a beautiful multi-city itinerary —
              with budgets, activities, packing checklists, and shareable trip pages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/signup">Start planning free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
            <div className="flex gap-6 pt-4 text-xs text-muted-foreground">
              <span>No credit card</span>
              <span>•</span>
              <span>Works offline</span>
              <span>•</span>
              <span>Light & dark</span>
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Map, title: "Multi-city itineraries", desc: "Add stops, drag to reorder, schedule day-by-day." },
            { icon: Sparkles, title: "Discover activities", desc: "Curated experiences across 20+ destinations." },
            { icon: Wallet, title: "Smart budgets", desc: "Auto-calculated cost breakdowns and per-day spend." },
            { icon: Share2, title: "Share your trip", desc: "Public links, copy-trip, social sharing." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-gradient-card p-5 shadow-soft hover:shadow-elegant transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-gradient-hero grid place-items-center text-primary-foreground mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-sunset p-10 sm:p-14 text-primary-foreground shadow-glow text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Your next adventure is one click away.</h2>
          <p className="mt-3 opacity-90">Create an account and plan your first multi-city trip in minutes.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/signup">Get started <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
