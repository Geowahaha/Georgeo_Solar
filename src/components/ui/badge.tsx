import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-950",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-800 text-slate-100",
        hot: "border-transparent bg-orange-500/20 text-orange-300",
        warm: "border-transparent bg-amber-500/20 text-amber-200",
        cold: "border-transparent bg-sky-500/20 text-sky-200",
        success: "border-transparent bg-emerald-500/20 text-emerald-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
