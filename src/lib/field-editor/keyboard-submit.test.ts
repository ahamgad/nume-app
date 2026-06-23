import { describe, expect, it, vi } from "vitest";

import {
  createFieldEditorKeyboardSubmitDebouncer,
  isFieldEditorKeyboardSubmitKey,
  shouldFieldEditorSubmitOnBlur,
} from "@/lib/field-editor/keyboard-submit";

describe("isFieldEditorKeyboardSubmitKey", () => {
  it("treats Enter as submit", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "Enter", shiftKey: false })).toBe(
      true,
    );
  });

  it("treats legacy keyCode 13 as submit", () => {
    expect(
      isFieldEditorKeyboardSubmitKey({ key: "", shiftKey: false, keyCode: 13 }),
    ).toBe(true);
  });

  it("ignores Shift+Enter for newline", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "Enter", shiftKey: true })).toBe(
      false,
    );
  });

  it("ignores other keys", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "a", shiftKey: false })).toBe(
      false,
    );
  });
});

describe("shouldFieldEditorSubmitOnBlur", () => {
  it("submits on blur when not discarding", () => {
    expect(shouldFieldEditorSubmitOnBlur(false)).toBe(true);
  });

  it("skips blur submit when discarding the sheet", () => {
    expect(shouldFieldEditorSubmitOnBlur(true)).toBe(false);
  });
});

describe("createFieldEditorKeyboardSubmitDebouncer", () => {
  it("debounces rapid duplicate submit signals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const onSubmit = vi.fn();
    const submit = createFieldEditorKeyboardSubmitDebouncer(onSubmit);

    submit();
    submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);

    vi.setSystemTime(400);
    submit();

    expect(onSubmit).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
