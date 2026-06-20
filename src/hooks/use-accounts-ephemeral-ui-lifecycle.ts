"use client";

import { useEffect } from "react";

import { restoreAccountsEphemeralUi } from "@/lib/accounts/accounts-ephemeral-ui";
import {
  consumeAccountTypePickerDismissed,
  shouldSuppressAccountTypePicker,
} from "@/lib/accounts/account-type-picker-state";

/** Ensures picker/modal ephemeral state is cleared on pagehide and bfcache restore. */
export function useAccountsEphemeralUiLifecycle(closePicker: () => void) {
  useEffect(() => {
    function handlePageHide() {
      restoreAccountsEphemeralUi(closePicker);
    }

    function handlePageShow(event: PageTransitionEvent) {
      const fromHistorySnapshot =
        event.persisted || shouldSuppressAccountTypePicker();
      if (!fromHistorySnapshot) return;
      restoreAccountsEphemeralUi(closePicker);
      consumeAccountTypePickerDismissed();
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [closePicker]);
}
