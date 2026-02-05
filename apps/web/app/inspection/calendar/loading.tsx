import { Skeleton } from "@fms/ui/skeleton"

export default function InspectionCalendarLoading() {
  return (
    <div className="container mx-auto py-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-10 mb-px" />
          ))}
          {[...Array(35)].map((_, i) => (
            <Skeleton key={`day-${i}`} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  )
}
