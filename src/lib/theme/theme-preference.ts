export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "nume-theme";
export const THEME_VERSION_KEY = "nume-theme-version";

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

function bumpThemeVersion(root: HTMLElement) {
  const version = String(Date.now());
  root.dataset.themeVersion = version;
  try {
    window.sessionStorage.setItem(THEME_VERSION_KEY, version);
  } catch {
    // ignore storage failures
  }
}

function invalidateThemeCompositorLayers(root: HTMLElement) {
  void root.offsetHeight;
}

/** Apply theme globally on `document.documentElement` — instant, no React re-render required. */
export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  const isDark = resolveThemeIsDark(preference);

  root.classList.add("theme-switching");
  root.classList.toggle("dark", isDark);
  root.dataset.theme = preference;
  root.style.colorScheme = isDark ? "dark" : "light";

  bumpThemeVersion(root);
  updateThemeColorMeta(isDark);
  invalidateThemeCompositorLayers(root);

  requestAnimationFrame(() => {
    root.classList.remove("theme-switching");
  });
}

/** Re-apply stored theme — for navigation / visibility / Safari snapshot invalidation. */
export function reapplyStoredThemePreference() {
  applyThemePreference(readStoredTheme());
}
