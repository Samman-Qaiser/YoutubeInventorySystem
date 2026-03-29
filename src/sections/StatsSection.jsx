import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, ShoppingCart, DollarSign, Video, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

function CountUp({ value, prefix = "", hidden = false }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    prefix + Math.round(latest).toLocaleString()
  );
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  if (hidden) return <span className="tracking-widest">••••••</span>;
  return <motion.span>{rounded}</motion.span>;
}

export default function StatsSection({ channels = [] }) {
  const [profitHidden, setProfitHidden] = useState(false);

  const sold = channels.filter(c => c.status === "sold");
  const liveStats = {
    totalSales:    sold.reduce((s,c) => s + (Number(c.salePrice)||0), 0),
    totalPurchase: channels.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0),
    totalProfit:   sold.reduce((s,c) => s + ((Number(c.salePrice)||0) - (Number(c.purchasePrice)||0)), 0),
    totalCount:    channels.length,
    soldCount:     sold.length,
    hackedCount:   channels.filter(c => c.status === "hacked").length,
  };

  const cards = [
    { label: "Total Sales", value: liveStats.totalSales, icon: TrendingUp, accent: "#10b981", prefix: "Rs ", change: "+12.5%", up: true, hideable: false },
    { label: "Total Purchases", value: liveStats.totalPurchase, icon: ShoppingCart, accent: "#3b82f6", prefix: "Rs ", change: "+8.2%", up: true, hideable: false },
    { label: "Total Profit", value: liveStats.totalProfit, icon: DollarSign, accent: "#8b5cf6", prefix: "Rs ", change: "+18.9%", up: true, hideable: true },
    { label: "Total Channels", value: liveStats.totalCount, icon: Video, accent: "#ef4444", prefix: "", change: "+4", up: true, hideable: false },
    { label: "Channels Sold", value: liveStats.soldCount, icon: CheckCircle, accent: "#14b8a6", prefix: "", change: "+3", up: true, hideable: false },
    { label: "Hacked / Lost", value: liveStats.hackedCount, icon: AlertTriangle, accent: "#f97316", prefix: "", change: "-1", up: false, hideable: false },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isHidden = card.hideable && profitHidden;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            {/* Top */}
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${card.accent}15` }}>
                <Icon size={16} style={{ color: card.accent }} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md
                  ${card.up
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-500"
                  }`}>
                  {card.up ? "↑" : "↓"} {card.change}
                </span>
                {card.hideable && (
                  <button
                    onClick={() => setProfitHidden(!profitHidden)}
                    className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition"
                  >
                    {profitHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Value */}
            <p className="text-xl font-bold text-gray-800 dark:text-white mb-0.5">
              <CountUp value={card.value} prefix={card.prefix} hidden={isHidden} />
            </p>

            {/* Label */}
            <p className="text-xs text-gray-400 dark:text-gray-500">{card.label}</p>

            {/* Bottom line */}
            <div className="mt-3 h-0.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((card.value / 2500000) * 100, 100)}%` }}
                transition={{ delay: i * 0.07 + 0.5, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: card.accent }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}