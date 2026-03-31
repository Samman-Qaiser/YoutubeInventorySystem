import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  TrendingUp, ShoppingCart, DollarSign, Video,
  CheckCircle, AlertTriangle, Eye, EyeOff, CalendarDays
} from "lucide-react";
import {
  useTotalSales,
  useTotalPurchases,
  useTotalProfit,
  useChannelCounts,
  useCurrentMonthSales,
  useCurrentMonthPurchases,
  useCurrentMonthProfit,
} from "../hooks/useChannels";

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard({ accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${accent}15` }}>
          <div className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: accent }} />
        </div>
        <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
      </div>
      <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-1" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-1" />
      <div className="mt-3 h-0.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
        <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: accent, width: "30%" }} />
      </div>
    </div>
  );
}

// ─── Animated number ─────────────────────────────────────────────────────────
function CountUp({ value, prefix = "", hidden = false }) {
  const count   = useMotionValue(0);
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

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ card, index, maxValue, profitHidden, onToggleHide }) {
  const Icon        = card.icon;
  const isHidden    = card.hideable && profitHidden;
  const progressPct = Math.min((Math.abs(card.value) / maxValue) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${card.accent}15` }}>
          <Icon size={16} style={{ color: card.accent }} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
            card.up
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-500"
          }`}>
            {card.up ? "↑" : "↓"} {card.change}
          </span>
          {card.hideable && (
            <button onClick={onToggleHide}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition">
              {profitHidden ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
        </div>
      </div>

      <p className="text-xl font-bold text-gray-800 dark:text-white mb-0.5">
        <CountUp value={card.value} prefix={card.prefix} hidden={isHidden} />
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{card.label}</p>

      <div className="mt-3 h-0.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ delay: index * 0.07 + 0.5, duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: card.accent }}
        />
      </div>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, accent }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accent}15` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">{title}</p>
        {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatsSection() {
  const [profitHidden, setProfitHidden] = useState(false);

  // ── All-time queries (separate Firestore calls, cached 5 min) ──────────────
  const { data: totalSales     = 0, isLoading: salesLoading     } = useTotalSales();
  const { data: totalPurchases = 0, isLoading: purchasesLoading } = useTotalPurchases();
  const { data: profitData,         isLoading: profitLoading     } = useTotalProfit();
  const { data: counts,             isLoading: countsLoading     } = useChannelCounts();

  // ── Current month — derived from useAllChannels cache, ZERO extra fetches ──
  // All three share the same ['channels','all'] query key.
  // React Query fetches once and runs each `select` fn in memory.
  const { data: cmSales,     isLoading: cmLoading } = useCurrentMonthSales();
  const { data: cmPurchases                        } = useCurrentMonthPurchases();
  const { data: cmProfit                           } = useCurrentMonthProfit();

  const totalProfit  = profitData?.total       || 0;
  const cmSalesAmt   = cmSales?.total          || 0;
  const cmPurchAmt   = cmPurchases?.total      || 0;
  const cmProfitAmt  = cmProfit?.total         || 0;
  const cmSalesCnt   = cmSales?.count          || 0;
  const cmPurchCnt   = cmPurchases?.count      || 0;

  // All three current-month hooks share one request — one loading flag is enough
  const isLoadingAll   = salesLoading || purchasesLoading || profitLoading || countsLoading;
  const isLoadingMonth = cmLoading;

  const currentMonthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  // ── Card definitions ───────────────────────────────────────────────────────
  const currentMonthCards = [
    {
      label: "This Month Sales",     value: cmSalesAmt,
      icon: TrendingUp,  accent: "#10b981", prefix: "$ ",
      change: `${cmSalesCnt} sold`,  up: cmSalesAmt > 0,  hideable: false,
    },
    {
      label: "This Month Purchases", value: cmPurchAmt,
      icon: ShoppingCart, accent: "#3b82f6", prefix: "$ ",
      change: `${cmPurchCnt} bought`, up: cmPurchAmt > 0, hideable: false,
    },
    {
      label: "This Month Profit",    value: cmProfitAmt,
      icon: DollarSign,  accent: "#8b5cf6", prefix: "$ ",
      change: cmProfitAmt >= 0 ? "Profit" : "Loss", up: cmProfitAmt >= 0, hideable: true,
    },
  ];

  const allTimeCards = [
    {
      label: "Total Sales",     value: totalSales,
      icon: TrendingUp,  accent: "#10b981", prefix: "$ ",
      change: "+12.5%", up: true, hideable: false,
    },
    {
      label: "Total Purchases", value: totalPurchases,
      icon: ShoppingCart, accent: "#3b82f6", prefix: "$ ",
      change: "+8.2%",  up: true, hideable: false,
    },
    {
      label: "Total Profit",    value: totalProfit,
      icon: DollarSign,  accent: "#8b5cf6", prefix: "$ ",
      change: totalProfit >= 0 ? "+18.9%" : "-5.2%", up: totalProfit >= 0, hideable: true,
    },
    {
      label: "Total Channels",  value: counts?.total || 0,
      icon: Video,       accent: "#ef4444", prefix: "",
      change: `+${counts?.total || 0}`, up: true, hideable: false,
    },
    {
      label: "Channels Sold",   value: counts?.sold  || 0,
      icon: CheckCircle, accent: "#14b8a6", prefix: "",
      change: `+${counts?.sold || 0}`, up: true, hideable: false,
    },
    {
      label: "Hacked / Lost",   value: counts?.hacked || 0,
      icon: AlertTriangle, accent: "#f97316", prefix: "",
      change: `${counts?.hacked || 0}`, up: false, hideable: false,
    },
  ];

  const allTimeMax = Math.max(
    totalSales, totalPurchases, Math.abs(totalProfit),
    counts?.total || 0, counts?.sold || 0, counts?.hacked || 0, 1
  );
  const monthMax = Math.max(cmSalesAmt, cmPurchAmt, Math.abs(cmProfitAmt), 1);

  return (
    <div className="space-y-6">

      {/* ── This Month ────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={CalendarDays} title={currentMonthName}
          subtitle="Current month performance" accent="#8b5cf6"
        />
        {isLoadingMonth ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["#10b981","#3b82f6","#8b5cf6"].map((a, i) => <SkeletonCard key={i} accent={a} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentMonthCards.map((card, i) => (
              <StatCard key={card.label} card={card} index={i} maxValue={monthMax}
                profitHidden={profitHidden} onToggleHide={() => setProfitHidden(!profitHidden)} />
            ))}
          </div>
        )}
      </div>

      {/* ── All Time ──────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={TrendingUp} title="All Time"
          subtitle="Lifetime statistics" accent="#10b981"
        />
        {isLoadingAll ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {["#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6","#f97316"].map((a, i) =>
              <SkeletonCard key={i} accent={a} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {allTimeCards.map((card, i) => (
              <StatCard key={card.label} card={card} index={i} maxValue={allTimeMax}
                profitHidden={profitHidden} onToggleHide={() => setProfitHidden(!profitHidden)} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}