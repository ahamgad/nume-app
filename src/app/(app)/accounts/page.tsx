import { Suspense } from "react";

import { AccountsListSkeleton } from "@/components/accounts/accounts-list-skeleton";
import { AccountsListScreen } from "@/components/screens/accounts-list-screen";
import { ScreenBody } from "@/components/layout/screen-header";

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <ScreenBody withTabBar>
          <AccountsListSkeleton />
        </ScreenBody>
      }
    >
      <AccountsListScreen />
    </Suspense>
  );
}
