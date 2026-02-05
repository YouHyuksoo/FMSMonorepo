import { ReactNode } from "react"
import { cn } from "@fms/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 w-full", className)}>
      <div className="min-w-0 flex-shrink">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && (
        <div className="flex-shrink-0 whitespace-nowrap">
          {children}
        </div>
      )}
    </div>
  )
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>
}
