import { motion } from "framer-motion";
import { recentChannels } from "../constants/data";

export default function RecentChannels() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
    >
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Channels</h3>
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
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">{ch.name}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{ch.niche}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{ch.subscribers}</td>
                <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300">Rs {ch.salePrice.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                    ${ch.status === "sold"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    }`}>
                    {ch.status === "sold" ? "Sold" : "Available"}
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