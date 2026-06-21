export type {
  AccountRelationship,
  AccountRelationshipType,
  DbAccountRelationship,
} from "@/lib/finance/account-relationships/types";
export {
  isTableBackedRelationshipType,
  TABLE_BACKED_RELATIONSHIP_TYPES,
} from "@/lib/finance/account-relationships/types";

export {
  getAllowedSourceTypes,
  canConfigureRelationshipSource,
  validateRelationshipAccounts,
} from "@/lib/finance/account-relationships/validation";
export type { RelationshipAccountSnapshot } from "@/lib/finance/account-relationships/validation";

export {
  getRelationship,
  setRelationship,
  removeRelationship,
} from "@/lib/finance/account-relationships/service";

export {
  getInterestDestinationAccount,
  getCreditCardPaymentSource,
  getLoanPaymentSource,
} from "@/lib/finance/account-relationships/queries";

export {
  readInterestDestinationRelationship,
  writeInterestDestinationRelationship,
  clearInterestDestinationRelationship,
} from "@/lib/finance/account-relationships/adapters/interest-destination";

export {
  legacyInterestRelationshipId,
  mapAccountRelationship,
} from "@/lib/finance/account-relationships/mappers";
