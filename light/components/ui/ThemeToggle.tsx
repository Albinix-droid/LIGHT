// components/ui/ThemeToggle.tsx
// Bouton de bascule clair / sombre

"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, subscribeTheme, type Theme } from "./theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Côté serveur, on suppose le thème clair ; le vrai thème est lu dès l'hydratation
  const theme = useSyncExternalStore<Theme>(subscribeTheme, getTheme, () => "light");
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`inline-flex size-10 items-center justify-center rounded-xl text-ink-muted transition-colors duration-150 hover:bg-surface-muted hover:text-ink ${className}`}
      aria-label={next === "dark" ? "Passer au thème sombre" : "Passer au thème clair"}
      title={next === "dark" ? "Thème sombre" : "Thème clair"}
    >
      {theme === "dark" ? <Sun className="size-[18px]" strokeWidth={1.75} /> : <Moon className="size-[18px]" strokeWidth={1.75} />}
    </button>
  );
}
