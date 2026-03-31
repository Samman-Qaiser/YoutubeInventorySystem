import { motion } from "framer-motion";
import { useAllChannels } from "../hooks/useChannels";
import { Loader2 } from "lucide-react";
import TableSkeleton from '../Sekeleton/TableSkeleton'
export default function RecentChannels() {
  const { data: channels, isLoading, isError } = useAllChannels();

  // Get only last 5 channels (most recent)
  const recentChannels = channels?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Channels</h3>
        </div>
        <div className="flex items-center justify-center py-12">
    <TableSkeleton />
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Channels</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-red-500">Failed to load channels</p>
        </div>
      </motion.div>
    );
  }

  if (recentChannels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Channels</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No channels added yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your first channel to see it here</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
    >
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Channels</h3>
        <span className="text-xs text-gray-400">{recentChannels.length} channels</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {["Channel", "Niche", "Subscribers", "Price", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentChannels.map((ch, i) => (
              <motion.tr
                key={ch.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {ch.channelProfile && (
                      <img 
                        src={ch.channelProfile} 
                        alt={ch.channelName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {ch.channelName || ch.brandName || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-gray-500 dark:text-gray-400">
                    {ch.channelNiche || ch.category || "General"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-gray-500 dark:text-gray-400">
                    {ch.channelSubscribers 
                      ? Number(ch.channelSubscribers).toLocaleString() 
                      : "0"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ${Number(ch.salePrice || ch.purchasePrice || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                    ${ch.status === "sold"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                      : ch.status === "hacked"
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : ch.status === "terminate_with_loss"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : ch.status === "terminate_without_loss"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    }`}>
                    {ch.status === "sold" 
                      ? "Sold" 
                      : ch.status === "hacked"
                      ? "Hacked"
                      : ch.status === "terminate_with_loss"
                      ? "Terminated (Loss)"
                      : ch.status === "terminate_without_loss"
                      ? "Terminated (Profit)"
                      : "Available"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}