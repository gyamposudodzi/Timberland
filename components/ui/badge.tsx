import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground border-border",
        active: "bg-primary/10 text-primary border-primary/20",
        success: "bg-success/10 text-success border-success/25",
        warning: "bg-warning/10 text-warning border-warning/30",
        danger: "bg-destructive/10 text-destructive border-destructive/25",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
