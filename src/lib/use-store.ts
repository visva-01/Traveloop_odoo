import { useEffect, useState } from "react";
import { onChange, getCurrency } from "./store";

export function useLive<T>(loader: () => Promise<T> | T, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const v = await loader();
        if (alive) {
          setData(v);
          setLoading(false);
        }
      } catch (e) {
        console.error("useLive error:", e);
        if (alive) setLoading(false);
      }
    };
    run();
    const off = onChange(run);
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [data, loading] as const;
}

export function useCurrency() {
  const [c] = useLive(() => getCurrency(), "USD");
  return c;
}

