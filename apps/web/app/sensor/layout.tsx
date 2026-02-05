import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function SensorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
