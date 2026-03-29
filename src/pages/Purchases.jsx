import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, ChevronUp, X,
  Users, TrendingUp, BadgeDollarSign, PackageOpen,
  Eye, ChevronLeft, ChevronRight, User,
} from "lucide-react";
import ViewChannelDrawer from "../components/ViewChannelDrawer";
import SaleModal from "../components/SaleModal";
import Toast from "../components/Toast";

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Gaming","Tech","Food","Sports","Lifestyle","Religion","Education","Entertainment","Finance","Other"];
const MONTHS      = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PER_PAGE    = 10;

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtRs(n) { const x = Number(n); if (isNaN(x)) return "Rs 0"; return "Rs " + x.toLocaleString(); }
function fmtSubs(n) { if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+"M"; if (n >= 1_000) return (n/1_000).toFixed(0)+"K"; return String(n||0); }
function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}
function getInitials(n="") { return n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"CH"; }

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500","from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500","from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500","from-cyan-400 to-sky-500",
];
function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

const MONO_CLS = {
  Monetized: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  "Not Monetized": "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  Pending: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
};
const OWN_CLS = {
  Changed: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  Pending:  "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
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

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, delay }) {
  const IC = icon;
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3"
    >
      <div className={`p-2.5 rounded-xl ${color}`}><IC size={16}/></div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5 }}
      className="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800">
        <PackageOpen size={48} className="text-gray-300 dark:text-gray-600"/>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No channels in stock</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">All channels have been sold or no purchases recorded yet.</p>
      </div>
    </motion.div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function Purchases({ channels, setChannels }) {
  // only pending channels
  const pending = useMemo(() => channels.filter(c => c.status === "pending"), [channels]);

  // stats
  const totalInvested = pending.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0);
  const totalExpected = pending.reduce((s,c) => s + (Number(c.salePrice)||0), 0);
  const totalProfit   = totalExpected - totalInvested;

  // filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchName,  setSearchName]  = useState("");
  const [searchSeller, setSearchSeller] = useState("");
  const [category,  setCategory]       = useState("All");
  const [monoFilter, setMonoFilter]    = useState("All");
  const [ownFilter, setOwnFilter]      = useState("All");
  const [dateFilter, setDateFilter]    = useState("all");
  const [dateMonth, setDateMonth]      = useState(new Date().getMonth());
  const [dateYear,  setDateYear]       = useState(new Date().getFullYear());
  const [page, setPage]                = useState(1);

  // modals
  const [viewChannel, setViewChannel] = useState(null);
  const [saleChannel, setSaleChannel] = useState(null);
  const [toast, setToast]             = useState({ show:false, message:"", variant:"success" });

  // date helper
  const passesDate = (ch) => {
    if (dateFilter === "all" || !ch.createdAt) return true;
    const d   = new Date(ch.createdAt);
    const now = new Date();
    if (dateFilter === "today")     return d.toDateString() === now.toDateString();
    if (dateFilter === "thisWeek")  { const s = new Date(now); s.setDate(now.getDate()-now.getDay()); return d >= s; }
    if (dateFilter === "lastWeek")  { const e = new Date(now); e.setDate(now.getDate()-now.getDay()-1); const s = new Date(e); s.setDate(e.getDate()-6); return d >= s && d <= e; }
    if (dateFilter === "thisMonth") return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    if (dateFilter === "lastMonth") { const lm = new Date(now.getFullYear(), now.getMonth()-1, 1); return d.getMonth()===lm.getMonth() && d.getFullYear()===lm.getFullYear(); }
    if (dateFilter === "month")     return d.getMonth()===Number(dateMonth) && d.getFullYear()===Number(dateYear);
    return true;
  };

  const filtered = useMemo(() => {
    return pending.filter(ch => {
      const nm   = ch.channelName.toLowerCase().includes(searchName.toLowerCase());
      const sl   = !searchSeller || (ch.sellerName||"").toLowerCase().includes(searchSeller.toLowerCase());
      const cat  = category === "All" || ch.category === category;
      const mono = monoFilter === "All" || ch.monetizationStatus === monoFilter;
      const own  = ownFilter  === "All" || (ch.ownershipStatus||"Pending") === ownFilter;
      return nm && sl && cat && mono && own && passesDate(ch);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, searchName, searchSeller, category, monoFilter, ownFilter, dateFilter, dateMonth, dateYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);

  const activeFilters = [
    searchName, searchSeller,
    category  !== "All",
    monoFilter !== "All",
    ownFilter  !== "All",
    dateFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchName(""); setSearchSeller(""); setCategory("All");
    setMonoFilter("All"); setOwnFilter("All"); setDateFilter("all");
    setPage(1);
  };

  const handleSaleConfirm = (saleData) => {
    setChannels(prev => prev.map(c =>
      c.id === saleChannel.id
        ? { ...c, status:"sold", buyerName:saleData.buyerName, salePrice:saleData.salePrice, contactNumber:saleData.contactNumber }
        : c
    ));
    setSaleChannel(null);
    setToast({ show:true, message:"Sale recorded successfully! Channel marked as sold ✓", variant:"success" });
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Purchases</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">All pending channels in stock</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-100 dark:border-blue-800/40">
            {pending.length} Channels in Stock
          </span>
        </div>
      </div>

      {/* ── Top Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Pending Channels"     value={pending.length}      icon={PackageOpen}      color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"     delay={0}/>
        <StatCard label="Total Invested"       value={fmtRs(totalInvested)} icon={BadgeDollarSign}  color="bg-red-100 dark:bg-red-900/30 text-red-500"         delay={0.07}/>
        <StatCard label="Expected Sale Value"  value={fmtRs(totalExpected)} icon={TrendingUp}      color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.14}/>
        <StatCard
          label="Expected Profit"
          value={fmtRs(totalProfit)}
          icon={Users}
          color={totalProfit >= 0 ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "bg-orange-100 dark:bg-orange-900/30 text-orange-500"}
          delay={0.21}
        />
      </div>

      {/* ── Filter Toggle Row ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition relative
            ${filtersOpen ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}
            ${activeFilters > 0 ? "border-emerald-400 dark:border-emerald-600" : ""}`}
        >
          {filtersOpen
            ? <><ChevronUp size={14}/><span className="text-gray-600 dark:text-gray-300">Hide Filters</span></>
            : <><SlidersHorizontal size={14}/><span className="text-gray-600 dark:text-gray-300">Filters</span></>
          }
          {activeFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
              {activeFilters}
            </span>
          )}
        </button>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1">
            <X size={11}/> Clear All
          </button>
        )}
      </div>

      {/* ── Collapsible Filter Bar ────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="filter-bar"
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.28, ease:"easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Search by name */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input
                    value={searchName} onChange={e => { setSearchName(e.target.value); setPage(1); }}
                    placeholder="Search channel name…" className={inputCls + " pl-8"}
                  />
                </div>

                {/* Search by seller */}
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input
                    value={searchSeller} onChange={e => { setSearchSeller(e.target.value); setPage(1); }}
                    placeholder="Search seller name…" className={inputCls + " pl-8"}
                  />
                </div>

                {/* Category */}
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className={selectCls}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>

                {/* Monetization */}
                <select value={monoFilter} onChange={e => { setMonoFilter(e.target.value); setPage(1); }} className={selectCls}>
                  <option value="All">All Monetization</option>
                  <option>Monetized</option>
                  <option>Not Monetized</option>
                  <option>Pending</option>
                </select>

                {/* Ownership */}
                <select value={ownFilter} onChange={e => { setOwnFilter(e.target.value); setPage(1); }} className={selectCls}>
                  <option value="All">All Ownership</option>
                  <option value="Changed">Changed</option>
                  <option value="Pending">Pending</option>
                </select>

                {/* Date Filter */}
                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }} className={selectCls}>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="month">Pick Month</option>
                </select>

                {/* Month picker (conditional) */}
                {dateFilter === "month" && (
                  <div className="flex gap-2 col-span-full sm:col-span-2 lg:col-span-1">
                    <select value={dateMonth} onChange={e => setDateMonth(e.target.value)} className={selectCls}>
                      {MONTHS.map((m,i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <input type="number" value={dateYear} onChange={e => setDateYear(e.target.value)} min="2020" max="2030" className={inputCls + " w-24 shrink-0"}/>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState/>
      ) : (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {["#","Channel","Seller","Subscribers","Monetization","Ownership","Purchase Price","Expected Sale","Date Added","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((ch, i) => (
                    <motion.tr
                      key={ch.id}
                      initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:12 }}
                      transition={{ delay: i * 0.03, duration:0.25 }}
                      className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition group"
                    >
                      {/* Row # */}
                      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
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
                          <span className="text-xs text-gray-600 dark:text-gray-300">{ch.sellerName||"—"}</span>
                        </div>
                      </td>

                      {/* Subscribers */}
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                        {fmtSubs(ch.channelSubscribers||ch.subscribers||0)}
                      </td>

                      {/* Monetization */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MONO_CLS[ch.monetizationStatus]||MONO_CLS["Not Monetized"]}`}>
                          {ch.monetizationStatus||"—"}
                        </span>
                      </td>

                      {/* Ownership */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${OWN_CLS[ch.ownershipStatus||"Pending"]}`}>
                          {ch.ownershipStatus||"Pending"}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{fmtRs(ch.purchasePrice)}</span>
                      </td>

                      {/* Expected Sale */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtRs(ch.salePrice)}</span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {fmtDate(ch.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewChannel(ch)}
                            title="View Details"
                            className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
                          ><Eye size={13}/></button>
                          <button
                            onClick={() => setSaleChannel(ch)}
                            title="Mark as Sold"
                            className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
                          ><BadgeDollarSign size={13}/></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} of {filtered.length} channels
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                ><ChevronLeft size={14}/></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = totalPages <= 5 ? i+1 : i + Math.max(1, safePage-2);
                  if (pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition ${pg===safePage ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                    >{pg}</button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                ><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Drawers / Modals / Toast ──────────────────────────────── */}
      <ViewChannelDrawer
        channel={viewChannel}
        open={!!viewChannel}
        onClose={() => setViewChannel(null)}
        onEdit={(_ch) => { setViewChannel(null); }}
      />

      <SaleModal
        channel={saleChannel}
        open={!!saleChannel}
        onClose={() => setSaleChannel(null)}
        onConfirm={handleSaleConfirm}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(t => ({ ...t, show:false }))}
      />
    </div>
  );
}
