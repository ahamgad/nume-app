"use client";

import { useEffect, useRef } from "react";

import { OFFLINE_TOAST_ID } from "@/lib/connectivity/connectivity-state";
import { useConnectivity } from "@/providers/connectivity-provider";
import { useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

/** Global offline / back-online toast orchestration. */
export function ConnectivityToasts() {
  const t = useT();
  const { isOnline, registerOfflineSignaler } = useConnectivity();
  const { showToast, dismissToast } = useToast();
  const wasOfflineRef = useRef(!isOnline);

  useEffect(() => {
    return registerOfflineSignaler(() => {
      showToast(t("connectivity.offline.title"), {
        id: OFFLINE_TOAST_ID,
        description: t("connectivity.offline.description"),
        tone: "warning",
        icon: "wifi-off",
        persistent: true,
      });
    });
  }, [registerOfflineSignaler, showToast, t]);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      showToast(t("connectivity.offline.title"), {
        id: OFFLINE_TOAST_ID,
        description: t("connectivity.offline.description"),
        tone: "warning",
        icon: "wifi-off",
        persistent: true,
      });
      return;
    }

    dismissToast(OFFLINE_TOAST_ID);

    if (wasOfflineRef.current) {
      showToast(t("connectivity.online"), {
        tone: "success",
        durationMs: 2500,
      });
    }

    wasOfflineRef.current = false;
  }, [dismissToast, isOnline, showToast, t]);

  return null;
}
