/** Add Account flows — always open at the top, never restore scroll. */
const ADD_ACCOUNT_FLOW_PATTERN = /^\/accounts\/new(\/|$)/;

const ACCOUNT_ACTIVITY_CREATE_PATTERN = /^\/accounts\/[^/]+\/activity\/new(\/|$)/;
const ACCOUNT_RECORD_CREATE_PATTERN = /^\/accounts\/[^/]+\/records\/new(\/|$)/;

export function isAddAccountFlowPath(pathname: string): boolean {
  return ADD_ACCOUNT_FLOW_PATTERN.test(pathname);
}

/** Routes that represent fresh create flows — scroll should reset on every entry. */
export function isFreshCreateFlowPath(pathname: string): boolean {
  return (
    isAddAccountFlowPath(pathname) ||
    ACCOUNT_ACTIVITY_CREATE_PATTERN.test(pathname) ||
    ACCOUNT_RECORD_CREATE_PATTERN.test(pathname)
  );
}
