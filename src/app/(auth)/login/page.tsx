import { Suspense } from "react";

import { LoginScreen } from "@/components/screens/auth-screens";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
