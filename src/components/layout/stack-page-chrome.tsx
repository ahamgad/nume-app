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

/** Stack screen header with collapsible title behavior (NUME foundation). */
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

/** Large in-content title paired with `StackPageHeader`. */
export function StackPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ScreenPageTitle className={className}>{children}</ScreenPageTitle>;
}
