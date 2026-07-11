#!/usr/bin/env node
/**
 * Deploy the OTP email template to Supabase Auth (magic_link template).
 *
 * Requires:
 * - SUPABASE_ACCESS_TOKEN
 * - SUPABASE_PROJECT_REF (defaults to linked project ref)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { OTP_EMAIL_SUBJECT } from "../src/lib/email/otp-email-template.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ?? "otiwexvgrorwinrjblun";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function main() {
  if (!ACCESS_TOKEN) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is required to deploy the OTP email template.",
    );
  }

  const template = await readFile(
    path.join(ROOT, "emails", "otp", "template.html"),
    "utf8",
  );

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
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
