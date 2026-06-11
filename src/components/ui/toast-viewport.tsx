"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

function isStackScreen(pathname: string) {
  return (
    pathname.startsWith("/accounts/") ||
    pathname.startsWith("/more/") ||
    pathname.includes("/records/")
  );
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  const pathname = usePathname();
  const onStack = isStackScreen(pathname);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col gap-2 px-4",
        onStack
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex min-h-11 items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-sm text-background shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200",
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
