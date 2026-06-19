import type { CertificateStatus } from "@/lib/certificates/types";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export type AccountDetailHeaderStatus =
  | "active"
  | "archived"
  | "matured"
  | "renewed"
  | "closed";

export type AccountDetailHeaderStatusTone =
  | "neutral"
  | "positive"
  | "warning"
  | "info"
  | "inactive";

const STATUS_LABEL_KEYS: Record<AccountDetailHeaderStatus, TranslationKey> = {
  active: "common.active",
  archived: "accounts.status.archived",
  matured: "certificates.status.matured",
  renewed: "certificates.status.renewed",
  closed: "certificates.status.closed",
};

const STATUS_TONES: Record<AccountDetailHeaderStatus, AccountDetailHeaderStatusTone> =
  {
    active: "positive",
    archived: "inactive",
    matured: "warning",
    renewed: "info",
    closed: "inactive",
  };

export function getAccountHeaderStatusLabelKey(
  status: AccountDetailHeaderStatus,
): TranslationKey {
  return STATUS_LABEL_KEYS[status];
}

export function getAccountHeaderStatusTone(
  status: AccountDetailHeaderStatus,
): AccountDetailHeaderStatusTone {
  return STATUS_TONES[status];
}

export function getAccountHeaderStatusFromAccount(
  account: Pick<Account, "status">,
): AccountDetailHeaderStatus {
  return account.status === "archived" ? "archived" : "active";
}

export function getAccountHeaderStatusFromCertificate(
  status: CertificateStatus,
): AccountDetailHeaderStatus {
  return status;
}
