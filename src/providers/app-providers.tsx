"use client";

import type { ReactNode } from "react";

import { FinanceProvider } from "@/lib/finance/store";
import { AppBootstrap } from "@/components/app/app-bootstrap";
import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { LocaleFontProvider } from "@/providers/locale-font-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ModalLayerProvider } from "@/providers/modal-layer-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <LocaleFontProvider>
            <AuthProvider>
              <ToastProvider>
                <ModalLayerProvider>
                  <FinanceProvider>
                    <AppBootstrap>{children}</AppBootstrap>
                  </FinanceProvider>
                </ModalLayerProvider>
              </ToastProvider>
            </AuthProvider>
          </LocaleFontProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
