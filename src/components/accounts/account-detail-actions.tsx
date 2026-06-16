"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AccountDetailActionsProps {
  editLabel: string;
  archiveLabel: string;
  disabled?: boolean;
  onEdit: () => void;
  onArchive: () => void;
}

export function AccountDetailActions({
  editLabel,
  archiveLabel,
  disabled = false,
  onEdit,
  onArchive,
}: AccountDetailActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="h-11 flex-1"
        disabled={disabled}
        onClick={onEdit}
      >
        <Pencil className="me-2 size-4" />
        {editLabel}
      </Button>
      <Button
        variant="outline"
        className="h-11 flex-1 text-destructive hover:text-destructive"
        disabled={disabled}
        onClick={onArchive}
      >
        {archiveLabel}
      </Button>
    </div>
  );
}
