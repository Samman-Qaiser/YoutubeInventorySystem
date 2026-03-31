import { motion } from "framer-motion";

const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden rounded ${className}`}>
    <div className="absolute inset-0 bg-gray-200 dark:bg-white/5" />
    <motion.div
      className="absolute inset-0"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
      }}
    />
  </div>
);

const ChannelCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#111322] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
      
      {/* HEADER (exact like colored top) */}
      <div className="relative">
        <Shimmer className="h-24 w-full" />

        {/* initials center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shimmer className="h-6 w-10 rounded-md opacity-40" />
        </div>
      </div>

      <div className="p-5">
        {/* Avatar overlapping */}
        <div className="-mt-10 mb-2">
          <Shimmer className="h-12 w-12 rounded-full border-4 border-white dark:border-[#111322]" />
        </div>

        {/* Title */}
        <Shimmer className="h-5 w-3/4 mb-1" />

        {/* Subtitle */}
        <Shimmer className="h-3 w-1/2 mb-3" />

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-5 w-20 rounded-full" />
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4">
          <div>
            <Shimmer className="h-3 w-20 mb-1" />
            <Shimmer className="h-4 w-12" />
          </div>
          <div className="text-right">
            <Shimmer className="h-3 w-16 mb-1 ml-auto" />
            <Shimmer className="h-4 w-10 ml-auto" />
          </div>
        </div>

        {/* Prices */}
        <div className="flex justify-between border-t border-gray-100 dark:border-white/10 pt-3 mb-4">
          <div>
            <Shimmer className="h-3 w-20 mb-1" />
            <Shimmer className="h-4 w-20" />
          </div>
          <div className="text-right">
            <Shimmer className="h-3 w-20 mb-1 ml-auto" />
            <Shimmer className="h-4 w-20 ml-auto" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <Shimmer className="h-3 w-24" />
          <div className="flex gap-2">
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelSkeletonGrid = () => {
  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          <ChannelCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

export default ChannelSkeletonGrid;