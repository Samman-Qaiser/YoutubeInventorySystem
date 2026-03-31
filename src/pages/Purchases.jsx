import {
  useAllChannels,
  useMarkChannelSold,
  useTerminateWithLoss,
  useTerminateWithoutLoss,
  useTransferOwnership,
} from "../hooks/useChannels.js"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  Search, SlidersHorizontal, ChevronUp, X,
  Users, TrendingUp, BadgeDollarSign, PackageOpen,
  Eye, ChevronLeft, ChevronRight, User,
  MoreVertical, ExternalLink, CheckCircle2,
  AlertTriangle, TrendingDown, Loader2,
  UserCheck,
} from "lucide-react"

import SaleModal from "../components/SaleModal"
import TableSkeleton from "../Sekeleton/TableSkeleton.jsx"

// ─── constants ────────────────────────────────────────────────────────────────
const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const PER_PAGE = 10

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtRs   = (n) => { const x = Number(n); return isNaN(x) ? "$0" : "$" + x.toLocaleString() }
const fmtSubs = (n) => { const x = Number(n); if (x >= 1_000_000) return (x/1_000_000).toFixed(1)+"M"; if (x >= 1_000) return (x/1_000).toFixed(0)+"K"; return String(x||0) }
const fmtDate = (val) => {
  if (!val) return "—"
  const d = val?.toDate ? val.toDate() : new Date(val)
  return d.toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" })
}
const isOverdue = (val) => {
  if (!val) return false
  const d   = val?.toDate ? val.toDate() : new Date(val)
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 7
}
const getInitials = (n="") => n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase() || "CH"
const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500","from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500","from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500","from-cyan-400 to-sky-500",
]
const avatarColor = (str="") => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const MONO_CLS = {
  Monetized:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  "Not Monetized":"bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  Pending:       "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
}
const selectCls = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition"
const inputCls  = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 placeholder-gray-300 dark:placeholder-gray-600 transition"

// ─── sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, delay }) {
  const IC = icon
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
  )
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
      className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800">
        <PackageOpen size={48} className="text-gray-300 dark:text-gray-600"/>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No channels in stock</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">All channels have been sold or no purchases recorded yet.</p>
      </div>
    </motion.div>
  )
}

