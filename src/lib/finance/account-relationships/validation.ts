import type { AccountRelationshipType } from "@/lib/finance/account-relationships/types";
import { canReceiveTransfers } from "@/lib/finance/account-capabilities";
import type { Account, AccountType } from "@/lib/finance/types";

export interface RelationshipAccountSnapshot {
  id: string;
  type: AccountType;
  status: Account["status"];
}

const RELATIONSHIP_SOURCE_TYPES: Record<
  AccountRelationshipType,
  readonly AccountType[]
> = {
  interest_destination: ["savings_account", "certificate"],
  credit_card_payment_source: ["credit_card"],
  loan_payment_source: ["loan"],
};

export function getAllowedSourceTypes(
  relationshipType: AccountRelationshipType,
): readonly AccountType[] {
  return RELATIONSHIP_SOURCE_TYPES[relationshipType];
}

export function canConfigureRelationshipSource(
  account: Pick<Account, "type">,
  relationshipType: AccountRelationshipType,
): boolean {
  return RELATIONSHIP_SOURCE_TYPES[relationshipType].includes(account.type);
}

/** Validates a source/target pair without database access. */
export function validateRelationshipAccounts(
  source: RelationshipAccountSnapshot,
  target: RelationshipAccountSnapshot,
  relationshipType: AccountRelationshipType,
): void {
  if (source.id === target.id) {
    throw new Error("Relationship accounts cannot be the same account");
  }

  if (source.status !== "active") {
    throw new Error("Source account must be active");
  }

  if (target.status !== "active") {
    throw new Error("Target account must be active");
  }

  if (!canConfigureRelationshipSource(source, relationshipType)) {
    throw new Error("Source account type cannot configure this relationship");
  }

  if (!canReceiveTransfers(target)) {
    throw new Error("Target account cannot receive transfers");
  }
}
