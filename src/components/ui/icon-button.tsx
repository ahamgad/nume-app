import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconButtonSize = "sm" | "default";

const sizeMap: Record<IconButtonSize, "icon-sm" | "icon"> = {
  sm: "icon-sm",
  default: "icon",
};

export interface IconButtonProps extends React.ComponentProps<typeof Button> {
  size?: IconButtonSize;
}

/** Circular icon-only button with standard surface styling. */
export function IconButton({
  className,
  variant = "secondary",
  size = "sm",
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={sizeMap[size]}
      className={cn("rounded-full", className)}
      {...props}
    />
  );
}
