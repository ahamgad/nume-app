"use client";

import type { ReactNode } from "react";

import { FinanceProvider } from "@/lib/finance/store";
import { I18nProvider } from "@/providers/i18n-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <FinanceProvider>{children}</FinanceProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
