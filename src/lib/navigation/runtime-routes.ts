/** Public landing — distribution, not application. */
export const DISTRIBUTION_PATH = "/" as const;

/** Application runtime only — install gate applies in browser. */
const APPLICATION_ROUTE_PREFIXES = [
  "/continue",
  "/splash",
  "/splash-debug",
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
  return false;
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
    transport: [] as const,
    application: APPLICATION_ROUTE_PREFIXES,
  };
}
