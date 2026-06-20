import { describe, expect, it } from "vitest";

import {
  accountsListHref,
  parseAccountsListFilter,
  resolveAccountsListFilter,
} from "@/lib/accounts/accounts-list-filter";

describe("accounts list filter", () => {
  it("parses archived from search params", () => {
    expect(
      parseAccountsListFilter(new URLSearchParams("filter=archived")),
    ).toBe("archived");
    expect(parseAccountsListFilter(new URLSearchParams("filter=active"))).toBe(
      "active",
    );
    expect(parseAccountsListFilter(new URLSearchParams())).toBeNull();
  });

  it("builds hrefs for active and archived tabs", () => {
    expect(accountsListHref("active")).toBe("/accounts");
    expect(accountsListHref("archived")).toBe("/accounts?filter=archived");
  });

  it("prefers URL filter when present", () => {
    expect(
      resolveAccountsListFilter(new URLSearchParams("filter=archived")),
    ).toBe("archived");
  });
});
