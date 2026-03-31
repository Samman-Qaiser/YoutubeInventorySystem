import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutGrid, List, X,
  ChevronLeft, ChevronRight, Users,
  Video, ShieldAlert, CheckCircle, Eye, Pencil, Trash2,
  TrendingUp, SlidersHorizontal, ChevronUp, Plus,
} from "lucide-react";

// hooks
import { useAllChannels } from "../hooks/useChannels";

// page-level components
import AddChannelDrawer    from "../components/AddChannelDrawer";
import ViewChannelDrawer   from "../components/ViewChannelDrawer";
import EditChannelDrawer   from "../components/EditChannelDrawer";
import DeleteConfirmModal  from "../components/DeleteConfirmModal";

// sub-components
import ChannelStatCard from "../components/StatCard";
import ChannelGridCard, {
  fmtSubs, fmtDollar, getInitials,
  avatarColor, STATUS_STYLES, MONO_STYLES, CAT_COLORS,
} from "../components/ChannelGridCard";
import ChannelSkeletonGrid from "../Sekeleton/ChannelLoading";

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Gaming","Tech","Food","Sports","Lifestyle",
  "Religion","Education","Entertainment","Finance","Other",
];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── createdAt safe date parse (Firebase Timestamp or string) ─────────────────
function toDate(val) {
  if (!val) return null;
  if (typeof val?.toDate === "function") return val.toDate();
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

// ─── shared input styles ──────────────────────────────────────────────────────
const inputCls  = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 placeholder-gray-300 dark:placeholder-gray-600 transition";
const selectCls = inputCls + " cursor-pointer";

// ─── main page ────────────────────────────────────────────────────────────────
export default function Channels() {

  // ── Firebase data ──────────────────────────────────────────────────────────
  const { data: channels = [], isLoading, isError } = useAllChannels();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [view,          setView]          = useState("grid");
  const [filtersOpen,   setFiltersOpen]   = useState(false);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [viewChannel,   setViewChannel]   = useState(null);
  const [editChannel,   setEditChannel]   = useState(null);
  const [deleteChannel, setDeleteChannel] = useState(null);

  // ── filter state ───────────────────────────────────────────────────────────
  const [searchName,  setSearchName]  = useState("");
  const [searchMail,  setSearchMail]  = useState("");
  const [category,    setCategory]    = useState("All");
  const [monoFilter,  setMonoFilter]  = useState("All");
  const [dateFilter,  setDateFilter]  = useState("all");
  const [dateMonth,   setDateMonth]   = useState("");
  const [dateYear,    setDateYear]    = useState(String(new Date().getFullYear()));
  const [page,        setPage]        = useState(1);

  const GRID_PER_PAGE = 12;
  const LIST_PER_PAGE = 10;

  // ── filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = new Date();
    return channels.filter(ch => {
      const nameOk = ch.channelName?.toLowerCase().includes(searchName.toLowerCase());
      const mailOk = (ch.primaryMail ?? "").toLowerCase().includes(searchMail.toLowerCase());
      const catOk  = category   === "All" || ch.category          === category;
      const monoOk = monoFilter === "All" || ch.monetizationStatus === monoFilter;

      let dateOk = true;
      const d = toDate(ch.createdAt);
      if (d) {
        if (dateFilter === "today") {
          dateOk = d.toDateString() === now.toDateString();
        } else if (dateFilter === "thisWeek") {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0,0,0,0);
          dateOk = d >= start;
        } else if (dateFilter === "lastWeek") {
          const end   = new Date(now); end.setDate(now.getDate() - now.getDay()); end.setHours(0,0,0,0);
          const start = new Date(end); start.setDate(end.getDate() - 7);
          dateOk = d >= start && d < end;
        } else if (dateFilter === "thisMonth") {
          dateOk = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (dateFilter === "lastMonth") {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          dateOk = d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        } else if (dateFilter === "month" && dateMonth) {
          const mi = MONTHS.indexOf(dateMonth);
          dateOk = d.getMonth() === mi && d.getFullYear() === parseInt(dateYear);
        }
      }

      return nameOk && mailOk && catOk && monoOk && dateOk;
    });
  }, [channels, searchName, searchMail, category, monoFilter, dateFilter, dateMonth, dateYear]);

  // ── pagination ─────────────────────────────────────────────────────────────
  const perPage    = view === "grid" ? GRID_PER_PAGE : LIST_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const goPage     = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  // ── active filter count ────────────────────────────────────────────────────
  const activeCount = [
    searchName, searchMail,
    category   !== "All"  ? category   : "",
    monoFilter !== "All"  ? monoFilter : "",
    dateFilter !== "all"  ? dateFilter : "",
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchName(""); setSearchMail("");
    setCategory("All"); setMonoFilter("All");
    setDateFilter("all"); setDateMonth(""); setPage(1);
  };

  // ── stats (derived from Firebase data) ────────────────────────────────────
  const totalCount     = channels.length;
  const purchasedCount = channels.filter(c => c.status === "purchased").length;
  const soldCount      = channels.filter(c => c.status === "sold").length;
  const hackedCount= channels.filter(c => c.status === "hacked").length;

  // ── page numbers ───────────────────────────────────────────────────────────
  function pageNumbers() {
    const pages = [];
    let start = Math.max(1, safePage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ── loading / error states ─────────────────────────────────────────────────
  if (isLoading) return (
<ChannelSkeletonGrid />
  );

  if (isError) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm text-red-400">Failed to load channels. Please refresh.</p>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Channels</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Manage and browse all YouTube channels
          </p>
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all
            ${activeCount > 0
              ? "border-emerald-400 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
        >
          {filtersOpen ? <ChevronUp size={14} /> : <SlidersHorizontal size={14} />}
          <span>{filtersOpen ? "Hide Filters" : "Filters"}</span>
          {activeCount > 0 && (
            <span className="ml-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ChannelStatCard label="Total Channels" value={totalCount}      icon={Video}       color="bg-blue-50 dark:bg-blue-900/20 text-blue-500"     delay={0}    />
        <ChannelStatCard label="Available"        value={purchasedCount}  icon={CheckCircle} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" delay={0.05} />
        <ChannelStatCard label="Sold"            value={soldCount}       icon={TrendingUp}  color="bg-red-50 dark:bg-red-900/20 text-red-500"        delay={0.1}  />
        <ChannelStatCard label="Hacked"      value={hackedCount} icon={ShieldAlert} color="bg-orange-50 dark:bg-orange-900/20 text-orange-500" delay={0.15} />
      </div>

      {/* ── Filter Bar ── */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            key="filter-panel"
            initial={{ opacity: 0, height: 0, marginTop: -8 }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: -8 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Filter Options
                </p>
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-500 font-medium flex items-center gap-1 transition">
                    <X size={12} /> Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Name */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                  <input
                    value={searchName}
                    onChange={e => { setSearchName(e.target.value); setPage(1); }}
                    placeholder="Search by name..."
                    className={inputCls + " pl-8 pr-7"}
                  />
                  {searchName && (
                    <button onClick={() => setSearchName("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                  <input
                    value={searchMail}
                    onChange={e => { setSearchMail(e.target.value); setPage(1); }}
                    placeholder="Search by email..."
                    className={inputCls + " pl-8 pr-7"}
                  />
                  {searchMail && (
                    <button onClick={() => setSearchMail("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      <X size={12} />
                    </button>
                  )}
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

                {/* Date */}
                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }} className={selectCls}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="month">Specific Month</option>
                </select>
              </div>

              {/* Specific month picker */}
              <AnimatePresence>
                {dateFilter === "month" && (
                  <motion.div
                    key="month-picker"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                    className="grid grid-cols-2 gap-3 mt-3"
                  >
                    <select value={dateMonth} onChange={e => { setDateMonth(e.target.value); setPage(1); }} className={selectCls}>
                      <option value="">Select Month</option>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select value={dateYear} onChange={e => { setDateYear(e.target.value); setPage(1); }} className={selectCls}>
                      {["2026","2025","2024","2023"].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            {filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span>{" "}
          channels
        </p>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-lg transition ${view === "grid" ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          ><LayoutGrid size={16} /></button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition ${view === "list" ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          ><List size={16} /></button>
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">

        {/* Empty */}
        {filtered.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Video size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">No channels found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Try adjusting your filters</p>
            <button onClick={clearAll} className="text-sm text-emerald-500 hover:underline font-medium">
              Clear filters
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {view === "grid" && filtered.length > 0 && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {paginated.map((ch, i) => (
              <ChannelGridCard
                key={ch.id} ch={ch} index={i}
                onView={setViewChannel}
                onEdit={setEditChannel}
                onDelete={setDeleteChannel}
              />
            ))}
          </motion.div>
        )}

        {/* List */}
        {view === "list" && filtered.length > 0 && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {["Channel","Category","Subscribers","Monetization","Status","Buy Price","Sale Price","Date",""].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {paginated.map((ch, i) => (
                    <motion.tr
                      key={ch.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40 dark:bg-gray-800/20" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                           {!!ch.channelProfile ? (
            <img
              src={ch.channelProfile}
              alt={ch.channelName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(ch.id)} border-2 border-white dark:border-gray-900 shadow flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{getInitials(ch.channelName)}</span>
            </div>
          )}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{ch.channelName}</p>
                            <p className="text-[10px] text-gray-400">{ch.channelNiche}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${CAT_COLORS[ch.category] ?? CAT_COLORS.Other}`}>
                          {ch.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-gray-300" />
                          {fmtSubs(ch.channelSubscribers)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${MONO_STYLES[ch.monetizationStatus] ?? ""}`}>
                          {ch.monetizationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[ch.status] ?? ""}`}>
                          {ch.status?.charAt(0).toUpperCase() + ch.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{(ch.purchasePrice)}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                        {ch.salePrice ? (ch.salePrice) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">
                        {(() => {
                          const d = toDate(ch.createdAt);
                          return d ? d.toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" }) : "—";
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewChannel(ch)}   title="View"   className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"><Eye size={13}/></button>
                          <button onClick={() => setEditChannel(ch)}   title="Edit"   className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"><Pencil size={13}/></button>
                          <button onClick={() => setDeleteChannel(ch)} title="Delete" className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pagination ── */}
      {filtered.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-1.5"
        >
          <button
            onClick={() => goPage(safePage - 1)} disabled={safePage === 1}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          ><ChevronLeft size={16} /></button>

          {pageNumbers().map(p => (
            <button
              key={p} onClick={() => goPage(p)}
              className={`w-8 h-8 rounded-xl text-sm font-medium transition ${p === safePage
                ? "bg-emerald-500 text-white shadow-sm"
                : "border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >{p}</button>
          ))}

          <button
            onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          ><ChevronRight size={16} /></button>
        </motion.div>
      )}

      {/* ── FAB ── */}
      <div className="fixed bottom-7 right-7 z-[80] group">
        <span className="absolute bottom-full right-0 mb-2 px-2.5 py-1 rounded-lg bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
          Add Channel
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => setDrawerOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center transition-colors"
        ><Plus size={24} /></motion.button>
      </div>

      {/* ── Drawers & Modals ── */}
      <AddChannelDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => setDrawerOpen(false)}
      />
      <ViewChannelDrawer
        channel={viewChannel}
        open={!!viewChannel}
        onClose={() => setViewChannel(null)}
        onEdit={(ch) => { setViewChannel(null); setEditChannel(ch); }}
      />
      <EditChannelDrawer
        channel={editChannel}
        open={!!editChannel}
        onClose={() => setEditChannel(null)}
        onSave={() => setEditChannel(null)}
      />
      <DeleteConfirmModal
        channel={deleteChannel}
        open={!!deleteChannel}
        onCancel={() => setDeleteChannel(null)}
      />
    </div>
  );
}