import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DictaphoneSkeleton = memo(function DictaphoneSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] relative">
      {/* Question area skeleton */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-3 w-full max-w-md">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
      </div>

      {/* Push to talk button skeleton */}
      <div className="flex flex-col items-center pb-8 gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        
        {/* Action buttons skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
});
