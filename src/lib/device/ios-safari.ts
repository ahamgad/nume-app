/** True on iPhone, iPad, and iPod — includes iOS PWAs and Safari. */
export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;

  const { userAgent, platform, maxTouchPoints } = window.navigator;
  const isClassicIos = /iPad|iPhone|iPod/.test(userAgent);
  const isIpadOs =
    platform === "MacIntel" &&
    maxTouchPoints > 1 &&
    !("MSStream" in window);

  return isClassicIos || isIpadOs;
}
