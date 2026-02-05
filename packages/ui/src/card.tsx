/**
 * @file packages/ui/src/card.tsx
 * @description
 * 공통 카드 컴포넌트입니다.
 * WBSMaster 스타일과 동일하게 구현되었습니다.
 *
 * 초보자 가이드:
 * 1. **Card**: 기본 카드 컨테이너 (rounded-2xl, p-8)
 * 2. **CardHeader**: 카드 상단 영역
 * 3. **CardContent**: 카드 본문 영역
 * 4. **CardFooter**: 카드 하단 영역
 * 5. **CardTitle**: 카드 제목
 * 6. **CardDescription**: 카드 설명
 */

import * as React from "react"

import { cn } from "@fms/utils"

/** 카드 컴포넌트 Props */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 호버 효과 활성화 */
  hover?: boolean
  /** 패딩 없음 */
  noPadding?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, noPadding = false, ...props }, ref) => {
    const baseStyles = "rounded-2xl border border-border bg-card text-card-foreground transition-all duration-200"
    const hoverStyles = hover ? "hover:shadow-lg hover:border-primary/50" : ""
    const paddingStyles = noPadding ? "" : "p-6"

    return (
      <div
        ref={ref}
        className={cn(baseStyles, hoverStyles, paddingStyles, className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center mt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
export type { CardProps }
