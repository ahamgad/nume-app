"use client";

/**
 * Picker list building blocks (frozen).
 * All bottom-sheet picker lists must compose through these exports.
 * @see docs/FOUNDATION.md § 3
 */

import {
  Children,
  Fragment,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  PICKER_LIST_DIVIDER_GAP_CLASS,
  PICKER_LIST_DIVIDER_LINE_CLASS,
  pickerOptionRowClassName,
} from "@/lib/layout/picker-option-row";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

export {
  PICKER_LIST_DIVIDER_GAP_CLASS,
  PICKER_LIST_DIVIDER_LINE_CLASS,
  PICKER_OPTION_ROW_CLASS,
  pickerOptionRowClassName,
} from "@/lib/layout/picker-option-row";

/** i18n key for the unified optional-picker None row. */
export const PICKER_NONE_LABEL_KEY = "picker.none" satisfies TranslationKey;

interface PickerListProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}

/** Listbox container — inserts dividers between every direct child row. */
export function PickerList({ children, ariaLabel, className }: PickerListProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];

  return (
    <div role="listbox" aria-label={ariaLabel} className={cn("flex flex-col", className)}>
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 ? <PickerListDivider /> : null}
          {child}
        </Fragment>
      ))}
    </div>
  );
}

/** Divider between picker rows — 2px gap above and below the line. */
export function PickerListDivider({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(PICKER_LIST_DIVIDER_GAP_CLASS, className)}
    >
      <div className={PICKER_LIST_DIVIDER_LINE_CLASS} />
    </div>
  );
}

interface PickerListOptionProps extends Omit<ComponentProps<"button">, "className"> {
  selected?: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}

/** Single selectable picker row — zero corner radius, shared interaction styles. */
export function PickerListOption({
  selected = false,
  onSelect,
  children,
  className,
  type = "button",
  ...props
}: PickerListOptionProps) {
  return (
    <button
      type={type}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(pickerOptionRowClassName(selected), className)}
      {...props}
    >
      {children}
    </button>
  );
}

interface PickerListNoneOptionProps {
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

/** Unified first-row None option for optional pickers. */
export function PickerListNoneOption({
  selected,
  onSelect,
  className,
}: PickerListNoneOptionProps) {
  const t = useT();

  return (
    <PickerListOption
      selected={selected}
      onSelect={onSelect}
      className={className}
    >
      {t(PICKER_NONE_LABEL_KEY)}
    </PickerListOption>
  );
}

/** Whether the unified None row should remain visible while searching. */
export function shouldShowPickerNoneOption(
  optional: boolean,
  searchQuery: string,
  showSearch: boolean,
  noneLabel: string,
): boolean {
  if (!optional) return false;
  if (!showSearch) return true;
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;
  return noneLabel.toLowerCase().includes(query);
}
