"use client";

import Link from "next/link";

import { isDevEnvironment } from "@/dev/is-dev-environment";
import { Button } from "@/components/ui/button";

/** Development-only entry to the Auth V2 preview route. Not mounted on legacy login. */
export function AuthV2DevEntry() {
  if (!isDevEnvironment) {
    return null;
  }

  return (
    <div className="border-t border-border px-4 py-4">
      <p className="mb-3 text-xs text-muted-foreground">
        Auth V2 preview — development builds only
      </p>
      <Button variant="outline" className="h-11 w-full" asChild>
        <Link href="/continue">Continue with email</Link>
      </Button>
    </div>
  );
}
