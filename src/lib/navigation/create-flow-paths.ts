/** Routes that represent fresh create flows — scroll should reset on every entry. */
const FRESH_CREATE_FLOW_PATTERNS = [
  /^\/accounts\/new(\/|$)/,
  /^\/accounts\/[^/]+\/activity\/new(\/|$)/,
  /^\/accounts\/[^/]+\/records\/new(\/|$)/,
];

export function isFreshCreateFlowPath(pathname: string): boolean {
  return FRESH_CREATE_FLOW_PATTERNS.some((pattern) => pattern.test(pathname));
}
