"use client";

/**
 * DEV ONLY — UI for Certificates QA seed scenarios.
 * Delete this file before production release.
 */
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  runCertificateQaSeed,
  type CertificateQaSeedScenario,
} from "@/dev/certificates-qa-seed";
import { useFinance } from "@/lib/finance/store";
import { logSupabaseError } from "@/lib/supabase/errors";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const SCENARIOS: { id: CertificateQaSeedScenario; label: string }[] = [
  { id: "active-one-year", label: "Active — 1 year" },
  { id: "active-three-years", label: "Active — 3 years" },
  { id: "matured", label: "Matured" },
  { id: "multi-institution", label: "Multi-institution (×3)" },
  { id: "large-principal", label: "Large principal" },
  { id: "arabic", label: "Arabic names (×2)" },
  { id: "all", label: "Seed all scenarios" },
];

export function CertificatesQaDevPanel() {
  const { user } = useAuth();
  const { refresh } = useFinance();
  const { showToast } = useToast();
  const [running, setRunning] = useState<CertificateQaSeedScenario | null>(null);

  async function handleSeed(scenario: CertificateQaSeedScenario) {
    if (!user?.id) {
      showToast("Sign in to seed QA data");
      return;
    }

    setRunning(scenario);
    try {
      const count = await runCertificateQaSeed(user.id, scenario);
      await refresh();
      showToast(`Seeded ${count} certificate(s)`);
    } catch (error) {
      logSupabaseError("certificateQaSeed", error);
      showToast("Seed failed — check console");
    } finally {
      setRunning(null);
    }
  }

  return (
    <Card className="mt-6 border-dashed border-amber-500/50 bg-amber-500/5 p-4 shadow-none">
      <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
        Dev — Certificates QA
      </p>
      <p className="mt-1 text-[0.8125rem] text-muted-foreground">
        Temporary seed helper for founder QA. Not included in production builds.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {SCENARIOS.map((scenario) => (
          <Button
            key={scenario.id}
            variant="outline"
            className="h-10 justify-start text-sm"
            disabled={running !== null}
            onClick={() => void handleSeed(scenario.id)}
          >
            {running === scenario.id ? "Seeding…" : scenario.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
