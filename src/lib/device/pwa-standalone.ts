const SUPPORTED_APPLICATION_DISPLAY_MODES = [
  "standalone",
  "fullscreen",
  "minimal-ui",
] as const;

export function isPwaStandalone(): boolean {
  return isSupportedApplicationRuntime();
}

/** Installed PWA or equivalent — the only supported application runtime. */
export function isSupportedApplicationRuntime(): boolean {
  if (typeof window === "undefined") return false;

  if (
    SUPPORTED_APPLICATION_DISPLAY_MODES.some((mode) =>
      window.matchMedia(`(display-mode: ${mode})`).matches,
    )
  ) {
    return true;
  }

  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  );
}
