import { ChevronRight } from "lucide-react";

import { CARD_CHEVRON_CLASS } from "@/lib/layout/account-card-chrome";
import { cn } from "@/lib/utils";

interface CardChevronProps {
  className?: string;
}

/**
 * Trailing chevron for card-based selection surfaces.
 * Account Cards foundation is the visual source of truth.
 *
 * @see docs/FOUNDATION.md — Account cards foundation, Account type picker sheet foundation
 */
export function CardChevron({ className }: CardChevronProps) {
  return (
    <ChevronRight className={cn(CARD_CHEVRON_CLASS, className)} aria-hidden />
  );
}
