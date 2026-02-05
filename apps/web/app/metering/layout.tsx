import type React from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function MeteringLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
