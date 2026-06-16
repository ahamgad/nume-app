import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  /** Renders a divider above the section heading. */
  separator?: boolean;
  className?: string;
}

export function FormSection({
  title,
  children,
  separator = false,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {separator ? <div className="border-t border-border pt-6" /> : null}
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
