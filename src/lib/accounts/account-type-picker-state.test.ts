import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  consumeAccountTypePickerDismissed,
  markAccountTypePickerDismissed,
} from "@/lib/accounts/account-type-picker-state";

describe("account type picker state", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  it("marks dismissed once and consumes on read", () => {
    expect(consumeAccountTypePickerDismissed()).toBe(false);
    markAccountTypePickerDismissed();
    expect(consumeAccountTypePickerDismissed()).toBe(true);
    expect(consumeAccountTypePickerDismissed()).toBe(false);
  });
});
