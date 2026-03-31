import { motion } from "framer-motion";

export default function ChannelStatCard({ label, value, icon: IconComp, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3"
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        <IconComp size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}