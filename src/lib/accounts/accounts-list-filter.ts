export type AccountsListFilter = "active" | "archived";

export const ACCOUNTS_LIST_FILTER_PARAM = "filter";

const STORAGE_KEY = "nume-accounts-filter";

export function parseAccountsListFilter(
  searchParams: Pick<URLSearchParams, "get">,
): AccountsListFilter | null {
  const value = searchParams.get(ACCOUNTS_LIST_FILTER_PARAM);
  if (value === "archived") return "archived";
  if (value === "active") return "active";
  return null;
}

export function getPersistedAccountsListFilter(): AccountsListFilter {
  if (typeof window === "undefined") return "active";
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  return stored === "archived" ? "archived" : "active";
}

export function persistAccountsListFilter(filter: AccountsListFilter) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, filter);
}

export function accountsListHref(filter: AccountsListFilter = "active"): string {
  if (filter === "archived") {
    return `/accounts?${ACCOUNTS_LIST_FILTER_PARAM}=archived`;
  }
  return "/accounts";
}

export function resolveAccountsListFilter(
  searchParams: Pick<URLSearchParams, "get" | "has">,
): AccountsListFilter {
  if (searchParams.has(ACCOUNTS_LIST_FILTER_PARAM)) {
    return parseAccountsListFilter(searchParams) ?? "active";
  }
  return getPersistedAccountsListFilter();
}
