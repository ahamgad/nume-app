export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "nume-theme";

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function resolveThemeIsDark(preference: ThemePreference): boolean {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  const isDark = resolveThemeIsDark(preference);
  root.classList.toggle("dark", isDark);
  root.dataset.theme = preference;
}
