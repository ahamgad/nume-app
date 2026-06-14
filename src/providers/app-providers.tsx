"use client";

import type { ReactNode } from "react";

import { FinanceProvider } from "@/lib/finance/store";
import { AppBootstrap } from "@/components/app/app-bootstrap";
import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { KeyboardProvider } from "@/providers/keyboard-provider";
import { LocaleFontProvider } from "@/providers/locale-font-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <I18nProvider>
        <LocaleFontProvider>
          <KeyboardProvider>
            <AuthProvider>
              <ToastProvider>
                <FinanceProvider>
                  <AppBootstrap>{children}</AppBootstrap>
                </FinanceProvider>
              </ToastProvider>
            </AuthProvider>
          </KeyboardProvider>
        </LocaleFontProvider>
      </I18nProvider>
    </QueryProvider>
  );
}
