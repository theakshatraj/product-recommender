const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="w-full h-48 bg-neutral-200"></div>
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title skeleton */}
      <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
      
      {/* Category skeleton */}
      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-full"></div>
        <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
      </div>
      
      {/* Price skeleton */}
      <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
      
      {/* Button skeleton */}
      <div className="h-10 bg-neutral-200 rounded w-full"></div>
    </div>
  </div>
);

const RecommendationCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden animate-pulse">
    <div className="p-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-32"></div>
            <div className="h-4 bg-neutral-200 rounded w-20"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-neutral-200 rounded w-16"></div>
          <div className="h-4 bg-neutral-200 rounded w-12"></div>
        </div>
      </div>
      
      {/* Score bar skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-24"></div>
        <div className="h-2 bg-neutral-200 rounded w-full"></div>
      </div>
      
      {/* Product info skeleton */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-neutral-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
        </div>
      </div>
      
      {/* Explanation skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-32"></div>
        <div className="space-y-1">
          <div className="h-3 bg-neutral-200 rounded w-full"></div>
          <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
          <div className="h-3 bg-neutral-200 rounded w-4/6"></div>
        </div>
      </div>
      
      {/* Buttons skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-8 bg-neutral-200 rounded"></div>
        <div className="h-8 bg-neutral-200 rounded"></div>
        <div className="h-8 bg-neutral-200 rounded"></div>
      </div>
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const RecommendationListSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <RecommendationCardSkeleton key={index} />
    ))}
  </div>
);

const UserSelectorSkeleton = () => (
  <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-lg animate-pulse">
    <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
    <div className="w-20 h-4 bg-neutral-200 rounded"></div>
  </div>
);

const FiltersBarSkeleton = () => (
  <div className="bg-white border-b border-neutral-200 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-24"></div>
          <div className="h-10 bg-neutral-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-20"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200 rounded-full w-16"></div>
            <div className="h-8 bg-neutral-200 rounded-full w-20"></div>
            <div className="h-8 bg-neutral-200 rounded-full w-12"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-24"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-neutral-200 rounded flex-1"></div>
            <div className="h-10 bg-neutral-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export {
  ProductCardSkeleton,
  RecommendationCardSkeleton,
  ProductGridSkeleton,
  RecommendationListSkeleton,
  UserSelectorSkeleton,
  FiltersBarSkeleton
};
