import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ReportSkeleton = memo(function ReportSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header skeleton */}
      <header className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </header>

      {/* Generate button skeleton */}
      <div className="px-3 py-3 border-b border-border">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Report sections skeleton */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-hidden">
        <ReportSectionSkeleton />
        <ReportSectionSkeleton />
        <ReportSectionSkeleton />
      </div>
    </div>
  );
});

const ReportSectionSkeleton = memo(function ReportSectionSkeleton() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </section>
  );
});
