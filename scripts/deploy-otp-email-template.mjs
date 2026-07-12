#!/usr/bin/env node
/**
 * Deploy the OTP email template to Supabase Auth (magic_link template).
 *
 * Token resolution (first match wins):
 * - SUPABASE_ACCESS_TOKEN
 * - Supabase CLI macOS keychain credential
 * - ~/.supabase/access-token
 *
 * Optional: SUPABASE_PROJECT_REF (defaults to linked project ref)
 */
import { execFileSync } from "node:child_process";
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OTP_EMAIL_SUBJECT = "Welcome to NUME";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ?? "otiwexvgrorwinrjblun";

async function resolveAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    return process.env.SUPABASE_ACCESS_TOKEN;
  }

  const tokenFile = path.join(os.homedir(), ".supabase", "access-token");
  try {
    await access(tokenFile, constants.R_OK);
    const token = (await readFile(tokenFile, "utf8")).trim();
    if (token) return token;
  } catch {
    // Fall through to keychain lookup.
  }

  if (process.platform === "darwin") {
    for (const service of ["Supabase CLI", "supabase"]) {
      try {
        const token = execFileSync(
          "security",
          ["find-generic-password", "-s", service, "-w"],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
        ).trim();
        if (token) return token;
      } catch {
        // Try the next credential service name.
      }
    }
  }

  throw new Error(
    "Supabase access token not found. Run `supabase login` or set SUPABASE_ACCESS_TOKEN.",
  );
}

async function main() {
  const accessToken = await resolveAccessToken();

  const template = await readFile(
    path.join(ROOT, "emails", "otp", "template.html"),
    "utf8",
  );

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mailer_subjects_magic_link: OTP_EMAIL_SUBJECT,
        mailer_templates_magic_link_content: template,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Supabase template deploy failed (${response.status}): ${body}`,
    );
  }

  console.log(`✓ Supabase magic_link template deployed to ${PROJECT_REF}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
