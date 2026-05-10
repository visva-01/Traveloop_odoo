import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTheme, setTheme } from "@/lib/store";

export function ThemeToggle() {
  const [t, setT] = useState<"light" | "dark">("light");
  useEffect(() => {
    const cur = getTheme();
    setT(cur);
    document.documentElement.classList.toggle("dark", cur === "dark");
  }, []);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        const next = t === "dark" ? "light" : "dark";
        setT(next);
        setTheme(next);
      }}
    >
      {t === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
