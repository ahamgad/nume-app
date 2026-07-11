import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { RootPageTitle } from "@/components/layout/stack-page-chrome";
import { WidgetCard } from "@/components/patterns";
import { useAuthViewportFrame } from "@/hooks/use-auth-viewport-frame";
import { ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS } from "@/lib/layout/account-form-chrome";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** 24px — same rhythm as {@link SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS}. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-6";
const AUTH_CARD_BASELINE_STORAGE_KEY = "nume:authCardBaselineHeight";

/** Matches iOS keyboard presentation timing. */
export const AUTH_KEYBOARD_FRAME_TRANSITION_CLASS =
  "transition-[height,transform] duration-[250ms] ease-out";

export function AuthBrandLogo() {
  const t = useT();

  return (
    <>
      <Image
        src="/brand-flatten-black.svg"
        alt={t("common.brandName")}
        width={48}
        height={48}
        className="dark:hidden"
        priority
      />
      <Image
        src="/brand-flatten-white.svg"
        alt={t("common.brandName")}
        width={48}
        height={48}
        className="hidden dark:block"
        priority
      />
    </>
  );
}

function handleAuthInputPointerDownCapture(
  event: ReactPointerEvent<HTMLDivElement>,
) {
  // Pre-focus stabilization: avoid Safari's focus-induced scroll nudge by
  // preventing the native focus action and re-focusing with preventScroll.
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const input = target.closest("input, textarea") as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  if (!input) return;
  if (input.disabled || input.readOnly) return;
  if (document.activeElement === input) return;

  // Only for touch-like pointer interactions (desktop should behave normally).
  if (event.pointerType && event.pointerType !== "touch") return;

  event.preventDefault();
  input.focus({ preventScroll: true });
}

function handleAuthRetainFocusPointerDown(
  event: ReactPointerEvent<HTMLDivElement>,
) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const active = document.activeElement;
  const focusedField =
    active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
  if (!focusedField) return;

  if (
    target.closest(
      "input, textarea, button, a, [role='button'], [role='link']",
    )
  ) {
    return;
  }

  event.preventDefault();
}

function useAuthKeyboardScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    function resetDocumentScroll() {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    }

    function preventTouchMove(event: TouchEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }
      // Allow caret movement / selection inside focused fields.
      if (target.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      event.preventDefault();
    }

    resetDocumentScroll();
    window.visualViewport?.addEventListener("resize", resetDocumentScroll);
    window.visualViewport?.addEventListener("scroll", resetDocumentScroll);
    window.addEventListener("scroll", resetDocumentScroll, { passive: true });
    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    return () => {
      window.visualViewport?.removeEventListener("resize", resetDocumentScroll);
      window.visualViewport?.removeEventListener("scroll", resetDocumentScroll);
      window.removeEventListener("scroll", resetDocumentScroll);
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [active]);
}

export function AuthLayout({ children }: { children: ReactNode }) {
  const frame = useAuthViewportFrame();
  useAuthKeyboardScrollLock(frame.keyboardVisible);

  const frameStyle: CSSProperties = {
    height: frame.height > 0 ? frame.height : "100dvh",
    transform: `translateY(${frame.offsetTop}px)`,
  };

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden bg-background",
        frame.keyboardVisible && "overscroll-none",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col px-4",
          "pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]",
          AUTH_KEYBOARD_FRAME_TRANSITION_CLASS,
        )}
        style={frameStyle}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-start",
            frame.keyboardVisible ? "pt-2" : "pt-8",
          )}
          onPointerDownCapture={(event) => {
            handleAuthInputPointerDownCapture(event);
            handleAuthRetainFocusPointerDown(event);
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  errorMessage?: string | null;
  /** Non-destructive status (e.g. email-send cooldown). Cleared by the screen when done. */
  statusMessage?: string | null;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Foundation card shell for authentication screens. */
export function AuthCard({
  title,
  errorMessage,
  statusMessage,
  header,
  children,
  footer,
  className,
  contentClassName,
}: AuthCardProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [baselineHeightPx, setBaselineHeightPx] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.sessionStorage.getItem(AUTH_CARD_BASELINE_STORAGE_KEY);
    if (!stored) return null;
    const parsed = Number(stored);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  });

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const measure = () => {
      // Never let transient error/status states increase the shared baseline.
      if (document.querySelector('[role="alert"], [role="status"]')) {
        return;
      }
      const height = Math.ceil(body.getBoundingClientRect().height);
      if (!Number.isFinite(height) || height <= 0) return;
      const next = Math.max(baselineHeightPx ?? 0, height);
      window.sessionStorage.setItem(AUTH_CARD_BASELINE_STORAGE_KEY, String(next));
      if (next !== baselineHeightPx) {
        setBaselineHeightPx(next);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [baselineHeightPx]);

  return (
    <WidgetCard paddingClass="p-4" className={cn("mx-auto w-full max-w-sm", className)}>
      {header ?? <AuthBrandLogo />}
      <RootPageTitle className="mb-0 mt-4">{title}</RootPageTitle>
      <div className="mt-4 min-h-5">
        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : statusMessage ? (
          <p
            className="text-sm text-destructive"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
        ) : null}
      </div>
      <div
        ref={bodyRef}
        style={baselineHeightPx ? { minHeight: baselineHeightPx } : undefined}
        className={cn(
          ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS,
          "flex flex-col [&>:only-child]:flex [&>:only-child]:min-h-0 [&>:only-child]:flex-1 [&>:only-child]:flex-col",
          contentClassName,
        )}
      >
        {children}
        {footer}
      </div>
    </WidgetCard>
  );
}

interface AuthFooterLinkProps {
  prompt: string;
  href: string;
  label: string;
  className?: string;
}

export function AuthFooterLink({
  prompt,
  href,
  label,
  className,
}: AuthFooterLinkProps) {
  return (
    <p className={cn("mt-6 text-center text-sm text-muted-foreground", className)}>
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
