import { describe, expect, it } from "vitest";

import { legacyInterestRelationshipId } from "@/lib/finance/account-relationships/mappers";
import {
  getRelationship,
  removeRelationship,
  setRelationship,
} from "@/lib/finance/account-relationships/service";
import { isTableBackedRelationshipType } from "@/lib/finance/account-relationships/types";

describe("account relationship service routing", () => {
  it("identifies table-backed relationship types", () => {
    expect(isTableBackedRelationshipType("credit_card_payment_source")).toBe(
      true,
    );
    expect(isTableBackedRelationshipType("loan_payment_source")).toBe(true);
    expect(isTableBackedRelationshipType("interest_destination")).toBe(false);
  });

  it("reads and writes table-backed relationships", async () => {
    const rows: Record<string, unknown>[] = [];
    let idCounter = 0;

    const supabase = {
      from(table: string) {
        if (table === "accounts") {
          return {
            select: () => ({
              eq: (col: string, val: string) => ({
                eq: () => ({
                  maybeSingle: async () => {
                    if (col === "id" && val === "cc-1") {
                      return {
                        data: {
                          id: "cc-1",
                          account_type: "credit_card",
                          status: "active",
                        },
                        error: null,
                      };
                    }
                    if (col === "id" && val === "ca-1") {
                      return {
                        data: {
                          id: "ca-1",
                          account_type: "current_account",
                          status: "active",
                        },
                        error: null,
                      };
                    }
                    return { data: null, error: null };
                  },
                }),
              }),
            }),
          };
        }

        if (table === "account_relationships") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: rows[0] ?? null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
            insert: (payload: Record<string, unknown>) => ({
              select: () => ({
                single: async () => {
                  const row = {
                    id: `rel-${++idCounter}`,
                    created_at: "2026-06-21T00:00:00.000Z",
                    ...payload,
                  };
                  rows.length = 0;
                  rows.push(row);
                  return { data: row, error: null };
                },
              }),
            }),
            update: (payload: Record<string, unknown>) => ({
              eq: () => ({
                eq: () => ({
                  select: () => ({
                    single: async () => {
                      rows[0] = { ...rows[0], ...payload };
                      return { data: rows[0], error: null };
                    },
                  }),
                }),
              }),
            }),
            delete: () => ({
              eq: () => ({
                eq: () => ({
                  eq: async () => {
                    rows.length = 0;
                    return { error: null };
                  },
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    };

    const created = await setRelationship(
      supabase as never,
      "user-1",
      "cc-1",
      "ca-1",
      "credit_card_payment_source",
    );

    expect(created.sourceAccountId).toBe("cc-1");
    expect(created.targetAccountId).toBe("ca-1");
    expect(created.relationshipType).toBe("credit_card_payment_source");

    const loaded = await getRelationship(
      supabase as never,
      "user-1",
      "cc-1",
      "credit_card_payment_source",
    );
    expect(loaded?.targetAccountId).toBe("ca-1");

    await removeRelationship(
      supabase as never,
      "user-1",
      "cc-1",
      "credit_card_payment_source",
    );

    const afterRemove = await getRelationship(
      supabase as never,
      "user-1",
      "cc-1",
      "credit_card_payment_source",
    );
    expect(afterRemove).toBeNull();
  });
});

describe("legacy interest relationship ids", () => {
  it("uses stable synthetic ids for adapter reads", () => {
    expect(legacyInterestRelationshipId("acc-1")).toBe(
      "legacy:acc-1:interest_destination",
    );
  });
});
