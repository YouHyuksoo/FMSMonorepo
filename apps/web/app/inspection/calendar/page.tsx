import { InspectionCalendar } from "@/components/inspection/inspection-calendar"
import { mockInspectionSchedules } from "@/lib/mock-data/inspection-schedule" // Assuming this mock data exists
import { Suspense } from "react"
import InspectionCalendarLoading from "./loading" // Corrected import name

export default async function InspectionCalendarPage() {
  // Simulate data fetching
  await new Promise((resolve) => setTimeout(resolve, 500))
  const schedules = mockInspectionSchedules

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">점검 관리 카렌더</h1>
      <Suspense fallback={<InspectionCalendarLoading />}>
        <InspectionCalendar schedules={schedules} />
      </Suspense>
    </div>
  )
}
