import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md border px-4 py-3 text-sm", {
  variants: {
    variant: {
      info: "border-border bg-muted text-foreground",
      success: "border-success/30 bg-success/10 text-success",
      error: "border-destructive/30 bg-destructive/10 text-destructive",
      warning: "border-warning/30 bg-warning/10 text-warning",
    },
  },
  defaultVariants: { variant: "info" },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
