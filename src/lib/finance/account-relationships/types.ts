export type AccountRelationshipType =
  | "interest_destination"
  | "credit_card_payment_source"
  | "loan_payment_source";

/** Table-backed relationship (Credit Card / Loan) or adapter-sourced (interest). */
export interface AccountRelationship {
  id: string;
  userId: string;
  sourceAccountId: string;
  targetAccountId: string;
  relationshipType: AccountRelationshipType;
  createdAt: string;
}

export interface DbAccountRelationship {
  id: string;
  user_id: string;
  source_account_id: string;
  target_account_id: string;
  relationship_type: AccountRelationshipType;
  created_at: string;
}

/** Relationship types persisted in account_relationships (not legacy columns). */
export const TABLE_BACKED_RELATIONSHIP_TYPES = new Set<AccountRelationshipType>([
  "credit_card_payment_source",
  "loan_payment_source",
]);

export function isTableBackedRelationshipType(
  type: AccountRelationshipType,
): boolean {
  return TABLE_BACKED_RELATIONSHIP_TYPES.has(type);
}
