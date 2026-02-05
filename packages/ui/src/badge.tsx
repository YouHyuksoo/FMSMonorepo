/**
 * @file packages/ui/src/badge.tsx
 * @description wbsmaster 스타일의 Badge 컴포넌트
 *
 * 초보자 가이드:
 * 1. **variant**: 색상 스타일 (default, secondary, destructive, success, warning, info)
 * 2. **size**: 크기 (sm, md)
 * 3. **테두리 없이 배경색만** 사용 (wbsmaster 스타일)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@fms/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        destructive:
          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        success:
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
        info:
          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        cyan:
          "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        outline:
          "border border-border bg-transparent text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
