import { useEffect, useState } from "react";
import { onChange } from "./store";

export function useLive<T>(loader: () => Promise<T> | T, initial: T): T {
  const [data, setData] = useState<T>(initial);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const v = await loader();
      if (alive) setData(v);
    };
    run();
    const off = onChange(run);
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
}
