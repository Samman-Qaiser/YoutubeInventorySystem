import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, Share2, Copy, ExternalLink,
  MessageCircle, CheckCircle, Mail, Lock, Pencil, User
} from "lucide-react";

// ─── category theming ─────────────────────────────────────────────────────────
const CAT_BANNER = {
  Gaming:        "from-violet-500 via-purple-600 to-violet-800",
  Tech:          "from-blue-400 via-sky-500 to-blue-700",
  Food:          "from-orange-400 via-amber-500 to-orange-700",
  Sports:        "from-emerald-400 via-green-500 to-emerald-700",
  Lifestyle:     "from-pink-400 via-rose-500 to-pink-700",
  Religion:      "from-teal-400 via-emerald-500 to-teal-700",
  Education:     "from-sky-400 via-blue-500 to-sky-700",
  Entertainment: "from-rose-400 via-red-500 to-rose-700",
  Finance:       "from-blue-500 via-indigo-500 to-blue-800",
  Other:         "from-gray-400 via-slate-500 to-gray-700",
};
const CAT_TEXT = {
  Gaming:"text-violet-600", Tech:"text-blue-600", Food:"text-orange-500",
  Sports:"text-emerald-600", Lifestyle:"text-pink-500", Religion:"text-teal-600",
  Education:"text-sky-600", Entertainment:"text-rose-500", Finance:"text-blue-700", Other:"text-gray-600",
};
const CHIP_BORDER = ["border-emerald-400","border-blue-400","border-violet-400","border-amber-400"];

// ─── badge maps ───────────────────────────────────────────────────────────────
const STATUS_CLS = {
  available:"bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  sold:"bg-red-50 dark:bg-red-900/20 text-red-500",
  hacked:"bg-orange-50 dark:bg-orange-900/20 text-orange-500",
  pending:"bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
};
const MONO_CLS = {
  Monetized:"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "Not Monetized":"bg-gray-100 dark:bg-gray-800 text-gray-500",
  Pending:"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
};

// ─── small helpers ────────────────────────────────────────────────────────────
function getInitials(n=""){ return n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"CH"; }
function fmtRs(n){ const x=Number(n); return isNaN(x)||(n==null||n==="")?"—":"Rs "+x.toLocaleString(); }
function fmtNum(n){ const x=Number(n); if(isNaN(x)||n===""||n==null)return"—"; if(x>=1e6)return(x/1e6).toFixed(1)+"M"; if(x>=1e3)return(x/1e3).toFixed(0)+"K"; return String(x); }
function getVerif(v){ if(typeof v==="boolean")return v?"Verified":"Not Verified"; return v||"—"; }
function capFirst(s=""){ return s?s.charAt(0).toUpperCase()+s.slice(1):"—"; }

// ─── animation variants ───────────────────────────────────────────────────────
const secVar = {
  hidden:{opacity:0, y:10},
  visible:(i)=>({ opacity:1, y:0, transition:{ delay:i*0.05, duration:0.3, ease:"easeOut" } }),
};

// ─── copy button (inline) ─────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text||"");
    setCopied(key);
    setTimeout(()=>setCopied(null), 2000);
  };
  return { copied, copy };
}

