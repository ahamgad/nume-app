import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

let renewalTypeColumnAvailable: boolean | null = null;

export function isMissingRenewalTypeColumnError(error: unknown): boolean {
  const message = getSupabaseErrorMessage(error).toLowerCase();
  return (
    message.includes("renewal_type") &&
    (message.includes("pgrst204") ||
      message.includes("schema cache") ||
      message.includes("could not find"))
  );
}

export function logCertificateMigrationWarning(): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    "[certificates] The renewal_type column is missing. Apply supabase/migrations/006_certificate_recurring_engine.sql to your Supabase project, then reload the PostgREST schema cache if needed.",
  );
}

export async function supportsRenewalTypeColumn(
  supabase: SupabaseClient,
): Promise<boolean> {
  if (renewalTypeColumnAvailable !== null) {
    return renewalTypeColumnAvailable;
  }

  const { error } = await supabase
    .from("certificates")
    .select("renewal_type")
    .limit(1);

  if (!error) {
    renewalTypeColumnAvailable = true;
    return true;
  }

  if (isMissingRenewalTypeColumnError(error)) {
    renewalTypeColumnAvailable = false;
    logCertificateMigrationWarning();
    return false;
  }

  renewalTypeColumnAvailable = true;
  return true;
}

export function resetRenewalTypeColumnCacheForTests(): void {
  renewalTypeColumnAvailable = null;
}
