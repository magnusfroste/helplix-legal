import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const LogSkeleton = memo(function LogSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header skeleton */}
      <header className="px-4 py-3 border-b border-border flex items-baseline justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-16" />
      </header>

      {/* Entry skeletons */}
      <div className="flex-1 overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <LogEntrySkeleton key={i} isQuestion={i % 2 === 0} />
          ))}
        </div>
      </div>
    </div>
  );
});

const LogEntrySkeleton = memo(function LogEntrySkeleton({ isQuestion }: { isQuestion: boolean }) {
  return (
    <div className={`px-4 py-3 ${isQuestion ? 'bg-muted/30' : ''}`}>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2.5 w-10" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {isQuestion && <Skeleton className="h-4 w-1/2" />}
      </div>
    </div>
  );
});
