import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
