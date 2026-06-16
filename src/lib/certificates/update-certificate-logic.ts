import type { UpdateCertificateInput } from "@/lib/certificates/types";

const CERTIFICATE_ROW_FIELDS: Array<keyof UpdateCertificateInput> = [
  "name",
  "institution",
  "principalAmount",
  "annualInterestRate",
  "purchaseDate",
  "termMonths",
  "payoutFrequency",
  "destinationAccountId",
  "autoApply",
  "renewalType",
  "status",
];

/** Whether updateCertificate should write to the certificates table. */
export function hasCertificateRowUpdates(input: UpdateCertificateInput): boolean {
  return CERTIFICATE_ROW_FIELDS.some((field) => input[field] !== undefined);
}
