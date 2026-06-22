import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormCardSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Bordered form section — matches dashboard card chrome with in-section title. */
export function FormCardSection({
  title,
  children,
  className,
}: FormCardSectionProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="p-0">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="divide-y divide-border">{children}</div>
      </CardContent>
    </Card>
  );
}
