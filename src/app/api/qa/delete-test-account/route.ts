import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isQaToolEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.QA_TOOLS_ENABLED === "true"
  );
}

export async function POST() {
  if (!isQaToolEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // App data is keyed by auth.users(id) with ON DELETE CASCADE in migrations.
  // Deleting the auth user deletes all user-owned data.
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

