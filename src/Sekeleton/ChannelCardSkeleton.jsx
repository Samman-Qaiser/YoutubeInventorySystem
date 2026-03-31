// src/components/skeletons/ChannelCardSkeleton.jsx
import Skeleton from "./Skeleton";

const ChannelCardSkeleton = () => {
  return (
    <div className="bg-[#1A1C2E] border border-white/10 rounded-2xl p-5 w-full space-y-4">
      {/* Top Banner Area (Colored Header Simulation) */}
      <Skeleton className="h-24 w-full rounded-xl opacity-20" />

      {/* Title & Tag */}
      <div className="flex justify-between items-start pt-2">
        <div className="space-y-2 w-2/3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>

      {/* Stats Grid (Subscribers & Videos) */}
      <div className="grid grid-cols-2 gap-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>

      {/* Pricing Row */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>

      {/* Bottom Footer Action Icons */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ChannelCardSkeleton;