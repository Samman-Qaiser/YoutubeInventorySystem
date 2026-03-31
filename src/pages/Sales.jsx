import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TableSkeleton from "../Sekeleton/TableSkeleton.jsx"
import {
  Search, SlidersHorizontal, ChevronUp, X,
  TrendingUp, TrendingDown, BadgeDollarSign, PackageSearch,
  Eye, ChevronLeft, ChevronRight, User, ShoppingBag, DollarSign, BarChart2,
  MoreVertical, ExternalLink, CheckCircle2, AlertTriangle, ArrowLeftRight, Skull, Loader2
} from "lucide-react";
import ViewChannelDrawer from "../components/ViewChannelDrawer";
import Toast from "../components/Toast";

// ─── Backend Imports ──────────────────────────────────────────────────────────
import { useAllChannels, useSoldChannels } from "../hooks/useChannels";
import { useSaleTransactions } from "../hooks/useTransactions.js";
import { useTransferOwnership, useReturnChannelMutation, useHackChannelMutation } from "../hooks/useChannels";

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
function fmtDate(s) { 
  if (!s) return "—"; 
  const date = s?.toDate ? s.toDate() : new Date(s);
  return date.toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" }); 
}
function getInitials(n="") { return n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"CH"; }

// Helper function to check if channel is older than 7 days
function isOlderThan7Days(createdAt) {
  if (!createdAt) return false;
  const createdDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 7;
}

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500","from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500","from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500","from-cyan-400 to-sky-500",
];
function avatarColor(id) { 
  const strId = String(id || "");
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]; 
}

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

// ─── StatCard ────────────────────────────────────────────────────────────────
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

