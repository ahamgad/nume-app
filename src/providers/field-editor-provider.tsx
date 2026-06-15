"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FieldEditorBottomSheet } from "@/components/field-editor/field-editor-bottom-sheet";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";

interface FieldEditorContextValue {
  openFieldEditor: (config: FieldEditorOpenConfig) => void;
  closeFieldEditor: () => void;
  isFieldEditorOpen: boolean;
}

const FieldEditorContext = createContext<FieldEditorContextValue | null>(null);

export function FieldEditorProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<
    (FieldEditorOpenConfig & { id: number }) | null
  >(null);
  const sessionIdRef = useRef(0);

  const closeFieldEditor = useCallback(() => {
    setSession(null);
  }, []);

  const openFieldEditor = useCallback((config: FieldEditorOpenConfig) => {
    sessionIdRef.current += 1;
    setSession({ ...config, id: sessionIdRef.current });
  }, []);

  const value = useMemo(
    () => ({
      openFieldEditor,
      closeFieldEditor,
      isFieldEditorOpen: session !== null,
    }),
    [closeFieldEditor, openFieldEditor, session],
  );

  return (
    <FieldEditorContext.Provider value={value}>
      {children}
      {session ? (
        <FieldEditorBottomSheet
          key={session.id}
          config={session}
          onDismiss={closeFieldEditor}
        />
      ) : null}
    </FieldEditorContext.Provider>
  );
}

export function useFieldEditor() {
  const context = useContext(FieldEditorContext);
  if (!context) {
    throw new Error("useFieldEditor must be used within FieldEditorProvider");
  }
  return context;
}
