import { useEffect, useState, useRef, Suspense, lazy } from "react";
import { CITIES, type City } from "@/lib/store";

// Lazy load the globe to avoid SSR issues
const Globe = lazy(() => import("react-globe.gl"));

export function WorldMap({ onSelectCity, selectedCity }: { onSelectCity: (city: City) => void, selectedCity?: City | null }) {
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<any>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && selectedCity && globeRef.current) {
      globeRef.current.pointOfView({
        lat: selectedCity.lat,
        lng: selectedCity.lng,
        altitude: 1.5
      }, 1000);
    }
  }, [selectedCity, mounted]);

  if (!mounted) return <div className="h-[500px] w-full rounded-3xl bg-muted animate-pulse flex items-center justify-center font-medium">Initializing 3D World...</div>;

  const points = CITIES.map(c => ({
    ...c,
    size: 0.1,
    color: c.name === selectedCity?.name ? "#ffffff" : "var(--primary)"
  }));

  return (
    <div className="h-[650px] w-full rounded-3xl overflow-hidden bg-background border shadow-soft relative group">
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading 3D Engine...</div>}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          pointsData={points}
          pointAltitude={0.01}
          pointColor="color"
          pointRadius={0.4}
          pointsMerge={false}
          pointerInteractionThreshold={1}
          
          pointLabel={(d: any) => `
            <div class="bg-card text-card-foreground p-3 rounded-xl border shadow-xl animate-in zoom-in-95 duration-200">
              <div class="font-bold text-sm">${d.name}</div>
              <div class="text-[10px] opacity-70 uppercase tracking-wider mt-0.5">${d.country}</div>
            </div>
          `}
          onPointClick={(point: any) => onSelectCity(point)}
          
          atmosphereColor="var(--primary)"
          atmosphereAltitude={0.15}
          
          ringsData={selectedCity ? [selectedCity] : []}
          ringColor={() => "var(--primary)"}
          ringMaxRadius={5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1000}

          labelsData={points.filter(p => p.popularity >= 5 || p.name === selectedCity?.name)}
          labelLat={d => (d as any).lat}
          labelLng={d => (d as any).lng}
          labelText={d => (d as any).name}
          labelSize={0.4}
          labelDotRadius={0.1}
          labelColor={() => "rgba(255, 255, 255, 0.7)"}
          labelResolution={2}
          onLabelClick={(label: any) => onSelectCity(label)}
        />
      </Suspense>
      
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-background/80 backdrop-blur border rounded-xl p-3 text-[10px] uppercase tracking-widest text-muted-foreground shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>100+ Live Destinations</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur border rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-4 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5"><span className="bg-muted px-1.5 py-0.5 rounded border">Drag</span> Rotate</div>
        <div className="flex items-center gap-1.5"><span className="bg-muted px-1.5 py-0.5 rounded border">Scroll</span> Zoom</div>
        <div className="flex items-center gap-1.5"><span className="bg-muted px-1.5 py-0.5 rounded border">Click</span> Select</div>
      </div>
    </div>
  );
}
