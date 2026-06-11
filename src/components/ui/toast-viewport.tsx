"use client";

import { X } from "lucide-react";

import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col gap-2 px-4",
        "top-[calc(3.75rem+env(safe-area-inset-top))]",
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex min-h-11 items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-sm text-background shadow-sm animate-in fade-in slide-in-from-top-2 duration-200",
          )}
          role="status"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md opacity-80 transition-opacity hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
