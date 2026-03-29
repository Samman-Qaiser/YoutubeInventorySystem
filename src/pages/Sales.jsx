import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, ChevronUp, X,
  TrendingUp, TrendingDown, BadgeDollarSign, PackageSearch,
  Eye, ChevronLeft, ChevronRight, User, ShoppingBag, DollarSign, BarChart2,
} from "lucide-react";
import ViewChannelDrawer from "../components/ViewChannelDrawer";
import Toast from "../components/Toast";

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Gaming","Tech","Food","Sports","Lifestyle","Religion","Education","Entertainment","Finance","Other"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PER_PAGE   = 10;

// ─── CountUp hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let frameId;
    const startTs = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - (1 - progress) ** 3;
      setVal(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return val;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtRs(n)   { return "Rs " + (Number(n) || 0).toLocaleString(); }
function fmtDate(s) { if (!s) return "—"; return new Date(s).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" }); }
function getInitials(n="") { return n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"CH"; }

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500","from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500","from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500","from-cyan-400 to-sky-500",
];
function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

const MONO_CLS = {
  Monetized:       "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  "Not Monetized": "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  Pending:         "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
};
const CAT_CLS = {
  Gaming:"bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  Tech:"bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Food:"bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
  Sports:"bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  Lifestyle:"bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400",
  Religion:"bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  Education:"bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  Entertainment:"bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400",
  Finance:"bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Other:"bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const selectCls =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 " +
  "text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 cursor-pointer " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition";
const inputCls =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 " +
  "text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 " +
  "placeholder-gray-300 dark:placeholder-gray-600 transition";

// ─── StatCard (CountUp inside) ────────────────────────────────────────────────
function StatCard({ label, value, icon, color, prefix = "", delay = 0 }) {
  const counted = useCountUp(Math.abs(value));
  const IC = icon;
  const isNeg = value < 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3"
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}><IC size={16}/></div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{label}</p>
        <p className="text-base font-bold text-gray-800 dark:text-white truncate">
          {isNeg ? "-" : ""}{prefix}{counted.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800">
        <PackageSearch size={48} className="text-gray-300 dark:text-gray-600"/>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No sales found</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">Try adjusting your filters or date range.</p>
      </div>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition"
      >
        Clear Filters
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Sales({ channels }) {
  const sold = useMemo(() => channels.filter(c => c.status === "sold"), [channels]);

  // Overall stats
  const totalRevenue  = sold.reduce((s,c) => s + (Number(c.salePrice)||0), 0);
  const totalInvested = sold.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0);
  const totalProfit   = totalRevenue - totalInvested;
  const avgProfit     = sold.length ? Math.round(totalProfit / sold.length) : 0;

  // Filters
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [searchName,   setSearchName]   = useState("");
  const [searchSeller, setSearchSeller] = useState("");
  const [searchBuyer,  setSearchBuyer]  = useState("");
  const [category,    setCategory]    = useState("All");
  const [monoFilter,  setMonoFilter]  = useState("All");
  const [profitRange, setProfitRange] = useState("all");
  const [dateFilter,  setDateFilter]  = useState("all");
  const [dateMonth,   setDateMonth]   = useState(new Date().getMonth());
  const [dateYear,    setDateYear]    = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);

  // Modals
  const [viewChannel, setViewChannel] = useState(null);
  const [toast, setToast]             = useState({ show:false, message:"", variant:"success" });

  const filtered = useMemo(() => {
    const now       = new Date();
    const wkStart   = new Date(now); wkStart.setDate(now.getDate() - now.getDay()); wkStart.setHours(0,0,0,0);
    const lwEnd     = new Date(wkStart); lwEnd.setDate(wkStart.getDate() - 1);
    const lwStart   = new Date(lwEnd);   lwStart.setDate(lwEnd.getDate() - 6);

    return sold.filter(ch => {
      const profit = (Number(ch.salePrice)||0) - (Number(ch.purchasePrice)||0);

      if (searchName   && !ch.channelName.toLowerCase().includes(searchName.toLowerCase()))      return false;
      if (searchSeller && !(ch.sellerName||"").toLowerCase().includes(searchSeller.toLowerCase())) return false;
      if (searchBuyer  && !(ch.buyerName||"").toLowerCase().includes(searchBuyer.toLowerCase()))   return false;
      if (category   !== "All" && ch.category !== category)             return false;
      if (monoFilter !== "All" && ch.monetizationStatus !== monoFilter) return false;

      if (profitRange === "positive" && profit <= 0)   return false;
      if (profitRange === "negative" && profit >= 0)   return false;
      if (profitRange === "50k"      && profit <= 50000)   return false;
      if (profitRange === "100k"     && profit <= 100000)  return false;
      if (profitRange === "500k"     && profit <= 500000)  return false;

      // Date filter uses soldAt preferentially, falls back to createdAt
      const dateStr = ch.soldAt || ch.createdAt;
      if (dateFilter !== "all" && dateStr) {
        const d = new Date(dateStr);
        if (dateFilter === "today"     && d.toDateString() !== now.toDateString())                     return false;
        if (dateFilter === "thisWeek"  && d < wkStart)                                                 return false;
        if (dateFilter === "lastWeek"  && (d < lwStart || d > lwEnd))                                  return false;
        if (dateFilter === "thisMonth" && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
        if (dateFilter === "lastMonth") {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (d.getMonth() !== lm.getMonth() || d.getFullYear() !== lm.getFullYear()) return false;
        }
        if (dateFilter === "month" && (d.getMonth() !== Number(dateMonth) || d.getFullYear() !== Number(dateYear))) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sold, searchName, searchSeller, searchBuyer, category, monoFilter, profitRange, dateFilter, dateMonth, dateYear]);

  // Filtered summary totals
  const filtRevenue  = filtered.reduce((s,c) => s + (Number(c.salePrice)||0), 0);
  const filtInvested = filtered.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0);
  const filtProfit   = filtRevenue - filtInvested;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);

  const activeFilters = [
    searchName, searchSeller, searchBuyer,
    category   !== "All",
    monoFilter !== "All",
    profitRange !== "all",
    dateFilter  !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchName(""); setSearchSeller(""); setSearchBuyer("");
    setCategory("All"); setMonoFilter("All"); setProfitRange("all"); setDateFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Complete record of all sold channels</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-800/40">
          {sold.length} Channels Sold
        </span>
      </div>

      {/* ── Top Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Sold"       value={sold.length}    icon={ShoppingBag}    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"                                  delay={0}/>
        <StatCard label="Total Revenue"    value={totalRevenue}   icon={TrendingUp}     color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"   prefix="Rs "          delay={0.07}/>
        <StatCard label="Total Invested"   value={totalInvested}  icon={DollarSign}     color="bg-red-100 dark:bg-red-900/30 text-red-500"               prefix="Rs "          delay={0.14}/>
        <StatCard label="Total Profit"     value={totalProfit}    icon={BadgeDollarSign} color={totalProfit>=0?"bg-violet-100 dark:bg-violet-900/30 text-violet-600":"bg-orange-100 dark:bg-orange-900/30 text-orange-500"} prefix="Rs " delay={0.21}/>
        <StatCard label="Avg Profit/Sale"  value={avgProfit}      icon={BarChart2}      color="bg-amber-100 dark:bg-amber-900/30 text-amber-600"          prefix="Rs "          delay={0.28}/>
      </div>

      {/* ── Filter Toggle ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition relative
            ${filtersOpen ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
            border-gray-200 dark:border-gray-700
            ${activeFilters > 0 ? "!border-emerald-400 dark:!border-emerald-600" : ""}`}
        >
          {filtersOpen
            ? <><ChevronUp size={14}/><span className="text-gray-600 dark:text-gray-300">Hide Filters</span></>
            : <><SlidersHorizontal size={14}/><span className="text-gray-600 dark:text-gray-300">Filters</span></>}
          {activeFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
              {activeFilters}
            </span>
          )}
        </button>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1">
            <X size={11}/> Clear All Filters
          </button>
        )}
      </div>

      {/* ── Collapsible Filter Bar ────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="sb-filters"
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.28, ease:"easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Channel Name */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchName} onChange={e=>{setSearchName(e.target.value);setPage(1);}} placeholder="Channel name…" className={inputCls+" pl-8"}/>
                </div>

                {/* Seller Name */}
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchSeller} onChange={e=>{setSearchSeller(e.target.value);setPage(1);}} placeholder="Seller name…" className={inputCls+" pl-8"}/>
                </div>

                {/* Buyer Name */}
                <div className="relative">
                  <ShoppingBag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchBuyer} onChange={e=>{setSearchBuyer(e.target.value);setPage(1);}} placeholder="Buyer name…" className={inputCls+" pl-8"}/>
                </div>

                {/* Category */}
                <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>

                {/* Monetization */}
                <select value={monoFilter} onChange={e=>{setMonoFilter(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="All">All Monetization</option>
                  <option>Monetized</option>
                  <option>Not Monetized</option>
                  <option>Pending</option>
                </select>

                {/* Profit Range */}
                <select value={profitRange} onChange={e=>{setProfitRange(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="all">All Profit Ranges</option>
                  <option value="positive">Profit &gt; 0</option>
                  <option value="negative">Loss &lt; 0</option>
                  <option value="50k">Profit &gt; 50K</option>
                  <option value="100k">Profit &gt; 100K</option>
                  <option value="500k">Profit &gt; 500K</option>
                </select>

                {/* Date Filter */}
                <select value={dateFilter} onChange={e=>{setDateFilter(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="month">Custom Month</option>
                </select>

                {/* Month Picker */}
                {dateFilter === "month" && (
                  <div className="flex gap-2">
                    <select value={dateMonth} onChange={e=>setDateMonth(e.target.value)} className={selectCls}>
                      {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
                    </select>
                    <input type="number" value={dateYear} onChange={e=>setDateYear(e.target.value)} min="2020" max="2030" className={inputCls+" w-24 shrink-0"}/>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table or Empty ───────────────────────────────────────── */}
      {filtered.length === 0 ? <EmptyState onClear={clearFilters}/> : (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {["#","Channel","Seller","Buyer","Monetization","Purchase Price","Sale Price","Profit / Loss","Sale Date","Actions"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((ch, i) => {
                    const profit = (Number(ch.salePrice)||0) - (Number(ch.purchasePrice)||0);
                    const isEven = i % 2 === 0;
                    return (
                      <motion.tr
                        key={ch.id}
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0, x:12 }}
                        transition={{ delay:i*0.03, duration:0.25 }}
                        className={`border-b border-gray-50 dark:border-gray-800/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition group
                          ${isEven ? "bg-gray-50/30 dark:bg-gray-800/10" : ""}`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {(safePage-1)*PER_PAGE + i + 1}
                        </td>

                        {/* Channel */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor(ch.id)} flex items-center justify-center shrink-0`}>
                              <span className="text-[11px] font-bold text-white">{getInitials(ch.channelName)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white text-xs leading-tight">{ch.channelName}</p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${CAT_CLS[ch.category]||CAT_CLS.Other}`}>
                                {ch.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Seller */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-gray-300 dark:text-gray-600 shrink-0"/>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{ch.sellerName||"—"}</span>
                          </div>
                        </td>

                        {/* Buyer */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag size={12} className="text-gray-300 dark:text-gray-600 shrink-0"/>
                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{ch.buyerName||"—"}</span>
                          </div>
                        </td>

                        {/* Monetization */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MONO_CLS[ch.monetizationStatus]||MONO_CLS["Not Monetized"]}`}>
                            {ch.monetizationStatus||"—"}
                          </span>
                        </td>

                        {/* Purchase Price */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmtRs(ch.purchasePrice)}</span>
                        </td>

                        {/* Sale Price */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtRs(ch.salePrice)}</span>
                        </td>

                        {/* Profit / Loss pill */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                            ${profit >= 0
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"}`}
                          >
                            {profit >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                            {profit < 0 && "-"}Rs {Math.abs(profit).toLocaleString()}
                          </div>
                        </td>

                        {/* Sale Date */}
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {fmtDate(ch.soldAt || ch.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setViewChannel(ch)}
                            title="View Channel Details"
                            className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
                          ><Eye size={13}/></button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* ── Summary Footer Bar ─────────────────────────────────── */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                Showing {filtered.length} {filtered.length === 1 ? "sale" : "sales"}
              </span>
              <span className="text-gray-400 dark:text-gray-500">Revenue: <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtRs(filtRevenue)}</span></span>
              <span className="text-gray-400 dark:text-gray-500">Invested: <span className="font-bold text-blue-600 dark:text-blue-400">{fmtRs(filtInvested)}</span></span>
              <span className="text-gray-400 dark:text-gray-500">
                Net Profit:{" "}
                <span className={`font-bold ${filtProfit >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-500"}`}>
                  {filtProfit < 0 && "-"}{fmtRs(Math.abs(filtProfit))}
                </span>
              </span>
            </div>
          </div>

          {/* ── Pagination ─────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} of {filtered.length} sales
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))} disabled={safePage===1}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                ><ChevronLeft size={14}/></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = totalPages <= 5 ? i+1 : i + Math.max(1, safePage-2);
                  if (pg > totalPages) return null;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition ${pg===safePage ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                    >{pg}</button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={safePage===totalPages}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                ><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Drawers & Toasts ─────────────────────────────────────── */}
      <ViewChannelDrawer
        channel={viewChannel}
        open={!!viewChannel}
        onClose={() => setViewChannel(null)}
        onEdit={(_ch) => setViewChannel(null)}
      />
      <Toast
        show={toast.show} message={toast.message} variant={toast.variant}
        onClose={() => setToast(t => ({...t, show:false}))}
      />
    </div>
  );
}
