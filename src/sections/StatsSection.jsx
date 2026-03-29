import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, ShoppingCart, DollarSign, Video, CheckCircle, AlertTriangle } from "lucide-react";
import { dummyStats } from "../constants/data";

function CountUp({ value, prefix = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => prefix + Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

const cards = [
  { label: "Total Sales", value: dummyStats.totalSale, icon: TrendingUp, color: "emerald", prefix: "Rs " },
  { label: "Total Purchases", value: dummyStats.totalPurchase, icon: ShoppingCart, color: "blue", prefix: "Rs " },
  { label: "Total Profit", value: dummyStats.totalProfit, icon: DollarSign, color: "violet", prefix: "Rs " },
  { label: "Total Channels", value: dummyStats.totalChannels, icon: Video, color: "red", prefix: "" },
  { label: "Channels Sold", value: dummyStats.soldChannels, icon: CheckCircle, color: "teal", prefix: "" },
  { label: "Hacked/Lost", value: dummyStats.hackedChannels, icon: AlertTriangle, color: "orange", prefix: "" },
];

const colorMap = {
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400",
  teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
};

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <CountUp value={card.value} prefix={card.prefix} />
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${colorMap[card.color]}`}>
                <Icon size={18} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}