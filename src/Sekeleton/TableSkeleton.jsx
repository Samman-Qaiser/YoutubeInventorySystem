// src/components/skeletons/TableSkeleton.jsx
import { motion } from "framer-motion";

// Shimmer Effect Base
const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden bg-gray-100 dark:bg-white/5 rounded ${className}`}>
    <motion.div
      className="absolute inset-0"
      initial={{ translateX: "-100%" }}
      animate={{ translateX: "100%" }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }}
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      }}
    />
  </div>
);

const TableRowSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 px-6 py-4 border-b border-gray-50 dark:border-white/5">
      {/* # Column */}
      <Shimmer className="h-4 w-4" />

      {/* Channel Column (Avatar + Text) */}
      <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
        <Shimmer className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 w-full">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>

      {/* Seller Column */}
      <div className="flex items-center space-x-2 w-32">
        <Shimmer className="h-6 w-6 rounded-full shrink-0" />
        <Shimmer className="h-3 w-16" />
      </div>

      {/* Subscribers Column */}
      <div className="w-24">
        <Shimmer className="h-4 w-12" />
      </div>

      {/* Monetization Badge */}
      <div className="w-32">
        <Shimmer className="h-6 w-24 rounded-full" />
      </div>

      {/* Ownership Status */}
      <div className="w-24">
        <Shimmer className="h-6 w-20 rounded-full opacity-60" />
      </div>

      {/* Purchase Price */}
      <div className="w-32">
        <Shimmer className="h-4 w-16" />
      </div>

      {/* Expected Sale */}
      <div className="w-32">
        <Shimmer className="h-4 w-16" />
      </div>

      {/* Date Column */}
      <div className="w-32 hidden lg:block">
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
  );
};

const TableSkeleton = ({ rows = 8 }) => {
  return (
    <div className="w-full bg-white dark:bg-[#1A1C2E] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10">
      {/* Table Header Skeleton */}
      <div className="flex items-center space-x-4 px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
        <Shimmer className="h-3 w-4" />
        <Shimmer className="h-3 w-32 flex-1" />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-3 w-32 hidden lg:block" />
      </div>

      {/* Table Body Rows */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <TableRowSkeleton />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;