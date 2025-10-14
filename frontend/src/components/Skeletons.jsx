export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="aspect-square bg-neutral-100 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-neutral-200 rounded w-full animate-pulse" />
        <div className="h-8 bg-neutral-200 rounded w-24 animate-pulse" />
      </div>
    </div>
  </div>
);

export const RecommendationCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4 space-y-3">
    <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-neutral-200 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-neutral-200 rounded w-1/3 animate-pulse" />
      </div>
    </div>
    <div className="h-2 bg-neutral-200 rounded animate-pulse" />
    <div className="h-20 bg-neutral-100 rounded animate-pulse" />
  </div>
);


