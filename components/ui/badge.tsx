import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground border-border",
        active: "bg-[#EEF2F9] text-[#355289] border-[#D7E2F2]",
        success: "bg-sage text-success border-[#CDE3D0]",
        warning: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
        danger: "bg-[#FEE2E2] text-destructive border-[#FECACA]",
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
