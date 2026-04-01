// src/pages/HackedChannels.jsx
import { useAllChannels } from "../hooks/useChannels.js"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, SlidersHorizontal, ChevronUp, X,
  PackageOpen, BadgeDollarSign, TrendingDown,
  ChevronLeft, ChevronRight, UserCheck,
  ShieldX, AlertOctagon, Hash, Eye,
} from "lucide-react"
import ChannelStatCard from "../components/StatCard"
import TableSkeleton from "../Sekeleton/TableSkeleton.jsx"
import ViewChannelDrawer from "../components/ViewChannelDrawer"

// ─── constants ────────────────────────────────────────────────────────────────
const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const YEARS   = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
const PER_PAGE = 10

const STATUS_FILTER_OPTIONS = [
  { value: "all",                   label: "All" },
  { value: "hacked",                label: "Hacked" },
  { value: "terminatewithloss",   label: "Terminate with Loss" },
  { value: "terminatewithoutloss",label: "Terminate without Loss" },
]

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtRs   = (n) => { const x = Number(n); return isNaN(x) ? "$0" : "$" + x.toLocaleString() }
const fmtSubs = (n) => { const x = Number(n); if (x >= 1_000_000) return (x/1_000_000).toFixed(1)+"M"; if (x >= 1_000) return (x/1_000).toFixed(0)+"K"; return String(x||0) }
const fmtDate = (val) => {
  if (!val) return "—"
  const d = val?.toDate ? val.toDate() : new Date(val)
  return d.toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" })
}
const getInitials = (n="") => n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase() || "CH"
const AVATAR_COLORS = [
  "from-red-400 to-rose-500","from-orange-400 to-amber-500",
  "from-violet-400 to-purple-500","from-pink-400 to-fuchsia-500",
  "from-red-500 to-orange-500","from-rose-400 to-pink-500",
]
const avatarColor = (str="") => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const STATUS_BADGE = {
  hacked: {
    cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    label: "Hacked",
  },
  terminatewithloss: {
    cls: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    label: "Terminated (Loss)",
  },
  terminatewithoutloss: {
    cls: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    label: "Terminated (No Loss)",
  },
}

