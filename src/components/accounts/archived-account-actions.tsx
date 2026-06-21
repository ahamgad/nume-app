"use client";

import { Button } from "@/components/ui/button";

interface ArchivedAccountActionsProps {
  restoreLabel: string;
  restoreLoadingLabel: string;
  deleteLabel: string;
  restoring?: boolean;
  deleting?: boolean;
  onRestore: () => void;
  onDelete: () => void;
}

export function ArchivedAccountActions({
  restoreLabel,
  restoreLoadingLabel,
  deleteLabel,
  restoring = false,
  deleting = false,
  onRestore,
  onDelete,
}: ArchivedAccountActionsProps) {
  const busy = restoring || deleting;

  return (
    <div className="flex flex-col gap-3">
      <Button className="h-11 w-full" disabled={busy} onClick={onRestore}>
        {restoring ? restoreLoadingLabel : restoreLabel}
      </Button>
      <Button
        variant="outline"
        className="h-11 w-full text-destructive hover:text-destructive"
        disabled={busy}
        onClick={onDelete}
      >
        {deleteLabel}
      </Button>
    </div>
  );
}
