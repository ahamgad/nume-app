"use client";

import type { ReactNode } from "react";

import { ChevronRight } from "lucide-react";

import { CurrencyAmount } from "@/components/ui/currency-amount";
import { ResponsiveCurrencyAmount } from "@/components/ui/responsive-currency-amount";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { ResponsiveCurrencyVariant } from "@/lib/format/responsive-currency";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ children, className }: WidgetCardProps) {
  return (
    <Card className={cn("min-w-0 w-full shadow-none", className)}>
      <CardContent className="w-full min-w-0 p-5 text-start">{children}</CardContent>
    </Card>
  );
}

interface EducationalWidgetProps {
  title: string;
  body: string;
  hint: string;
}

export function EducationalWidget({ title, body, hint }: EducationalWidgetProps) {
  return (
    <WidgetCard>
      <h2 className="text-start text-lg font-semibold leading-snug">{title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </WidgetCard>
  );
}

interface ProgressBarProps {
  /** Current value (0–100). Values above 100 fill the bar completely. */
  value: number;
  className?: string;
  /** Bar fill color class. Defaults to primary; use destructive when over limit. */
  indicatorClassName?: string;
}

export function ProgressBar({
  value,
  className,
  indicatorClassName,
}: ProgressBarProps) {
  const fillWidth = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fillWidth}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width]",
          indicatorClassName,
        )}
        style={{ width: `${fillWidth}%` }}
      />
    </div>
  );
}

interface MetricHeroProps {
  label: string;
  /** Preformatted display value (non-currency). */
  value?: string;
  /** Numeric amount — rendered with responsive currency scaling. */
  amount?: number;
  locale?: string;
  amountVariant?: ResponsiveCurrencyVariant;
  amountClassName?: string;
  amountAction?: ReactNode;
  subline?: string;
  meta?: string;
  /** Dashboard/widget metrics show explicit +/- prefixes. */
  signedAmount?: boolean;
}

export function MetricHero({
  label,
  value,
  amount,
  locale,
  amountVariant = "hero",
  amountClassName,
  amountAction,
  subline,
  meta,
  signedAmount = false,
}: MetricHeroProps) {
  return (
    <div className="w-full min-w-0 text-start">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 min-w-0">
        {amount !== undefined && locale ? (
          <ResponsiveCurrencyAmount
            amount={amount}
            locale={locale}
            variant={amountVariant}
            className={amountClassName}
            signMode={signedAmount ? "signed" : "unsigned"}
            trailing={amountAction}
          />
        ) : (
          <p className="min-w-0 truncate text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums">
            {value}
          </p>
        )}
      </div>
      {subline ? (
        <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-muted-foreground">
          {subline}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-1.5 text-[0.8125rem] leading-normal text-muted-foreground">
          {meta}
        </p>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-muted-foreground [&_svg]:size-8">{icon}</div>
      ) : null}
      <h2 className="max-w-xs text-lg font-semibold leading-snug">{title}</h2>
      <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
}

export function StickyFooter({ children, className }: StickyFooterProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background",
        className,
      )}
    >
      <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}

interface ToggleSettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSettingRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: ToggleSettingRowProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[0.9375rem] font-medium">{label}</p>
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

interface SetupBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function SetupBanner({
  title,
  description,
  actionLabel,
  onAction,
}: SetupBannerProps) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.9375rem] font-medium">{title}</p>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm font-medium"
        >
          {actionLabel}
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}

interface ListRowProps {
  primary: string;
  secondary?: string;
  trailing?: ReactNode;
  leading?: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
}

export function ListRow({
  primary,
  secondary,
  trailing,
  leading,
  onClick,
  showChevron = true,
}: ListRowProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start",
        onClick && "transition-colors active:bg-muted",
      )}
    >
      {leading ? (
        <div className="shrink-0 text-muted-foreground">{leading}</div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-medium">{primary}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">
            {secondary}
          </p>
        ) : null}
      </div>
      {trailing ? (
        <div className="min-w-0 max-w-[50%] shrink text-end">
          {trailing}
        </div>
      ) : null}
      {showChevron && onClick ? (
        <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      ) : null}
    </Comp>
  );
}

interface RecordRowProps {
  label: string;
  amount: number;
  formatLocale: string;
  meta: string;
  icon: ReactNode;
  amountClassName?: string;
  onClick?: () => void;
}

export function RecordRow({
  label,
  amount,
  formatLocale,
  meta,
  icon,
  amountClassName,
  onClick,
}: RecordRowProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full min-h-14 items-start gap-3 py-3 text-start",
        onClick && "transition-colors active:bg-muted",
      )}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.9375rem] font-medium">{label}</p>
          <CurrencyAmount
            amount={amount}
            locale={formatLocale}
            variant="inline"
            className={amountClassName}
          />
        </div>
        <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{meta}</p>
      </div>
    </Comp>
  );
}

interface MoreMenuRowProps {
  title: string;
  description?: string;
  onClick: () => void;
}

export function MoreMenuRow({ title, description, onClick }: MoreMenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors active:bg-muted"
    >
      <div className="min-w-0">
        <p className="text-[0.9375rem] font-medium">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
    </button>
  );
}
