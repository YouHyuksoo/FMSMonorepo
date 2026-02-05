import type React from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function PreventiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
