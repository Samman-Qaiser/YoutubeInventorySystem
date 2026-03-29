import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { monthlySalesData } from "../constants/data";

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart - Sales vs Purchases */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Monthly Sales vs Purchases
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlySalesData}>
            <defs>
              <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => `Rs ${val.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#sales)" strokeWidth={2} />
            <Area type="monotone" dataKey="purchases" stroke="#3b82f6" fill="url(#purchases)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart - Profit per month */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Monthly Profit
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => `Rs ${val.toLocaleString()}`} />
            <Bar dataKey="profit" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}