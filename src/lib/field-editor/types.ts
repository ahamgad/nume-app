export type FieldEditorMode = "text" | "numeric";

export type FieldEditorInputMode = "text" | "decimal" | "numeric";

export interface FieldEditorOpenConfig {
  mode: FieldEditorMode;
  /** Inline field label — bottom sheet header title (source of truth). */
  label?: string;
  /** @deprecated Use `label`. Normalized on open when `label` is omitted. */
  title?: string;
  value: string;
  placeholder?: string;
  inputMode?: FieldEditorInputMode;
  /** Numeric: sanitize raw keyboard input before updating draft. */
  sanitizeInput?: (raw: string) => string;
  /** Format draft for display in the editor input. */
  formatDisplay?: (value: string) => string;
  /** Prefix shown inside the editor (e.g. currency code). */
  prefixLabel?: string;
  /** Suffix shown inside the editor (e.g. %). */
  suffixLabel?: string;
  /** Account balance only — +/- chips above the editor input. */
  showSignToggle?: boolean;
  /** Return an error message to keep the sheet open; undefined when valid. */
  validate?: (value: string) => string | undefined;
  /** Called after validation passes on confirm. */
  onSave: (value: string) => void;
}

export interface FieldEditorSession extends FieldEditorOpenConfig {
  id: number;
}
