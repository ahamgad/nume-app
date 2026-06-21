import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";

import type { RecordType } from "@/lib/finance/types";

const INFLOW_TYPES = new Set<RecordType>([
  "income",
  "interest",
  "credit_card_payment",
]);

const OUTFLOW_TYPES = new Set<RecordType>([
  "expense",
  "credit_card_purchase",
]);

/** Unified record icon colors across lists, details, and dashboard. */
export function RecordTypeIcon({ type }: { type: RecordType }) {
  if (INFLOW_TYPES.has(type)) {
    return <ArrowDownLeft className="size-4 text-emerald-600" />;
  }
  if (OUTFLOW_TYPES.has(type)) {
    return <ArrowUpRight className="size-4 text-destructive" />;
  }
  return <ArrowLeftRight className="size-4 text-muted-foreground" />;
}