const selectCls = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition"
const inputCls  = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 placeholder-gray-300 dark:placeholder-gray-600 transition"

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
      className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800">
        <PackageOpen size={48} className="text-gray-300 dark:text-gray-600"/>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No records found</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">No hacked or terminated channels match the selected filters.</p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HackedChannels() {
  const { data: allChannels, isLoading, isError } = useAllChannels()

  // Only hacked + terminated channels
  const channels = useMemo(
    () => (allChannels ?? []).filter(ch =>
      ["hacked", "terminatewithloss", "terminatewithoutloss"].includes(ch.status)
    ),
    [allChannels]
  )

  // ── Filters state ────────────────────────────────────────────────────────────
  const [filtersOpen,  setFiltersOpen]  = useState(false)
  const [searchName,   setSearchName]   = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter,   setYearFilter]   = useState("all")
  const [monthFilter,  setMonthFilter]  = useState("all")
  const [page,         setPage]         = useState(1)
  const [viewChannel,  setViewChannel]  = useState(null)

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return channels.filter(ch => {
      // name search
      const nm = (ch.channelName||"").toLowerCase().includes(searchName.toLowerCase())

      // status filter
      const st = statusFilter === "all" || ch.status === statusFilter

      // pick the relevant date field per status
      const rawDate = ch.hackedAt || ch.terminatedAt || ch.updatedAt || ch.createdAt
      const d = rawDate?.toDate ? rawDate.toDate() : rawDate ? new Date(rawDate) : null

      // year filter
      const yr = yearFilter === "all" || (d && d.getFullYear() === Number(yearFilter))

      // month filter (0-indexed)
      const mo = monthFilter === "all" || (d && d.getMonth() === Number(monthFilter))

      return nm && st && yr && mo
    })
  }, [channels, searchName, statusFilter, yearFilter, monthFilter])

  // ── Stats (react to filters) ─────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalPurchase = 0
    let totalProfit   = 0
    let totalLoss     = 0

    filtered.forEach(ch => {
      const purchase = Number(ch.purchasePrice) || 0
      const sale     = Number(ch.salePrice)     || 0

      totalPurchase += purchase

      if (ch.status === "hacked") {
        totalLoss += purchase          // full purchase lost
      } else if (ch.status === "terminatewithloss") {
        totalLoss += purchase
      } 
    })

    return { totalPurchase, totalProfit, totalLoss, total: filtered.length }
  }, [filtered])

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE)

  const activeFilters = [searchName, statusFilter !== "all", yearFilter !== "all", monthFilter !== "all"].filter(Boolean).length
  const clearFilters  = () => { setSearchName(""); setStatusFilter("all"); setYearFilter("all"); setMonthFilter("all"); setPage(1) }

  if (isLoading) return <TableSkeleton />
  if (isError)   return (
    <div className="flex items-center justify-center py-32">
      <p className="text-red-500 text-sm">Failed to load channels. Please refresh.</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hacked &amp; Terminated</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Channels that were hacked or terminated</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-800/40">
          {channels.length} Total Records
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ChannelStatCard
          label="Total Channels"
          value={stats.total}
          icon={Hash}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
          delay={0}
        />
        <ChannelStatCard
          label="Total Purchase"
          value={fmtRs(stats.totalPurchase)}
          icon={BadgeDollarSign}
          color="bg-red-100 dark:bg-red-900/30 text-red-500"
          delay={0.07}
        />
        <ChannelStatCard
          label="Total Profit"
          value={fmtRs(stats.totalProfit)}
          icon={ShieldX}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
          delay={0.14}
        />
        <ChannelStatCard
          label="Total Loss"
          value={fmtRs(stats.totalLoss)}
          icon={TrendingDown}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-500"
          delay={0.21}
        />
      </div>

      {/* ── Filter toggle ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition
            ${filtersOpen ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}
            ${activeFilters > 0 ? "border-red-400 dark:border-red-600" : ""}`}
        >
          {filtersOpen
            ? <><ChevronUp className="text-gray-600  dark:text-gray-300" size={14}/><span className="text-gray-600 dark:text-gray-300">Hide Filters</span></>
            : <><SlidersHorizontal className="text-gray-600  dark:text-gray-300" size={14}/><span className="text-gray-600  dark:text-gray-300">Filters</span></>
          }
          {activeFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
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

      {/* ── Filter Bar ── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div key="fb"
            initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.28 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input
                    value={searchName}
                    onChange={e => { setSearchName(e.target.value); setPage(1) }}
                    placeholder="Search channel name…"
                    className={inputCls + " pl-8"}
                  />
                </div>

                {/* Status filter */}
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
                  {STATUS_FILTER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* Year filter */}
                <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1) }} className={selectCls}>
                  <option value="all">All Years</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Month filter */}
                <select value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setPage(1) }} className={selectCls}>
                  <option value="all">All Months</option>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      {filtered.length === 0 ? <EmptyState/> : (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto pb-20"
        >
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                {["#","Channel","Seller","Subscribers","Status","Purchase Price","Date","View"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map((ch, i) => {
                  const badge = STATUS_BADGE[ch.status] || STATUS_BADGE["hacked"]
                  const activityDate = ch.hackedAt || ch.terminatedAt || ch.updatedAt || ch.createdAt

                  return (
                    <motion.tr key={ch.id}
                      initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:12 }} transition={{ delay: i*0.03, duration:0.25 }}
                      className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-red-50/30 dark:hover:bg-red-900/5 transition group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                        {(safePage-1)*PER_PAGE + i + 1}
                      </td>

                      {/* Channel */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {ch.channelProfile
                            ? <img src={ch.channelProfile} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0"/>
                            : <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor(ch.id)} flex items-center justify-center shrink-0`}>
                                <span className="text-[11px] font-bold text-white">{getInitials(ch.channelName)}</span>
                              </div>
                          }
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white text-xs leading-tight">{ch.channelName || "—"}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{ch.channelNiche || ch.contentType || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <UserCheck size={13} className="text-gray-400 shrink-0"/>
                          {ch.sellerName || "N/A"}
                        </div>
                      </td>

                      {/* Subscribers */}
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                        {fmtSubs(ch.channelSubscribers || ch.subscribers || 0)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {fmtRs(ch.purchasePrice)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {fmtDate(activityDate)}
                      </td>

                      {/* View */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setViewChannel(ch)}
                          className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition"
                          title="View details"
                        >
                          <Eye size={14}/>
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={safePage===1}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft size={14}/>
                </button>
                {Array.from({ length: Math.min(totalPages,5) }, (_,i) => {
                  const pg = totalPages <= 5 ? i+1 : i + Math.max(1, safePage-2)
                  if (pg > totalPages) return null
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition ${pg===safePage ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50"}`}>
                      {pg}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* View Drawer */}
      <ViewChannelDrawer
        channel={viewChannel}
        open={!!viewChannel}
        onClose={() => setViewChannel(null)}
        onEdit={() => setViewChannel(null)}
      />

    </div>
  )
}