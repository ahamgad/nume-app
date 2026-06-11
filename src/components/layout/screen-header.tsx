"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  mode?: "tab" | "stack";
  onBack?: () => void;
  className?: string;
}

export function ScreenHeader({
  title,
  mode = "tab",
  onBack,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="flex h-14 items-center px-2">
        {mode === "stack" ? (
          <button
            type="button"
            onClick={onBack ?? (() => router.back())}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </button>
        ) : (
          <div className="size-11 shrink-0" />
        )}
        <h1 className="min-w-0 flex-1 truncate px-1 text-base font-semibold">
          {title}
        </h1>
        <div className="size-11 shrink-0" />
      </div>
    </header>
  );
}

interface ScreenBodyProps {
  children: ReactNode;
  className?: string;
  withTabBar?: boolean;
  withStickyFooter?: boolean;
}

export function ScreenBody({
  children,
  className,
  withTabBar = true,
  withStickyFooter = false,
}: ScreenBodyProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto px-4 pt-4",
        withTabBar &&
          "pb-[calc(4.5rem+env(safe-area-inset-bottom))]",
        withStickyFooter &&
          "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </main>
  );
}
