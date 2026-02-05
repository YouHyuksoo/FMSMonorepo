import { Skeleton } from "@fms/ui/skeleton"

export default function PreventiveCalendarLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
