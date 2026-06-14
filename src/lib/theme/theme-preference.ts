export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "nume-theme";

const THEME_COLOR_LIGHT = "#ffffff";
const THEME_COLOR_DARK = "#171717";

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

function updateThemeColorMeta(isDark: boolean) {
  const color = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

/** Apply theme globally on `document.documentElement` — instant, no React re-render required. */
export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  const isDark = resolveThemeIsDark(preference);

  root.classList.add("theme-switching");
  root.classList.toggle("dark", isDark);
  root.dataset.theme = preference;
  root.style.colorScheme = isDark ? "dark" : "light";

  updateThemeColorMeta(isDark);

  // iOS/Safari: nudge compositor so cached layers repaint with new tokens.
  void root.offsetHeight;

  requestAnimationFrame(() => {
    root.classList.remove("theme-switching");
  });
}
