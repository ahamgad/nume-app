/**
 * DEV ONLY — Certificates Founder QA seed scenarios.
 * Delete this file (and certificates-qa-dev-panel.tsx) before production release.
 */
import { createCertificate, updateCertificate } from "@/lib/certificates/service";
import type { CreateCertificateInput } from "@/lib/certificates/types";
import { offsetLocalIsoDate } from "@/lib/format/date";
import { createClient } from "@/lib/supabase/client";

export type CertificateQaSeedScenario =
  | "active-one-year"
  | "active-three-years"
  | "matured"
  | "multi-institution"
  | "large-principal"
  | "arabic"
  | "all";

async function seedOne(
  userId: string,
  input: CreateCertificateInput,
  afterCreate?: (certificateId: string) => Promise<void>,
) {
  const supabase = createClient();
  const certificate = await createCertificate(supabase, userId, input);
  if (afterCreate) {
    await afterCreate(certificate.id);
  }
  return certificate;
}

export async function runCertificateQaSeed(
  userId: string,
  scenario: CertificateQaSeedScenario,
): Promise<number> {
  const scenarios =
    scenario === "all"
      ? ([
          "active-one-year",
          "active-three-years",
          "matured",
          "multi-institution",
          "large-principal",
          "arabic",
        ] as const)
      : [scenario];

  let created = 0;

  for (const item of scenarios) {
    switch (item) {
      case "active-one-year":
        await seedOne(userId, {
          name: "QA — 1 Year CD",
          institution: "National Bank of Egypt",
          principalAmount: 100_000,
          annualInterestRate: 18,
          purchaseDate: offsetLocalIsoDate(-30),
          termMonths: 12,
          payoutFrequency: "at_maturity",
        });
        created += 1;
        break;

      case "active-three-years":
        await seedOne(userId, {
          name: "QA — 3 Year Deposit",
          institution: "CIB",
          principalAmount: 250_000,
          annualInterestRate: 16.5,
          purchaseDate: offsetLocalIsoDate(-60),
          termMonths: 36,
          payoutFrequency: "annual",
        });
        created += 1;
        break;

      case "matured":
        await seedOne(
          userId,
          {
            name: "QA — Matured Certificate",
            institution: "Banque Misr",
            principalAmount: 75_000,
            annualInterestRate: 15,
            purchaseDate: offsetLocalIsoDate(-400),
            termMonths: 12,
            payoutFrequency: "at_maturity",
          },
          async (certificateId) => {
            const supabase = createClient();
            await updateCertificate(supabase, userId, certificateId, {
              status: "matured",
            });
          },
        );
        created += 1;
        break;

      case "multi-institution":
        await seedOne(userId, {
          name: "QA — NBE 2Y",
          institution: "National Bank of Egypt",
          principalAmount: 50_000,
          annualInterestRate: 17,
          purchaseDate: offsetLocalIsoDate(-10),
          termMonths: 24,
          payoutFrequency: "quarterly",
        });
        await seedOne(userId, {
          name: "QA — CIB 1Y",
          institution: "CIB",
          principalAmount: 80_000,
          annualInterestRate: 18.25,
          purchaseDate: offsetLocalIsoDate(-5),
          termMonths: 12,
          payoutFrequency: "semi_annual",
        });
        await seedOne(userId, {
          name: "QA — HSBC 5Y",
          institution: "HSBC Egypt",
          principalAmount: 120_000,
          annualInterestRate: 14,
          purchaseDate: offsetLocalIsoDate(-90),
          termMonths: 60,
          payoutFrequency: "annual",
        });
        created += 3;
        break;

      case "large-principal":
        await seedOne(userId, {
          name: "QA — Large Principal",
          institution: "National Bank of Egypt",
          principalAmount: 99_999_999.99,
          annualInterestRate: 12,
          purchaseDate: offsetLocalIsoDate(-15),
          termMonths: 12,
          payoutFrequency: "at_maturity",
        });
        created += 1;
        break;

      case "arabic":
        await seedOne(userId, {
          name: "شهادة ادخار — سنة واحدة",
          institution: "البنك الأهلي المصري",
          principalAmount: 500_000,
          annualInterestRate: 19,
          purchaseDate: offsetLocalIsoDate(-20),
          termMonths: 12,
          payoutFrequency: "at_maturity",
        });
        await seedOne(userId, {
          name: "وديعة لأجل — ٣ سنوات",
          institution: "بنك مصر",
          principalAmount: 1_250_000,
          annualInterestRate: 16,
          purchaseDate: offsetLocalIsoDate(-45),
          termMonths: 36,
          payoutFrequency: "quarterly",
        });
        created += 2;
        break;
    }
  }

  return created;
}
