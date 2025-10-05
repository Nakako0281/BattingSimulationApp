interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className || ""}`}
    />
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table skeleton */}
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-28" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TeamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Stats card skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <TableSkeleton />
      </div>
    </div>
  );
}

export function TeamsListSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
