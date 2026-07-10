import { redirect } from "next/navigation";

import { LandingScreen } from "@/components/screens/landing-screen";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    redirect("/dashboard");
  }

  if (user) {
    redirect("/verify-email");
  }

  return <LandingScreen />;
}
