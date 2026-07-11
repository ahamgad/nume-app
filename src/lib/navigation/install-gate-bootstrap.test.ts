import { describe, expect, it } from "vitest";

import { getInstallGateBootstrapScript } from "@/lib/navigation/install-gate-bootstrap";

describe("getInstallGateBootstrapScript", () => {
  it("redirects unsupported browser runtimes on application routes to landing", () => {
    const script = getInstallGateBootstrapScript();

    expect(script).toContain('location.replace("/")');
    expect(script).toContain("/continue");
    expect(script).toContain('if(p==="/")return');
  });
});
