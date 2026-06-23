import { stripFieldEditorUnitLabels } from "@/lib/field-editor/editor-display";
import { sanitizeFieldEditorPlaceholder } from "@/lib/field-editor/placeholder";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";

/** Applies frozen field-editor rules to an open config before presenting the sheet. */
export function normalizeFieldEditorOpenConfig(
  config: FieldEditorOpenConfig,
): FieldEditorOpenConfig {
  const label = config.label ?? config.title;
  if (!label) {
    throw new Error("FieldEditorOpenConfig requires label or title");
  }

  return stripFieldEditorUnitLabels({
    ...config,
    label,
    title: label,
    placeholder: sanitizeFieldEditorPlaceholder(config.placeholder),
  });
}
