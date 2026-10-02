// components/ui/theme.ts
// Thème clair / sombre : préférence mémorisée dans le navigateur, appliquée via la classe .dark sur <html>.
// Clair par défaut (identité de la plateforme) ; le sombre est un choix explicite de l'utilisateur.

export const THEME_STORAGE_KEY = "light-theme";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

export function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Navigation privée ou stockage bloqué : le thème s'applique quand même pour la session
  }
  listeners.forEach((notify) => notify());
}

// Pour useSyncExternalStore
export function subscribeTheme(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}
