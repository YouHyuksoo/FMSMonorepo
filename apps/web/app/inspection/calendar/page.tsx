import { InspectionCalendar } from "@/components/inspection/inspection-calendar"
import { Suspense } from "react"
import InspectionCalendarLoading from "./loading" // Corrected import name

export default async function InspectionCalendarPage() {
  // TODO: 실제 API에서 점검 일정 데이터를 가져와야 함
  const schedules: never[] = []

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">점검 관리 카렌더</h1>
      <Suspense fallback={<InspectionCalendarLoading />}>
        <InspectionCalendar schedules={schedules} />
      </Suspense>
    </div>
  )
}
