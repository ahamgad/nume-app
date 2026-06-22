import { Children, isValidElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormCardFieldProps {
  children: ReactNode;
  className?: string;
}

/** Single row inside a form card — provides divider-safe padding. */
export function FormCardField({ children, className }: FormCardFieldProps) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}

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
  const fields = Children.toArray(children).filter(isValidElement);

  return (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="p-0">
        <div className="border-b border-border px-4 pb-3 pt-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="divide-y divide-border">
          {fields.map((field, index) => (
            <FormCardField key={field.key ?? index}>{field}</FormCardField>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
