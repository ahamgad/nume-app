import { describe, expect, it } from "vitest";

import { makeCreditCardPayment } from "@/lib/credit-cards/service";

describe("makeCreditCardPayment record inserts", () => {
  it("creates credit_card_payment on the card and transfer on the source", async () => {
    const insertedRecords: Record<string, unknown>[] = [];

    const supabase = {
      from(table: string) {
        if (table === "accounts") {
          return {
            select: () => ({
              eq: (col: string, val: string) => ({
                eq: () => ({
                  maybeSingle: async () => {
                    if (col === "id" && val === "cc-account") {
                      return {
                        data: {
                          id: "cc-account",
                          user_id: "user-1",
                          account_type: "credit_card",
                          name: "Card",
                          institution: null,
                          account_number_last4: null,
                          current_balance: -500,
                          include_in_net_worth: true,
                          include_in_emergency_fund: false,
                          status: "active",
                          created_at: "2026-06-01T00:00:00.000Z",
                          updated_at: "2026-06-01T00:00:00.000Z",
                        },
                        error: null,
                      };
                    }
                    if (col === "id" && val === "current-account") {
                      return {
                        data: {
                          id: "current-account",
                          user_id: "user-1",
                          account_type: "current_account",
                          name: "Current",
                          institution: null,
                          account_number_last4: null,
                          current_balance: 10_000,
                          include_in_net_worth: true,
                          include_in_emergency_fund: false,
                          status: "active",
                          created_at: "2026-06-01T00:00:00.000Z",
                          updated_at: "2026-06-01T00:00:00.000Z",
                        },
                        error: null,
                      };
                    }
                    return { data: null, error: null };
                  },
                }),
              }),
            }),
            update: () => ({
              eq: () => ({
                eq: async () => ({ error: null }),
              }),
            }),
          };
        }

        if (table === "credit_cards") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: "cc-row",
                      user_id: "user-1",
                      account_id: "cc-account",
                      card_number_last4: "1234",
                      statement_close_day: 1,
                      payment_due_day: 15,
                      credit_limit: null,
                      created_at: "2026-06-01T00:00:00.000Z",
                      updated_at: "2026-06-01T00:00:00.000Z",
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "records") {
          return {
            insert: (payload: Record<string, unknown>) => {
              insertedRecords.push(payload);
              return {
                select: () => ({
                  single: async () => ({
                    data: {
                      id: `rec-${insertedRecords.length}`,
                      created_at: "2026-06-01T00:00:00.000Z",
                      ...payload,
                    },
                    error: null,
                  }),
                }),
              };
            },
          };
        }

        if (table === "account_relationships") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "savings_accounts") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    };

    await makeCreditCardPayment(
      supabase as never,
      "user-1",
      "cc-account",
      {
        amount: 500,
        paymentSourceAccountId: "current-account",
        description: "Bill payment",
        date: "2026-06-15",
      },
    );

    expect(insertedRecords).toHaveLength(2);

    const cardPayment = insertedRecords[0];
    const sourceOutflow = insertedRecords[1];

    expect(cardPayment?.record_type).toBe("credit_card_payment");
    expect(cardPayment?.account_id).toBe("cc-account");
    expect(cardPayment?.amount).toBe(500);
    expect(cardPayment?.payment_source_account_id).toBe("current-account");

    expect(sourceOutflow?.record_type).toBe("transfer");
    expect(sourceOutflow?.account_id).toBe("current-account");
    expect(sourceOutflow?.amount).toBe(-500);
    expect(sourceOutflow?.credit_card_id).toBe("cc-row");
    expect(sourceOutflow?.record_type).not.toBe("expense");
  });
});
