import type {
  AccountRelationship,
  DbAccountRelationship,
} from "@/lib/finance/account-relationships/types";

export function mapAccountRelationship(
  row: DbAccountRelationship,
): AccountRelationship {
  return {
    id: row.id,
    userId: row.user_id,
    sourceAccountId: row.source_account_id,
    targetAccountId: row.target_account_id,
    relationshipType: row.relationship_type,
    createdAt: row.created_at,
  };
}

/** Stable id for interest relationships read from legacy extension columns. */
export function legacyInterestRelationshipId(sourceAccountId: string): string {
  return `legacy:${sourceAccountId}:interest_destination`;
}
