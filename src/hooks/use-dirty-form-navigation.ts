"use client";

export {
  NavigationGuardProvider,
  useNavigationGuard,
} from "@/providers/navigation-guard-provider";

/**
 * Dirty form navigation — delegates to the global NavigationGuardProvider.
 *
 * Screens declare `isDirty`; back button, swipe-back, and hardware back are
 * handled centrally with the standard discard confirmation sheet.
 */
export { useNavigationGuard as useDirtyFormNavigation } from "@/providers/navigation-guard-provider";
