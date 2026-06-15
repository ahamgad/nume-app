/** Temporary — set false to silence layout shift investigation logs. */
export const LAYOUT_SHIFT_DIAGNOSTICS_ENABLED = true;

export type LayoutDiagnosticPhase =
  | "screen-opened"
  | "screen-settled"
  | "before-focus"
  | "focus-immediate"
  | "focus-after-raf"
  | "focus-after-120ms"
  | "viewport-resize"
  | "keyboard-settled"
  | "document-scroll-guard-reset";

export interface LayoutDiagnosticSnapshot {
  phase: LayoutDiagnosticPhase;
  timestamp: number;
  pathname: string;
  activeTag: string | null;
  activeId: string | null;
  appShellHeight: number | null;
  appShellTop: number | null;
  appShellComputedHeight: string | null;
  bodyHeight: number | null;
  bodyComputedHeight: string | null;
  htmlComputedHeight: string | null;
  windowInnerHeight: number;
  windowScrollY: number;
  documentElementScrollTop: number;
  bodyScrollTop: number;
  visualViewportHeight: number | null;
  visualViewportOffsetTop: number | null;
  visualViewportPageTop: number | null;
  screenHeaderTop: number | null;
  screenHeaderPaddingTop: string | null;
  screenHeaderHeight: number | null;
  screenTransitionTop: number | null;
  safeAreaInsetTopPx: number | null;
}

declare global {
  interface Window {
    __NUME_LAYOUT_DIAG__?: LayoutDiagnosticSnapshot[];
  }
}

function readSafeAreaInsetTopPx(): number | null {
  if (typeof document === "undefined") return null;

  const header = document.querySelector<HTMLElement>("[data-screen-header]");
  if (header) {
    return parseFloat(getComputedStyle(header).paddingTop) || 0;
  }

  return null;
}

export function captureLayoutSnapshot(
  phase: LayoutDiagnosticPhase,
  options: {
    pathname?: string;
    activeElement?: Element | null;
    appShellEl?: HTMLElement | null;
  } = {},
): LayoutDiagnosticSnapshot {
  const { pathname = "", activeElement = null, appShellEl = null } = options;
  const appShell =
    appShellEl ??
    document.querySelector<HTMLElement>('[data-layout-root="app-shell"]');
  const header = document.querySelector<HTMLElement>("[data-screen-header]");
  const screenTransition = document.querySelector<HTMLElement>(
    '[data-layout-root="screen-transition"]',
  );
  const body = document.body;
  const html = document.documentElement;
  const viewport = window.visualViewport;

  const active =
    activeElement instanceof HTMLElement ? activeElement : document.activeElement;

  return {
    phase,
    timestamp: Date.now(),
    pathname,
    activeTag: active instanceof HTMLElement ? active.tagName : null,
    activeId: active instanceof HTMLElement ? active.id || null : null,
    appShellHeight: appShell?.getBoundingClientRect().height ?? null,
    appShellTop: appShell?.getBoundingClientRect().top ?? null,
    appShellComputedHeight: appShell
      ? getComputedStyle(appShell).height
      : null,
    bodyHeight: body.getBoundingClientRect().height,
    bodyComputedHeight: getComputedStyle(body).height,
    htmlComputedHeight: getComputedStyle(html).height,
    windowInnerHeight: window.innerHeight,
    windowScrollY: window.scrollY,
    documentElementScrollTop: html.scrollTop,
    bodyScrollTop: body.scrollTop,
    visualViewportHeight: viewport?.height ?? null,
    visualViewportOffsetTop: viewport?.offsetTop ?? null,
    visualViewportPageTop: viewport?.pageTop ?? null,
    screenHeaderTop: header?.getBoundingClientRect().top ?? null,
    screenHeaderPaddingTop: header ? getComputedStyle(header).paddingTop : null,
    screenHeaderHeight: header?.getBoundingClientRect().height ?? null,
    screenTransitionTop: screenTransition?.getBoundingClientRect().top ?? null,
    safeAreaInsetTopPx: readSafeAreaInsetTopPx(),
  };
}

export function logLayoutSnapshot(snapshot: LayoutDiagnosticSnapshot) {
  if (!LAYOUT_SHIFT_DIAGNOSTICS_ENABLED) return;

  if (typeof window !== "undefined") {
    window.__NUME_LAYOUT_DIAG__ = [
      ...(window.__NUME_LAYOUT_DIAG__ ?? []),
      snapshot,
    ].slice(-80);
  }

  console.groupCollapsed(
    `[NUME Layout] ${snapshot.phase} @ ${snapshot.timestamp}`,
  );
  console.table({
    appShellHeight: snapshot.appShellHeight,
    appShellTop: snapshot.appShellTop,
    appShellComputedHeight: snapshot.appShellComputedHeight,
    bodyHeight: snapshot.bodyHeight,
    bodyComputedHeight: snapshot.bodyComputedHeight,
    htmlComputedHeight: snapshot.htmlComputedHeight,
    windowInnerHeight: snapshot.windowInnerHeight,
    windowScrollY: snapshot.windowScrollY,
    documentScrollTop: snapshot.documentElementScrollTop,
    bodyScrollTop: snapshot.bodyScrollTop,
    visualViewportHeight: snapshot.visualViewportHeight,
    visualViewportOffsetTop: snapshot.visualViewportOffsetTop,
    visualViewportPageTop: snapshot.visualViewportPageTop,
    screenHeaderTop: snapshot.screenHeaderTop,
    screenHeaderPaddingTop: snapshot.screenHeaderPaddingTop,
    screenHeaderHeight: snapshot.screenHeaderHeight,
    screenTransitionTop: snapshot.screenTransitionTop,
    safeAreaInsetTopPx: snapshot.safeAreaInsetTopPx,
    active: snapshot.activeId ?? snapshot.activeTag,
  });
  console.groupEnd();
}

export function diffLayoutSnapshots(
  before: LayoutDiagnosticSnapshot,
  after: LayoutDiagnosticSnapshot,
) {
  if (!LAYOUT_SHIFT_DIAGNOSTICS_ENABLED) return;

  const deltas: Record<string, string> = {};

  function delta(label: string, a: number | null, b: number | null) {
    if (a === null || b === null) return;
    const d = b - a;
    if (Math.abs(d) > 0.5) {
      deltas[label] = `${a} → ${b} (${d > 0 ? "+" : ""}${d.toFixed(1)})`;
    }
  }

  delta("appShellHeight", before.appShellHeight, after.appShellHeight);
  delta("appShellTop", before.appShellTop, after.appShellTop);
  delta("screenHeaderTop", before.screenHeaderTop, after.screenHeaderTop);
  delta("screenTransitionTop", before.screenTransitionTop, after.screenTransitionTop);
  delta("windowInnerHeight", before.windowInnerHeight, after.windowInnerHeight);
  delta(
    "visualViewportHeight",
    before.visualViewportHeight,
    after.visualViewportHeight,
  );
  delta(
    "visualViewportOffsetTop",
    before.visualViewportOffsetTop,
    after.visualViewportOffsetTop,
  );
  delta("windowScrollY", before.windowScrollY, after.windowScrollY);
  delta(
    "safeAreaInsetTopPx",
    before.safeAreaInsetTopPx,
    after.safeAreaInsetTopPx,
  );

  if (Object.keys(deltas).length === 0) return;

  console.groupCollapsed(
    `[NUME Layout] Δ ${before.phase} → ${after.phase}`,
  );
  console.table(deltas);
  console.groupEnd();
}
