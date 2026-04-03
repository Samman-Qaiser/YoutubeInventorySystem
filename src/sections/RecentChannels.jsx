import { motion } from "framer-motion";
import { useAllChannels } from "../hooks/useChannels";
import { Loader2, Users } from "lucide-react";
import TableSkeleton from '../Sekeleton/TableSkeleton'

// Helper function to format subscribers
function formatSubscribers(count) {
  if (!count || count === 0) return "0";
  
  const num = Number(count);
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Helper function to get status badge color and text
function getStatusInfo(status) {
  switch(status) {
    case "sold":
      return { text: "Sold", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800" };
    case "hacked":
      return { text: "Hacked", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800" };
    case "terminatedWithLoss":
      return { text: "Terminated (Loss)", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800" };
    case "terminatedWithoutLoss":
      return { text: "Terminated (Profit)", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800" };
    case "purchased":
      return { text: "Purchased", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" };
    default:
      return { text: "Available", color: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700" };
  }
}

// Helper function to get avatar color
const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-sky-500",
];

function getAvatarColor(id) {
  const strId = String(id || "");
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase() || "CH";
}

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
          <p className="text-sm text-red-500">Error loading channels</p>
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
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {recentChannels.length} channels
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
            {recentChannels.map((ch, i) => {
              const statusInfo = getStatusInfo(ch.status);
              const subscribers = ch.channelSubscribers || ch.subscribers || 0;
              const formattedSubscribers = formatSubscribers(subscribers);
              
              return (
                <motion.tr
                  key={ch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Channel Avatar */}
                      <div className={`w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0
                        ${!ch.channelProfile ? `bg-gradient-to-br ${getAvatarColor(ch.id)}` : ""}`}>
                        {ch.channelProfile ? (
                          <img 
                            src={ch.channelProfile} 
                            alt={ch.channelName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('bg-gradient-to-br', ...getAvatarColor(ch.id).split(' '));
                              e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-white">${getInitials(ch.channelName)}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {getInitials(ch.channelName || ch.brandName)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {ch.channelName || ch.brandName || "N/A"}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          ID: {ch.id?.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {ch.channelNiche || ch.category || "General"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-gray-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formattedSubscribers}
                      </span>
                   
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ${Number(ch.salePrice || ch.purchasePrice || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}