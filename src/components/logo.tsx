import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
        <Compass className="h-4 w-4" />
      </span>
      <span className="text-lg">Travel<span className="text-gradient">loop</span></span>
    </Link>
  );
}