// ─── Ownership Modal with Loading State ──────────────────────────────────────
function OwnershipModal({ channel, open, onClose, onMarkChanged, isUpdating }) {
  if (!channel) return null
  const url = channel.channelUrl || `https://youtube.com`
  const ownershipStatus = channel.ownerShip || false
  
  // Agar already changed hai to modal automatically close ho jaye
  if (ownershipStatus && open) {
    onClose()
    return null
  }
  
  return (
    <AnimatePresence>
      {open && !ownershipStatus && (
        <>
          <motion.div key="own-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" />
          <motion.div key="own-modal" initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.92 }} transition={{ type:"spring", stiffness:340, damping:28 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <div onClick={e => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-blue-500"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Transfer Ownership</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{channel.channelName}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Open YouTube to transfer ownership, then mark it as changed.
              </p>
              <div className="flex flex-col gap-2">
                <a href={url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
                  <ExternalLink size={14}/> Open on YouTube
                </a>
                <button 
                  onClick={onMarkChanged}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition
                    ${isUpdating 
                      ? "bg-gray-400 cursor-not-allowed opacity-70" 
                      : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin"/>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14}/> Mark as Changed
                    </>
                  )}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Terminate Modal with Loading State ──────────────────────────────────────
function TerminateModal({ channel, open, onClose, onTerminate, isUpdating }) {
  if (!channel) return null
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="term-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" />
          <motion.div key="term-modal" initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.92 }} transition={{ type:"spring", stiffness:340, damping:28 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <div onClick={e => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-orange-500"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Terminate Channel</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{channel.channelName}</p>
                </div>
              </div>
              {/* profit preview */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 mb-5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Purchase Price</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{fmtRs(channel.purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Sale Price</span>
                  <span className="font-semibold text-emerald-600">{fmtRs(channel.salePrice)}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700"/>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Potential Profit</span>
                  <span className={`font-bold ${(channel.salePrice - channel.purchasePrice) >= 0 ? "text-violet-600" : "text-red-500"}`}>
                    {fmtRs((channel.salePrice||0) - (channel.purchasePrice||0))}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => onTerminate("without_loss")}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition
                    ${isUpdating 
                      ? "bg-gray-400 cursor-not-allowed opacity-70" 
                      : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin"/>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14}/> Terminate Without Loss
                    </>
                  )}
                </button>
                <button 
                  onClick={() => onTerminate("with_loss")}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition
                    ${isUpdating 
                      ? "bg-gray-400 cursor-not-allowed opacity-70" 
                      : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin"/>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown size={14}/> Terminate With Loss
                    </>
                  )}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Sale Modal with Loading State ──────────────────────────────────────────
// Note: SaleModal component should be updated separately to accept isLoading prop

// ─── 3-dot Actions Menu with Disabled States ─────────────────────────────────
function ActionsMenu({ channel, onSell, onTerminate, onOwnership, isOwnershipChanged }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <MoreVertical size={14}/>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)}/>
            <motion.div
              initial={{ opacity:0, scale:0.95, y:-4 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:-4 }} transition={{ duration:0.15 }}
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-[60] overflow-hidden"
            >
              {/* Transfer Ownership - Disabled if already changed */}
              <button 
                onClick={() => { 
                  if (!isOwnershipChanged) {
                    setOpen(false); 
                    onOwnership(channel);
                  }
                }}
                disabled={isOwnershipChanged}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2 transition
                  ${isOwnershipChanged 
                    ? "text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800" 
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <CheckCircle2 size={13} className={isOwnershipChanged ? "text-gray-400" : "text-blue-500"}/> 
                Transfer Ownership
                {isOwnershipChanged && <span className="text-[10px] ml-auto">(Changed)</span>}
              </button>
              
              <button 
                onClick={() => { setOpen(false); onSell(channel); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition"
              >
                <BadgeDollarSign size={13} className="text-emerald-500"/> Mark as Sold
              </button>
              
              <div className="h-px bg-gray-100 dark:bg-gray-800"/>
              
              <button 
                onClick={() => { setOpen(false); onTerminate(channel); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition"
              >
                <AlertTriangle size={13}/> Terminate Channel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function Purchases() {
  const { data: allChannels, isLoading, isError } = useAllChannels()
  const channels = useMemo(
    () => (allChannels ?? []).filter(ch => ch.status === 'purchased'),
    [allChannels]
  )
  
  // Mutations with loading states
  const { mutate: markSold, isPending: isSelling } = useMarkChannelSold()
  const { mutate: terminateWithLoss, isPending: isTerminatingLoss } = useTerminateWithLoss()
  const { mutate: terminateWithoutLoss, isPending: isTerminatingNoLoss } = useTerminateWithoutLoss()
  const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnership()

  // stats
  const totalInvested = channels.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0)
  const totalExpected = channels.reduce((s,c) => s + (Number(c.salePrice)||0), 0)
  const totalProfit   = totalExpected - totalInvested

  // filters
  const [filtersOpen,   setFiltersOpen]   = useState(false)
  const [searchName,    setSearchName]    = useState("")
  const [monoFilter,    setMonoFilter]    = useState("All")
  const [ownFilter,     setOwnFilter]     = useState("All")
  const [dateFilter,    setDateFilter]    = useState("all")
  const [dateMonth,     setDateMonth]     = useState(new Date().getMonth())
  const [dateYear,      setDateYear]      = useState(new Date().getFullYear())
  const [page,          setPage]          = useState(1)

  // modals
  const [saleChannel,      setSaleChannel]      = useState(null)
  const [terminateChannel, setTerminateChannel] = useState(null)
  const [ownershipChannel, setOwnershipChannel] = useState(null)

  const passesDate = (ch) => {
    if (dateFilter === "all" || !ch.createdAt) return true
    const d   = ch.createdAt?.toDate ? ch.createdAt.toDate() : new Date(ch.createdAt)
    const now = new Date()
    if (dateFilter === "today")     return d.toDateString() === now.toDateString()
    if (dateFilter === "thisWeek")  { const s = new Date(now); s.setDate(now.getDate()-now.getDay()); return d >= s }
    if (dateFilter === "thisMonth") return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
    if (dateFilter === "lastMonth") { const lm = new Date(now.getFullYear(), now.getMonth()-1, 1); return d.getMonth()===lm.getMonth() && d.getFullYear()===lm.getFullYear() }
    if (dateFilter === "month")     return d.getMonth()===Number(dateMonth) && d.getFullYear()===Number(dateYear)
    return true
  }

  const filtered = useMemo(() => {
    return channels.filter(ch => {
      const nm   = (ch.channelName||"").toLowerCase().includes(searchName.toLowerCase())
      const mono = monoFilter === "All" || ch.monetizationStatus === monoFilter
      const own  = ownFilter  === "All" || (ch.ownerShip ? "Changed" : "Pending") === ownFilter
      return nm && mono && own && passesDate(ch)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, searchName, monoFilter, ownFilter, dateFilter, dateMonth, dateYear])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE)

  const activeFilters = [searchName, monoFilter !== "All", ownFilter !== "All", dateFilter !== "all"].filter(Boolean).length

  const clearFilters = () => { setSearchName(""); setMonoFilter("All"); setOwnFilter("All"); setDateFilter("all"); setPage(1) }

  // ── handlers with loading states ────────────────────────────────────────────────
  const handleSaleConfirm = ({ buyerName, salePrice, contactNumber }) => {
    markSold(
      { id: saleChannel.id, salePrice, customerName: buyerName, contactNumber },
      {
        onSuccess: () => { toast.success("Channel marked as sold!"); setSaleChannel(null) },
        onError:   (e) => toast.error(e.message || "Failed to mark as sold"),
      }
    )
  }

  const handleTerminate = (type) => {
    const ch = terminateChannel
    const mutate = type === "with_loss" ? terminateWithLoss : terminateWithoutLoss
    mutate(
      { id: ch.id, channelData: ch },
      {
        onSuccess: () => {
          toast.success(type === "with_loss" ? "Terminated with loss" : "Terminated without loss")
          setTerminateChannel(null)
        },
        onError: (e) => toast.error(e.message || "Failed to terminate"),
      }
    )
  }

  const handleOwnershipChanged = () => {
    transferOwnership(ownershipChannel.id, {
      onSuccess: () => { toast.success("Ownership marked as transferred!"); setOwnershipChannel(null) },
      onError:   (e) => toast.error(e.message || "Failed to update ownership"),
    })
  }

  if (isLoading) return <TableSkeleton />

  if (isError) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-red-500 text-sm">Failed to load channels. Please refresh.</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Purchases</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">All purchased channels in stock</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-100 dark:border-blue-800/40">
          {channels.length} Channels in Stock
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Purchased Channels"  value={channels.length}      icon={PackageOpen}     color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"        delay={0}/>
        <StatCard label="Total Invested"      value={fmtRs(totalInvested)} icon={BadgeDollarSign} color="bg-red-100 dark:bg-red-900/30 text-red-500"           delay={0.07}/>
        <StatCard label="Expected Sale Value" value={fmtRs(totalExpected)} icon={TrendingUp}      color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.14}/>
        <StatCard label="Expected Profit"     value={fmtRs(totalProfit)}   icon={Users}
          color={totalProfit >= 0 ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "bg-orange-100 dark:bg-orange-900/30 text-orange-500"} delay={0.21}/>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition ${filtersOpen ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"} ${activeFilters > 0 ? "border-emerald-400 dark:border-emerald-600" : ""}`}>
          {filtersOpen ? <><ChevronUp className="text-gray-600  dark:text-gray-300" size={14}/><span className="text-gray-600 dark:text-gray-300">Hide Filters</span></> : <><SlidersHorizontal className="text-gray-600  dark:text-gray-300" size={14}/><span className="text-gray-600 dark:text-gray-300">Filters</span></>}
          {activeFilters > 0 && <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">{activeFilters}</span>}
        </button>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1">
            <X size={11}/> Clear All
          </button>
        )}
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div key="fb" initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.28 }} className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchName} onChange={e => { setSearchName(e.target.value); setPage(1) }} placeholder="Search channel name…" className={inputCls + " pl-8"}/>
                </div>
                <select value={monoFilter} onChange={e => { setMonoFilter(e.target.value); setPage(1) }} className={selectCls}>
                  <option value="All">All Monetization</option>
                  <option>Monetized</option><option>Not Monetized</option><option>Pending</option>
                </select>
                <select value={ownFilter} onChange={e => { setOwnFilter(e.target.value); setPage(1) }} className={selectCls}>
                  <option value="All">All Ownership</option>
                  <option value="Changed">Changed</option>
                  <option value="Pending">Pending</option>
                </select>
                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }} className={selectCls}>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="month">Pick Month</option>
                </select>
                {dateFilter === "month" && (
                  <div className="flex gap-2 col-span-full sm:col-span-2 lg:col-span-1">
                    <select value={dateMonth} onChange={e => setDateMonth(e.target.value)} className={selectCls}>
                      {MONTHS.map((m,i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <input type="number" value={dateYear} onChange={e => setDateYear(e.target.value)} min="2020" max="2035" className={inputCls + " w-24 shrink-0"}/>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {filtered.length === 0 ? <EmptyState/> : (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
         className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto overflow-y-visible pb-20">
          <div>
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {["#","Channel","Seller","Subscribers","Monetization","Ownership","Purchase Price","Expected Sale","Date Added","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((ch, i) => {
                    const overdue    = isOverdue(ch.createdAt) && !ch.ownerShip
                    const ownerLabel = ch.ownerShip ? "Changed" : "Pending"
                    const isOwnershipChanged = ch.ownerShip || false
                    
                    return (
                      <motion.tr key={ch.id}
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0, x:12 }} transition={{ delay: i*0.03, duration:0.25 }}
                        className={`border-b border-gray-50 dark:border-gray-800/60 transition group
                          ${overdue
                            ? "bg-yellow-200 dark:bg-[#8B5CF6] hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            : ""
                          }`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                          {(safePage-1)*PER_PAGE + i + 1}
                          {overdue && <span title="Ownership overdue" className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle"/>}
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
                              <p className="font-semibold text-gray-800 dark:text-white text-xs leading-tight">{ch.channelName}</p>
                              <p className="text-[10px] text-gray-600 dark:text-gray-200">{ch.channelNiche || ch.contentType || "—"}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                            <UserCheck size={13} className="text-gray-600 dark:text-gray-200 shrink-0"/>
                            {ch.sellerName || "N/A"}
                          </div>
                        </td>
                        
                        {/* Subscribers */}
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {fmtSubs(ch.channelSubscribers || 0)}
                        </td>

                        {/* Monetization */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MONO_CLS[ch.monetizationStatus] || MONO_CLS["Not Monetized"]}`}>
                            {ch.monetizationStatus || "—"}
                          </span>
                        </td>

                        {/* Ownership - Disabled if already changed */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => !isOwnershipChanged && setOwnershipChannel(ch)}
                            disabled={isOwnershipChanged}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition 
                              ${isOwnershipChanged
                                ? "bg-green-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-70"
                                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:opacity-80 cursor-pointer"
                              }`}
                            title={isOwnershipChanged ? "Ownership already transferred" : "Click to transfer ownership"}
                          >
                            {ownerLabel}
                          </button>
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
                          <ActionsMenu
                            channel={ch}
                            onSell={setSaleChannel}
                            onTerminate={setTerminateChannel}
                            onOwnership={setOwnershipChannel}
                            isOwnershipChanged={isOwnershipChanged}
                          />
                         </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={safePage===1}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft size={14}/>
                </button>
                {Array.from({ length: Math.min(totalPages,5) }, (_,i) => {
                  const pg = totalPages <= 5 ? i+1 : i + Math.max(1, safePage-2)
                  if (pg > totalPages) return null
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition ${pg===safePage ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-emerald-50"}`}>
                      {pg}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Modals with loading states */}
      <SaleModal
        channel={saleChannel}
        open={!!saleChannel}
        onClose={() => setSaleChannel(null)}
        onConfirm={handleSaleConfirm}
        isLoading={isSelling}
      />
      
      <OwnershipModal
        channel={ownershipChannel}
        open={!!ownershipChannel}
        onClose={() => setOwnershipChannel(null)}
        onMarkChanged={handleOwnershipChanged}
        isUpdating={isTransferring}
      />
      
      <TerminateModal
        channel={terminateChannel}
        open={!!terminateChannel}
        onClose={() => setTerminateChannel(null)}
        onTerminate={handleTerminate}
        isUpdating={isTerminatingLoss || isTerminatingNoLoss}
      />
    </div>
  )
}