// ─── credential row ───────────────────────────────────────────────────────────
function CredRow({ Icon, label, value, fieldKey, copied, onCopy, isPassword=false, showVal, onToggle }) {
  const displayVal = isPassword ? (showVal ? (value||"—") : "••••••••") : (value||"—");
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800/70 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-gray-400 dark:text-gray-500"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate font-mono">{displayVal}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isPassword && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition">
            {showVal ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}
        {!isPassword && value && (
          <button onClick={()=>onCopy(value, fieldKey)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-emerald-500 transition">
            {copied===fieldKey ? <CheckCircle size={14} className="text-emerald-500"/> : <Copy size={14}/>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── info cell ────────────────────────────────────────────────────────────────
function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{value||"—"}</p>
    </div>
  );
}

// ─── stat chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, borderCls }) {
  return (
    <div className={`flex-1 min-w-[100px] shrink-0 border-l-2 ${borderCls} bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3 text-center`}>
      <p className="text-base font-bold text-gray-800 dark:text-white">{value||"—"}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ViewChannelDrawer({ channel:ch, open, onClose, onEdit }) {
  const [showPass, setShowPass]   = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef(null);
  const { copied, copy } = useCopy();

  // share popup outside click
  useEffect(()=>{
    const h=(e)=>{ if(shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false); };
    if(shareOpen) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[shareOpen]);

  // Escape key
  useEffect(()=>{
    const h=(e)=>{ if(e.key==="Escape") onClose(); };
    if(open) document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[open,onClose]);

  // scroll lock
  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    return()=>{ document.body.style.overflow=""; };
  },[open]);

  if(!ch) return null;

  const banner     = CAT_BANNER[ch.category] || CAT_BANNER.Other;
  const avatarText = CAT_TEXT[ch.category]   || CAT_TEXT.Other;
  const profit     = (Number(ch.salePrice)||0) - (Number(ch.purchasePrice)||0);
  const statusText = capFirst(ch.status);
  const verifText  = getVerif(ch.verificationStatus);

  const copyLink  = async () => { await navigator.clipboard.writeText(ch.channelUrl||""); setLinkCopied(true); setTimeout(()=>setLinkCopied(false),2000); };

  return (
    <AnimatePresence>
      {open && (<>

        {/* Overlay */}
        <motion.div
          key="vcd2-ov"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          transition={{duration:0.22}}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
        />

        {/* Drawer */}
        <motion.div
          key="vcd2-dr"
          initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}}
          transition={{type:"spring", stiffness:280, damping:28}}
          className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white dark:bg-gray-950 shadow-2xl z-[100] flex flex-col"
        >

          {/* ── HERO BANNER ────────────────────────────────────── */}
<div className="relative h-28 shrink-0 overflow-visible">

  {/* Banner */}
  {ch.bannerUrl ? (
    <img
      src={ch.bannerUrl}
      alt="banner"
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div className={`absolute inset-0 bg-gradient-to-br ${banner}`} />
  )}

  {/* Overlay (optional) */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Avatar */}
  <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center z-20 overflow-hidden border-2 border-white dark:border-[#111322]">
    
    {ch.channelProfile ? (
      <img
        src={ch.channelProfile}
        alt="profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className={`text-xl font-bold ${avatarText}`}>
        {getInitials(ch.channelName)}
      </span>
    )}

  </div>

  {/* Top-right controls */}
  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">

    {/* Share */}
    <div className="relative" ref={shareRef}>
      <button
        onClick={() => setShareOpen(!shareOpen)}
        className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition"
      >
        <Share2 size={15} />
      </button>

      <AnimatePresence>
        {shareOpen && (
          <motion.div
            key="share-pop"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-30 overflow-hidden p-1"
          >
            {[
              {
                icon: Copy,
                label: "Copy Link",
                action: () => {
                  navigator.clipboard.writeText(ch.channelUrl || "");
                  setShareOpen(false);
                },
                color: "text-gray-600 dark:text-gray-300",
              },
              {
                icon: ExternalLink,
                label: "Open in Browser",
                action: () => {
                  window.open(`https://${ch.channelUrl}`, "_blank");
                  setShareOpen(false);
                },
                color: "text-gray-600 dark:text-gray-300",
              },
              {
                icon: MessageCircle,
                label: "Share on WhatsApp",
                action: () => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      (ch.channelName || "") +
                        " — " +
                        (ch.channelUrl || "")
                    )}`,
                    "_blank"
                  );
                  setShareOpen(false);
                },
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map(({ icon: Icon, label, action, color }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Icon size={13} className={color} />
                <span className={color}>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Close */}
    <button
      onClick={onClose}
      className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition"
    >
      <X size={16} />
    </button>
  </div>
</div>

          {/* ── CHANNEL IDENTITY ─── (below banner, clear avatar) */}
          <motion.div custom={0} variants={secVar} initial="hidden" animate="visible"
            className="px-5 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800/60 shrink-0"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ch.channelName}</h2>

            {ch.channelUrl && (
              <a
                href={`https://${ch.channelUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-emerald-500 transition mt-0.5"
              >
                <ExternalLink size={12}/> {ch.channelUrl}
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{ch.category}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[ch.status]||STATUS_CLS.available}`}>{statusText}</span>
              {verifText==="Verified" && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">✓ Verified</span>}
            </div>
          </motion.div>

          {/* ── SCROLLABLE BODY ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* Quick Stats Bar */}
            <motion.div custom={1} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60"
            >
              <div className="flex gap-3 overflow-x-auto pb-1">
                <StatChip label="Subscribers"  value={fmtNum(ch.channelSubscribers||ch.subscribers)} borderCls={CHIP_BORDER[0]}/>
                <StatChip label="Total Videos" value={fmtNum(ch.totalVideos)}  borderCls={CHIP_BORDER[1]}/>
                <StatChip label="Total Views"  value={fmtNum(ch.views)}         borderCls={CHIP_BORDER[2]}/>
                <StatChip label="Watch Time"   value={ch.watchTime?`${fmtNum(ch.watchTime)}h`:"—"} borderCls={CHIP_BORDER[3]}/>
              </div>
            </motion.div>

            {/* Info Grid */}
            <motion.div custom={2} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoCell label="Niche"          value={ch.channelNiche||ch.niche}/>
                <InfoCell label="Content Type"   value={ch.contentType}/>
                <InfoCell label="Channel Age"    value={ch.channelAge}/>
                <InfoCell label="Realtime Views" value={ch.realtimeViews}/>
                <InfoCell label="Brand Name"     value={ch.brandName}/>
                <InfoCell label="Verification"   value={verifText}/>
                <InfoCell label="Violation"      value={ch.violation||"None"}/>
                <InfoCell label="Ownership Transfer" value={ch.ownershipTransfer?"Yes":"No"}/>
              </div>
            </motion.div>

            {/* Monetization Card */}
            <motion.div custom={3} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60"
            >
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Monetization</p>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${MONO_CLS[ch.monetizationStatus]||MONO_CLS["Not Monetized"]}`}>
                    {ch.monetizationStatus||"Unknown"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Earning / Month</p>
                  <p className={`text-2xl font-bold ${ch.earningPerMonth?"text-emerald-500":"text-gray-300 dark:text-gray-600"}`}>
                    ${ch.earningData }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Account Details */}
            <motion.div custom={4} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60"
            >
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Account Details</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4">
                <CredRow Icon={Mail}  label="Channel Email" value={ch.channelEmail} fieldKey="email"    copied={copied} onCopy={copy}/>
                <CredRow Icon={Mail}  label="Primary Mail"  value={ch.primaryEmail}  fieldKey="primary"  copied={copied} onCopy={copy}/>
                <CredRow Icon={Lock}  label="Password"      value={ch.channelPassword} fieldKey="pass" copied={copied} onCopy={copy}
                  isPassword showVal={showPass} onToggle={()=>setShowPass(!showPass)}/>
              </div>
            </motion.div>

            {/* Pricing Strip */}
            <motion.div custom={5} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60"
            >
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Pricing</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/15 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide mb-1.5">Buy</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400">${ch.purchasePrice}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide mb-1.5">Sale</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">${ch.salePrice}</p>
                </div>
                <div className={`rounded-2xl p-3 text-center ${profit>=0?"bg-violet-50 dark:bg-violet-900/15":"bg-red-50 dark:bg-red-900/15"}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${profit>=0?"text-violet-400":"text-red-400"}`}>Profit</p>
                  <p className={`text-base font-bold ${profit>=0?"text-violet-600 dark:text-violet-400":"text-red-600 dark:text-red-400"}`}>${profit}</p>
                </div>
              </div>
              {/* Seller row */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <User size={14} className="text-gray-400 dark:text-gray-500"/>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{ch.sellerName || "—"}</p>
                </div>
              </div>
            </motion.div>

            {/* Channel URL Box */}
            <motion.div custom={6} variants={secVar} initial="hidden" animate="visible"
              className="px-5 py-4"
            >
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Channel URL</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 mb-3">
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate">{ch.channelUrl||"—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {linkCopied ? <CheckCircle size={13} className="text-emerald-500"/> : <Copy size={13}/>}
                  {linkCopied ? "Copied!" : "Copy URL"}
                </button>
                <button
                  onClick={()=>ch.channelUrl&&window.open(`https://${ch.channelUrl}`,"_blank")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <ExternalLink size={13}/> Open
                </button>
              </div>
            </motion.div>

            <div className="h-4"/>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <button
              onClick={()=>{ onClose(); onEdit(ch); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition active:scale-95"
            >
              <Pencil size={15}/> Edit Channel
            </button>
          </div>

        </motion.div>
      </>)}
    </AnimatePresence>
  );
}
