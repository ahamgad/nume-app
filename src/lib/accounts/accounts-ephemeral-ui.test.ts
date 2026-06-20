import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  clearDocumentModalArtifacts,
  prepareAccountsEphemeralUiForNavigation,
} from "@/lib/accounts/accounts-ephemeral-ui";

describe("accounts ephemeral ui", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      documentElement: {
        dataset: { modalOpen: "true" as string | undefined },
      },
    });
  });

  it("clears document modal artifacts", () => {
    clearDocumentModalArtifacts();
    expect(document.documentElement.dataset.modalOpen).toBeUndefined();
  });

  it("closes picker synchronously before navigation", () => {
    const closePicker = vi.fn();
    prepareAccountsEphemeralUiForNavigation(closePicker);
    expect(closePicker).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.modalOpen).toBeUndefined();
  });
});
