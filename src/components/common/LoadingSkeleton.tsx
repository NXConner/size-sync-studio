import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({ 
  className, 
  variant = 'default', 
  animation = 'pulse',
  ...props 
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        "bg-muted",
        {
          'animate-pulse': animation === 'pulse',
          'animate-wave': animation === 'wave',
          'rounded-md': variant === 'default' || variant === 'rectangular',
          'rounded-full': variant === 'circular',
          'h-4': variant === 'text',
          'aspect-square': variant === 'circular',
        },
        className
      )}
      {...props}
    />
  );
};

// Specific skeleton components for common use cases
export const MeasurementCardSkeleton = () => (
  <div className="p-4 border rounded-lg animate-fade-in">
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4" variant="text" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" variant="text" />
        <Skeleton className="h-4 w-20" variant="text" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-14" variant="text" />
        <Skeleton className="h-4 w-18" variant="text" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const CameraSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/2" variant="text" />
      <Skeleton className="h-2 w-full" />
    </div>
  </div>
);

export const SettingsPanelSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" variant="text" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" variant="text" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
    
    <div className="space-y-4">
      <Skeleton className="h-6 w-28" variant="text" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" variant="text" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-4 w-20 mb-2" variant="text" />
          <Skeleton className="h-8 w-16" variant="text" />
          <Skeleton className="h-3 w-24 mt-1" variant="text" />
        </div>
      ))}
    </div>
    
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-6 w-32 mb-4" variant="text" />
      <Skeleton className="h-64 w-full" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-28 mb-3" variant="text" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-20" variant="text" />
                <Skeleton className="h-4 w-12" variant="text" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GallerySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border rounded-lg overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" variant="text" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" variant="text" />
            <Skeleton className="h-3 w-20" variant="text" />
          </div>
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-7 flex-1" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SessionSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-32" variant="text" />
          <Skeleton className="h-4 w-20" variant="text" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" variant="text" />
            <Skeleton className="h-3 w-16 mx-auto" variant="text" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" variant="text" />
            <Skeleton className="h-3 w-20 mx-auto" variant="text" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-10 mx-auto mb-1" variant="text" />
            <Skeleton className="h-3 w-14 mx-auto" variant="text" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Loading states for different pages
export const PageSkeletons = {
  Measure: CameraSkeleton,
  Analytics: AnalyticsSkeleton,
  Gallery: GallerySkeleton,
  Sessions: SessionSkeleton,
  Settings: SettingsPanelSkeleton
};