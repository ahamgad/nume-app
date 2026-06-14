"use client";

/**
 * Blocks iOS interactive edge-swipe while a dirty form is open.
 * Render alongside `useDirtyFormNavigation` on dirty form screens.
 */
export function DirtyFormEdgeGuard({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-y-0 start-0 z-[100] w-6 touch-none"
    />
  );
}
