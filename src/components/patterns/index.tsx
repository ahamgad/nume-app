import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ children, className }: WidgetCardProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="p-5">{children}</CardContent>
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
      <h2 className="text-lg font-semibold leading-snug">{title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </WidgetCard>
  );
}

interface MetricHeroProps {
  label: string;
  value: string;
  subline?: string;
  meta?: string;
}

export function MetricHero({ label, value, subline, meta }: MetricHeroProps) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </p>
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
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm",
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
          className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm font-medium"
        >
          {actionLabel} →
        </button>
      </div>
    </div>
  );
}

interface ListRowProps {
  primary: string;
  secondary?: string;
  trailing?: string;
  onClick?: () => void;
  showChevron?: boolean;
}

export function ListRow({
  primary,
  secondary,
  trailing,
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-medium">{primary}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">
            {secondary}
          </p>
        ) : null}
      </div>
      {trailing ? (
        <span className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
          {trailing}
        </span>
      ) : null}
      {showChevron && onClick ? (
        <span className="shrink-0 text-muted-foreground rtl:rotate-180">›</span>
      ) : null}
    </Comp>
  );
}

interface RecordRowProps {
  label: string;
  amount: string;
  meta: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function RecordRow({
  label,
  amount,
  meta,
  icon,
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
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.9375rem] font-medium">{label}</p>
          <p className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
            {amount}
          </p>
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
      <span className="shrink-0 text-muted-foreground rtl:rotate-180">›</span>
    </button>
  );
}
