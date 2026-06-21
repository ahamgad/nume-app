/** Routes that represent fresh create flows — scroll should reset on entry. */
const FRESH_CREATE_FLOW_PATTERN = /^\/accounts\/new(\/|$)/;

export function isFreshCreateFlowPath(pathname: string): boolean {
  return FRESH_CREATE_FLOW_PATTERN.test(pathname);
}
