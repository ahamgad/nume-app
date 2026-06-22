"use client";

import type { ReactNode } from "react";

import { ScreenHeader } from "@/components/layout/screen-header";
import { ScreenPageTitle } from "@/components/layout/screen-title-collapse";

interface StackPageHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
  /** When false, title stays in the header (loading/error states). Default true. */
  collapsible?: boolean;
}

interface RootPageHeaderProps {
  title: string;
  rightAction?: ReactNode;
  className?: string;
  /** When false, title stays in the header (loading states). Default true. */
  collapsible?: boolean;
}

/**
 * Stack screen header (NUME foundation).
 * Pair with `StackPageTitle` — iOS-style large title in content, nav title fades in on scroll.
 */
export function StackPageHeader({
  collapsible = true,
  ...props
}: StackPageHeaderProps) {
  return (
    <ScreenHeader
      mode="stack"
      collapsibleTitle={collapsible}
      {...props}
    />
  );
}

/**
 * Tab-root screen header — same large-title system without a back button.
 */
export function RootPageHeader({
  collapsible = true,
  ...props
}: RootPageHeaderProps) {
  return (
    <ScreenHeader
      mode="tab"
      collapsibleTitle={collapsible}
      {...props}
    />
  );
}

/** Large in-content title for stack screens. */
export function StackPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ScreenPageTitle className={className}>{children}</ScreenPageTitle>;
}

/** Large in-content title for tab-root screens. */
export function RootPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ScreenPageTitle className={className}>{children}</ScreenPageTitle>;
}
