/** Public landing — distribution, not application. */
export const DISTRIBUTION_PATH = "/" as const;

/** External entry: validation and callbacks only — not gated. */
const TRANSPORT_ROUTE_PREFIXES = [
  "/verify-email",
  "/reset-password",
  "/auth/callback",
] as const;

/** Application runtime only — install gate applies in browser. */
const APPLICATION_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/splash",
  "/dashboard",
  "/planning",
  "/accounts",
  "/goals",
  "/more",
] as const;

export function isDistributionRoute(pathname: string): boolean {
  return pathname === DISTRIBUTION_PATH;
}

export function isTransportRoute(pathname: string): boolean {
  return TRANSPORT_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isApplicationRoute(pathname: string): boolean {
  if (isDistributionRoute(pathname) || isTransportRoute(pathname)) {
    return false;
  }

  return APPLICATION_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Paths encoded in the pre-paint install gate bootstrap script. */
export function getInstallGateBootstrapPaths() {
  return {
    distribution: DISTRIBUTION_PATH,
    transport: TRANSPORT_ROUTE_PREFIXES,
    application: APPLICATION_ROUTE_PREFIXES,
  };
}
