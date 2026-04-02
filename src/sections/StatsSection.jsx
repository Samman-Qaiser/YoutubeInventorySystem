import { useEffect, useState, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  TrendingUp, ShoppingCart, DollarSign, Video,
  CheckCircle, AlertTriangle, Eye, EyeOff, Filter
} from "lucide-react";
import { useAllChannels } from "../hooks/useChannels";
import { useSaleTransactions } from "../hooks/useTransactions";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ value, prefix = "", hidden = false }) {
  const count   = useMotionValue(0);
  const rounded = useTransform(count, (v) => prefix + Math.round(v).toLocaleString());
  useEffect(() => {
    const c = animate(count, value, { duration: 1.6, ease: "easeOut" });
    return () => c.stop();
  }, [value]);
  if (hidden) return <span className="tracking-widest">••••••</span>;
  return <motion.span>{rounded}</motion.span>;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ card, index, maxValue, profitHidden, onToggleHide }) {
  const Icon        = card.icon;
  const isHidden    = card.hideable && profitHidden;
  const progressPct = Math.min((Math.abs(card.value) / maxValue) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
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
              : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
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
          transition={{ delay: index * 0.06 + 0.4, duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: card.accent }}
        />
      </div>
    </motion.div>
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const toDate = (ts) => ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;

const getCreatedDate = (ch) => toDate(ch.createdAt);

// Activity date — transaction se milegi sold channels ke liye
// txMap: channelId → transaction document
const getActivityDate = (ch, txMap) => {
  // 1. Transaction createdAt — most accurate for sold
  const tx = txMap?.get(ch.id);
  if (tx?.createdAt) return toDate(tx.createdAt);

  // 2. Fallbacks on channel document
  if (ch.soldAt)       return toDate(ch.soldAt);
  if (ch.terminatedAt) return toDate(ch.terminatedAt);
  if (ch.hackedAt)     return toDate(ch.hackedAt);
  if (ch.updatedAt)    return toDate(ch.updatedAt);
  return toDate(ch.createdAt);
};

// Period check
const dateInPeriod = (d, year, month) => {
  if (!d) return false;
  if (month !== null) return d.getFullYear() === year && d.getMonth() === month;
  return d.getFullYear() === year;
};

// ─── Stats calculator ─────────────────────────────────────────────────────────
const calcStats = (channels, txMap, selectedYear, selectedMonth) => {
  let sales = 0, purchases = 0, profit = 0;
  let total = 0, sold = 0, hacked = 0;
  let terminatedWithLoss = 0, terminatedWithoutLoss = 0, purchased = 0;

  const isAllTime = selectedYear === "all";
  const year  = isAllTime ? null : Number(selectedYear);
  const month = (!isAllTime && selectedMonth !== "all") ? Number(selectedMonth) : null;

  (channels || []).forEach((ch) => {
    const createdD  = getCreatedDate(ch);
    const activityD = getActivityDate(ch, txMap);   // ← txMap pass

    const purchaseInPeriod = isAllTime || dateInPeriod(createdD,  year, month);
    const activityInPeriod = isAllTime || dateInPeriod(activityD, year, month);

    if (!purchaseInPeriod && !activityInPeriod) return;

    total++;
    const p = Number(ch.purchasePrice) || 0;
    const s = Number(ch.salePrice)     || 0;

    if (purchaseInPeriod) purchases += p;

    if (activityInPeriod) {
      switch (ch.status) {
        case "sold":
          sold++;
          sales  += s;
          profit += s - p;
          break;
        case "terminatedWithLoss":
          terminatedWithLoss++;
          profit += -p;
          break;
        case "hacked":
          hacked++;
          profit += -p;
          break;
        case "terminatedWithoutLoss":
          terminatedWithoutLoss++;
          break;
        default:
          break;
      }
    }

    if (ch.status === "purchased" && purchaseInPeriod) purchased++;
  });

  return { sales, purchases, profit, total, sold, hacked,
           terminatedWithLoss, terminatedWithoutLoss, purchased };
};

// ─── Select styles ────────────────────────────────────────────────────────────
const selectCls = "px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400/40 cursor-pointer";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatsSection() {
  const [profitHidden,  setProfitHidden]  = useState(false);
  const [selectedYear,  setSelectedYear]  = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const { data: channels     = [], isLoading: chLoading } = useAllChannels();
  const { data: transactions = [], isLoading: txLoading } = useSaleTransactions();

  // ── Transaction map: channelId → tx (O(1) lookup) ─────────────────────────
  const txMap = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      if (tx.channelId && tx.purchaseOrSale === "sold") {
        map.set(tx.channelId, tx);
      }
    });
    return map;
  }, [transactions]);

  // ── Years ─────────────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const set = new Set();
    channels.forEach((ch) => {
      const d = getCreatedDate(ch);
      if (d) set.add(d.getFullYear());
      const a = getActivityDate(ch, txMap);
      if (a) set.add(a.getFullYear());
    });
    const currentYear = new Date().getFullYear();
    for (let yr = 2020; yr <= currentYear; yr++) set.add(yr);
    return Array.from(set).sort((a, b) => b - a);
  }, [channels, txMap]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return calcStats(channels, txMap, selectedYear, selectedMonth);
  }, [channels, txMap, selectedYear, selectedMonth]);

  // ── Period label ──────────────────────────────────────────────────────────
  const periodLabel = selectedYear === "all"
    ? "All Time"
    : selectedMonth !== "all"
      ? `${MONTHS[Number(selectedMonth)]} ${selectedYear}`
      : String(selectedYear);

  const isLoading = chLoading || txLoading;

  // ── Cards ─────────────────────────────────────────────────────────────────
  const cards = [
    {
      label: "Sales",          value: stats.sales,
      icon: TrendingUp,        accent: "#10b981", prefix: "$ ",
      change: `${stats.sold} sold`,
      up: stats.sales >= 0,    hideable: false,
    },
    {
      label: "Purchases",      value: stats.purchases,
      icon: ShoppingCart,      accent: "#3b82f6", prefix: "$ ",
      change: `${stats.total} channels`,
      up: true,                hideable: false,
    },
    {
      label: "Profit",         value: stats.profit,
      icon: DollarSign,        accent: "#8b5cf6", prefix: "$ ",
      change: stats.profit >= 0 ? "Profit" : "Loss",
      up: stats.profit >= 0,   hideable: true,
    },
{
  label: "Total Channels", value: stats.total,
  icon: Video,             accent: "#ef4444", prefix: "",
  change: `${stats.purchased} stock · ${stats.terminatedWithLoss + stats.terminatedWithoutLoss} terminated`,
  up: true,                hideable: false,
},
    {
      label: "Channels Sold",  value: stats.sold,
      icon: CheckCircle,       accent: "#14b8a6", prefix: "",
  
      up: true,                hideable: false,
    },
    {
      label: "Hacked / Lost",  value: stats.hacked,
      icon: AlertTriangle,     accent: "#f97316", prefix: "",
      change: `${stats.terminatedWithLoss} with loss`,
      up: false,               hideable: false,
    },
  ];

  const maxValue = Math.max(...cards.map((c) => Math.abs(c.value)), 1);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {["#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6","#f97316"].map((a, i) =>
            <SkeletonCard key={i} accent={a} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={13} className="text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Filter by:</span>

          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth("all"); }}
            className={selectCls}
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === "all"}
            className={`${selectCls} ${selectedYear === "all" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="all">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <span className="ml-auto text-xs font-semibold text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-lg">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* ── Cards grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <StatCard
            key={card.label}
            card={card}
            index={i}
            maxValue={maxValue}
            profitHidden={profitHidden}
            onToggleHide={() => setProfitHidden(!profitHidden)}
          />
        ))}
      </div>

    </div>
  );
}