// ─── Ownership Modal with Loading State ──────────────────────────────────────
function OwnershipModal({ channel, open, onClose, onMarkChanged, isUpdating }) {
  if (!channel) return null;
  const url = channel.channelUrl || `https://youtube.com`;
  const ownershipStatus = channel.ownershipStatus || false;
  
  // Agar already changed hai to modal automatically close ho jaye
  if (ownershipStatus && open) {
    onClose();
    return null;
  }
  
  return (
    <AnimatePresence>
      {open && !ownershipStatus && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
          >
            <div onClick={e => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            >
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
                >
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
  );
}

// ─── Confirmation Modal for Return/Hacked with Loading State ─────────────────
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, variant = "warning", isLoading }) {
  if (!isOpen) return null;
  
  const variantClasses = {
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-600",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
          >
            <div onClick={e => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variantClasses[variant]}`}>
                  {variant === "warning" && <AlertTriangle size={20}/>}
                  {variant === "danger" && <Skull size={20}/>}
                  {variant === "info" && <ArrowLeftRight size={20}/>}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2
                    ${isLoading 
                      ? "bg-gray-400 cursor-not-allowed opacity-70" 
                      : variant === "danger" 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin"/>
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Actions Menu Component with Disabled States ─────────────────────────────
function ActionsMenu({ channel, onReturn, onHack, onOwnership, isOwnershipChanged }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <MoreVertical size={14}/>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)}/>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }}
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
                onClick={() => { setOpen(false); onReturn(channel); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex items-center gap-2 transition"
              >
                <ArrowLeftRight size={13}/> Return Channel
              </button>
              
              <button 
                onClick={() => { setOpen(false); onHack(channel); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition"
              >
                <Skull size={13}/> Hacked
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function Sales() {
  // Fetch data using hooks
   const { data: allChannels = [], isLoading, isError, error, refetch } = useAllChannels();

  // ✅ Step 1: Pehle sold channels filter karo (like purchase.jsx)
  const sold = useMemo(
    () => (allChannels ?? []).filter(ch => ch.status === 'sold'),
    [allChannels]
  );
  const { data: saleTransactions = [], isLoading: loadingTx } = useSaleTransactions();
  const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnership();
  const { mutate: returnChannel, isPending: isReturning } = useReturnChannelMutation();
  const { mutate: hackChannel, isPending: isHacking } = useHackChannelMutation();
  
  const [mergedSalesData, setMergedSalesData] = useState([]);
  
  // Update merged data when sold or transactions change
  useEffect(() => {
    const merged = sold.map(channel => {
      const tx = saleTransactions.find(t => t.channelId === channel.id);
      const finalDate = tx?.createdAt || channel.soldAt || channel.createdAt;
      
      return {
        ...channel,
        buyerName: tx ? tx.buyerName : (channel.buyerName || 'N/A'),
        soldAtDate: finalDate,
        salePrice: tx ? tx.price : (channel.salePrice || 0),
        ownershipStatus: channel.ownerShip || false,
        createdAt: channel.createdAt || new Date()
      };
    });
    setMergedSalesData(merged);
  }, [sold, saleTransactions]);
  
  // Overall stats
  const totalRevenue  = useMemo(() => sold.reduce((s,c) => s + (Number(c.salePrice)||0), 0), [sold]);
  const totalInvested = useMemo(() => sold.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0), [sold]);
  const totalProfit   = totalRevenue - totalInvested;
  const avgProfit     = sold.length ? Math.round(totalProfit / sold.length) : 0;
  
  // Filters State
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [searchName,   setSearchName]   = useState("");
  const [searchSeller, setSearchSeller] = useState("");
  const [searchBuyer,  setSearchBuyer]  = useState("");
  const [category,     setCategory]     = useState("All");
  const [monoFilter,   setMonoFilter]   = useState("All");
  const [ownFilter,    setOwnFilter]    = useState("All");
  const [profitRange,  setProfitRange]  = useState("all");
  const [dateFilter,   setDateFilter]   = useState("all");
  const [dateMonth,    setDateMonth]    = useState(new Date().getMonth());
  const [dateYear,     setDateYear]     = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  
  // Modals
  const [viewChannel, setViewChannel] = useState(null);
  const [ownershipChannel, setOwnershipChannel] = useState(null);
  const [returnChannelData, setReturnChannelData] = useState(null);
  const [hackChannelData, setHackChannelData] = useState(null);
  const [toastMsg, setToastMsg] = useState({ show: false, message: "", variant: "success" });
  
  const showToast = (message, variant = "success") => {
    setToastMsg({ show: true, message, variant });
    setTimeout(() => setToastMsg({ show: false, message: "", variant: "success" }), 3000);
  };
  
  const filtered = useMemo(() => {
    return mergedSalesData.filter(ch => {
      const profit = (Number(ch.salePrice)||0) - (Number(ch.purchasePrice)||0);
      const ownerLabel = ch.ownershipStatus ? "Changed" : "Pending";
      
      if (searchName && !ch.channelName?.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (searchSeller && !(ch.sellerName||"").toLowerCase().includes(searchSeller.toLowerCase())) return false;
      if (searchBuyer && !(ch.buyerName||"").toLowerCase().includes(searchBuyer.toLowerCase())) return false;
      if (category !== "All" && ch.category !== category) return false;
      if (monoFilter !== "All" && ch.monetizationStatus !== monoFilter) return false;
      if (ownFilter !== "All" && ownerLabel !== ownFilter) return false;
      
      if (profitRange === "positive" && profit <= 0) return false;
      if (profitRange === "negative" && profit >= 0) return false;
      if (profitRange === "50k" && profit <= 50000) return false;
      if (profitRange === "100k" && profit <= 100000) return false;
      if (profitRange === "500k" && profit <= 500000) return false;
      
      const rawDate = ch.soldAtDate;
      const d = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
      const now = new Date();
      
      if (dateFilter === "today") {
        const today = new Date(); today.setHours(0,0,0,0);
        if (d < today) return false;
      } else if (dateFilter === "thisWeek") {
        const wkStart = new Date(now); wkStart.setDate(now.getDate() - now.getDay()); wkStart.setHours(0,0,0,0);
        if (d < wkStart) return false;
      } else if (dateFilter === "lastWeek") {
        const wkStart = new Date(now); wkStart.setDate(now.getDate() - now.getDay()); wkStart.setHours(0,0,0,0);
        const lwEnd = new Date(wkStart); lwEnd.setDate(wkStart.getDate() - 1);
        const lwStart = new Date(lwEnd); lwStart.setDate(lwEnd.getDate() - 6);
        if (d < lwStart || d > lwEnd) return false;
      } else if (dateFilter === "thisMonth") {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "lastMonth") {
        const lastMonth = new Date(now); lastMonth.setMonth(now.getMonth() - 1);
        if (d.getMonth() !== lastMonth.getMonth() || d.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (dateFilter === "month") {
        if (d.getMonth() !== parseInt(dateMonth) || d.getFullYear() !== parseInt(dateYear)) return false;
      }
      
      return true;
    });
  }, [mergedSalesData, searchName, searchSeller, searchBuyer, category, monoFilter, ownFilter, profitRange, dateFilter, dateMonth, dateYear]);
  
  const filtRevenue  = filtered.reduce((s,c) => s + (Number(c.salePrice)||0), 0);
  const filtInvested = filtered.reduce((s,c) => s + (Number(c.purchasePrice)||0), 0);
  const filtProfit   = filtRevenue - filtInvested;
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  
  const activeFilters = [
    searchName, searchSeller, searchBuyer,
    category !== "All",
    monoFilter !== "All",
    ownFilter !== "All",
    profitRange !== "all",
    dateFilter !== "all",
  ].filter(Boolean).length;
  
  const clearFilters = () => {
    setSearchName(""); setSearchSeller(""); setSearchBuyer("");
    setCategory("All"); setMonoFilter("All"); setOwnFilter("All");
    setProfitRange("all"); setDateFilter("all");
    setPage(1);
  };
  
  // ─── Handlers with Loading States ────────────────────────────────────────────
  const handleOwnershipChanged = () => {
    transferOwnership(ownershipChannel.id, {
      onSuccess: () => {
        showToast(`Ownership transferred for ${ownershipChannel.channelName}`, "success");
        setOwnershipChannel(null);
        refetch();
      },
      onError: (e) => {
        showToast(e.message || "Failed to update ownership", "error");
      },
    });
  };
  
  const handleReturnChannel = () => {
    returnChannel(returnChannelData.id, {
      onSuccess: () => {
        showToast(`Channel ${returnChannelData.channelName} returned to purchased`, "success");
        setReturnChannelData(null);
        refetch();
      },
      onError: (e) => {
        showToast(e.message || "Failed to return channel", "error");
      },
    });
  };
  
  const handleHackChannel = () => {
    hackChannel(hackChannelData.id, {
      onSuccess: () => {
        showToast(`Channel ${hackChannelData.channelName} marked as hacked`, "warning");
        setHackChannelData(null);
        refetch();
      },
      onError: (e) => {
        showToast(e.message || "Failed to mark as hacked", "error");
      },
    });
  };
  
  // ─── Error Handling ────────────────────────────────────────────────────────
  if (isError) {
    console.error("Sales Error:", error);
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 text-red-500">
          <p className="font-bold text-sm">Backend Connection Failed</p>
          <p className="text-xs opacity-80 mt-1">{error?.message || "Unknown error occurred"}</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs text-gray-400 underline hover:text-emerald-500 transition">Try Refreshing</button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-10 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <TableSkeleton />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Complete record of all sold channels</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-800/40">
          {sold.length} Channels Sold
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Sold" value={sold.length} icon={ShoppingBag} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0}/>
        <StatCard label="Total Revenue" value={totalRevenue} icon={TrendingUp} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" prefix="$ " delay={0.07}/>
        <StatCard label="Total Invested" value={totalInvested} icon={DollarSign} color="bg-red-100 dark:bg-red-900/30 text-red-500" prefix="$ " delay={0.14}/>
        <StatCard label="Total Profit" value={totalProfit} icon={BadgeDollarSign} color={totalProfit>=0?"bg-violet-100 dark:bg-violet-900/30 text-violet-600":"bg-orange-100 dark:bg-orange-900/30 text-orange-500"} prefix="$ " delay={0.21}/>
        <StatCard label="Avg Profit/Sale" value={avgProfit} icon={BarChart2} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" prefix="$ " delay={0.28}/>
      </div>
      
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
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchName} onChange={e=>{setSearchName(e.target.value);setPage(1);}} placeholder="Channel name…" className={inputCls+" pl-8"}/>
                </div>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchSeller} onChange={e=>{setSearchSeller(e.target.value);setPage(1);}} placeholder="Seller name…" className={inputCls+" pl-8"}/>
                </div>
                <div className="relative">
                  <ShoppingBag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"/>
                  <input value={searchBuyer} onChange={e=>{setSearchBuyer(e.target.value);setPage(1);}} placeholder="Buyer name…" className={inputCls+" pl-8"}/>
                </div>
                <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
                <select value={monoFilter} onChange={e=>{setMonoFilter(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="All">All Monetization</option>
                  <option>Monetized</option>
                  <option>Not Monetized</option>
                  <option>Pending</option>
                </select>
                <select value={ownFilter} onChange={e=>{setOwnFilter(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="All">All Ownership</option>
                  <option value="Changed">Changed</option>
                  <option value="Pending">Pending</option>
                </select>
                <select value={profitRange} onChange={e=>{setProfitRange(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="all">All Profit Ranges</option>
                  <option value="positive">Profit &gt; 0</option>
                  <option value="negative">Loss &lt; 0</option>
                  <option value="50k">Profit &gt; 50K</option>
                  <option value="100k">Profit &gt; 100K</option>
                  <option value="500k">Profit &gt; 500K</option>
                </select>
                <select value={dateFilter} onChange={e=>{setDateFilter(e.target.value);setPage(1);}} className={selectCls}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="month">Custom Month</option>
                </select>
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
      
      {filtered.length === 0 ? <EmptyState onClear={clearFilters}/> : (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35 }}
           className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto overflow-y-visible pb-20"
        >
          <div >
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  {["#","Channel","Seller","Buyer","Monetization","Ownership","Purchase Price","Sale Price","Profit / Loss","Sale Date","Actions"].map(h=>(
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
                    const isOldChannel = isOlderThan7Days(ch.createdAt);
                    const ownershipStatus = ch.ownershipStatus || false;
                    const ownerLabel = ownershipStatus ? "Changed" : "Pending";
                    const isOverdue = isOldChannel && !ownershipStatus;
                    
                    // Row styling - exactly like purchase.jsx
                    const rowBgClass = isOverdue
                      ? "bg-yellow-100 dark:bg-[#8B5CF6] hover:bg-yellow-200"
                      : isEven ? "bg-gray-50/30 dark:bg-gray-800/10" : "";
                    
                    return (
                      <motion.tr
                        key={ch.id}
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0, x:12 }}
                        transition={{ delay:i*0.03, duration:0.25 }}
                        className={`border-b border-gray-50 dark:border-gray-800/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition group ${rowBgClass}`}
                      >
                        <td className="px-4 py-3 text-xs  font-medium whitespace-nowrap">
                          {(safePage-1)*PER_PAGE + i + 1}
                          {isOverdue && <span title="Ownership overdue" className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle"/>}
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center 
                              ${!ch.channelProfile ? `bg-gradient-to-br ${avatarColor(ch.id)}` : ""}`}>
                              
                              {ch.channelProfile ? (
                                <img 
                                  src={ch.channelProfile} 
                                  alt={ch.channelName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('bg-gradient-to-br', ...avatarColor(ch.id).split(' '));
                                  }}
                                />
                              ) : (
                                <span className="text-[11px] font-bold text-white">
                                  {getInitials(ch.channelName)}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white text-xs leading-tight">
                                {ch.channelName}
                              </p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${CAT_CLS[ch.category] || CAT_CLS.Other}`}>
                                {ch.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-gray-600 dark:text-gray-100 shrink-0"/>
                            <span className="text-xs text-gray-500 dark:text-gray-100">{ch.sellerName||"—"}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag size={12} className="text-gray-600 dark:text-gray-100 shrink-0"/>
                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{ch.buyerName||"—"}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MONO_CLS[ch.monetizationStatus]||MONO_CLS["Not Monetized"]}`}>
                            {ch.monetizationStatus||"—"}
                          </span>
                        </td>
                        
                        {/* Ownership Status Column - Disabled if already changed */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => !ownershipStatus && setOwnershipChannel(ch)}
                            disabled={ownershipStatus}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition 
                              ${ownershipStatus
                                ? "bg-green-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed opacity-70"
                                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:opacity-80 cursor-pointer"
                              }`}
                            title={ownershipStatus ? "Ownership already transferred" : "Click to transfer ownership"}
                          >
                            {ownerLabel}
                          </button>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">${ch.purchasePrice}</span>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${ch.salePrice}</span>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                            ${profit >= 0
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"}`}
                          >
                            {profit >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                            {profit < 0 && "-"}$ {Math.abs(profit).toLocaleString()}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-100 whitespace-nowrap">
                          {fmtDate(ch.soldAtDate)} 
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewChannel(ch)}
                              className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
                              title="View Details"
                            >
                              <Eye size={13}/>
                            </button>
                            <ActionsMenu
                              channel={ch}
                              onReturn={setReturnChannelData}
                              onHack={setHackChannelData}
                              onOwnership={setOwnershipChannel}
                              isOwnershipChanged={ownershipStatus}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                Showing {filtered.length} {filtered.length === 1 ? "sale" : "sales"}
              </span>
              <span className="text-gray-400 dark:text-gray-500">Revenue: <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtRs(filtRevenue)}</span></span>
              <span className="text-gray-400 dark:text-gray-500">Invested: <span className="font-bold text-blue-600 dark:text-blue-400">{fmtRs(filtInvested)}</span></span>
              <span className="text-gray-400 dark:text-gray-500">Net Profit: <span className={`font-bold ${filtProfit >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-500"}`}>{filtProfit < 0 && "-"}{fmtRs(Math.abs(filtProfit))}</span></span>
            </div>
          </div>
          
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
      
      <ViewChannelDrawer
        channel={viewChannel}
        open={!!viewChannel}
        onClose={() => setViewChannel(null)}
      />
      
      <OwnershipModal
        channel={ownershipChannel}
        open={!!ownershipChannel}
        onClose={() => setOwnershipChannel(null)}
        onMarkChanged={handleOwnershipChanged}
        isUpdating={isTransferring}
      />
      
      <ConfirmationModal
        isOpen={!!returnChannelData}
        onClose={() => setReturnChannelData(null)}
        onConfirm={handleReturnChannel}
        title="Return Channel"
        message={`Are you sure you want to return "${returnChannelData?.channelName}"? `}
        variant="warning"
        isLoading={isReturning}
      />
      
      <ConfirmationModal
        isOpen={!!hackChannelData}
        onClose={() => setHackChannelData(null)}
        onConfirm={handleHackChannel}
        title="Mark as Hacked"
        message={`Are you sure you want to mark "${hackChannelData?.channelName}" as hacked? `}
        variant="danger"
        isLoading={isHacking}
      />
      
      <Toast
        show={toastMsg.show}
        message={toastMsg.message}
        variant={toastMsg.variant}
        onClose={() => setToastMsg({ show: false, message: "", variant: "success" })}
      />
    </div>
  );
}