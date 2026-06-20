import { flushSync } from "react-dom";

/** Clears document-level modal artifacts that must not survive history snapshots. */
export function clearDocumentModalArtifacts() {
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.modalOpen;
}

/**
 * Synchronously tears down ephemeral Accounts UI before forward navigation so
 * bfcache / history restoration does not revive picker overlays or scroll locks.
 */
export function prepareAccountsEphemeralUiForNavigation(closePicker: () => void) {
  flushSync(() => {
    closePicker();
  });
  clearDocumentModalArtifacts();
}

/**
 * Clears ephemeral Accounts UI when the page is hidden or restored from cache.
 */
export function restoreAccountsEphemeralUi(closePicker: () => void) {
  flushSync(() => {
    closePicker();
  });
  clearDocumentModalArtifacts();
}
