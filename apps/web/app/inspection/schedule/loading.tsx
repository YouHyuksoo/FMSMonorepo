import { Skeleton } from "@fms/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-96" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[240px]" />
          <Skeleton className="h-10 w-64" />
        </div>
      </div>

      <Skeleton className="h-[500px]" />
    </div>
  )
}
