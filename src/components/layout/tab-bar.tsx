"use client";

import {
  CalendarRange,
  Landmark,
  LayoutDashboard,
  Menu,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/planning", labelKey: "nav.planning" as const, icon: CalendarRange },
  { href: "/accounts", labelKey: "nav.accounts" as const, icon: Landmark },
  { href: "/goals", labelKey: "nav.goals" as const, icon: Target },
  { href: "/more", labelKey: "nav.more" as const, icon: Menu },
];

function isTabActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isStackScreen(pathname: string) {
  return (
    pathname.startsWith("/accounts/") ||
    pathname.startsWith("/more/") ||
    pathname.includes("/records/")
  );
}

export function TabBar() {
  const pathname = usePathname();
  const t = useT();

  if (isStackScreen(pathname)) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid h-14 grid-cols-5">
        {tabs.map(({ href, labelKey, icon: Icon }) => {
          const active = isTabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-1 text-[0.6875rem] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} />
              <span className="max-w-full truncate leading-none">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function isTabRootPath(pathname: string) {
  return tabs.some(
    (tab) =>
      tab.href === pathname ||
      (tab.href !== "/" && pathname === tab.href),
  );
}
