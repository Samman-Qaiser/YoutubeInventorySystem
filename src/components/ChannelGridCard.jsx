import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, Calendar } from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────
export function fmtSubs(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

// Dollar format — Rs hatao
export function fmtDollar(n) {
  if (!n && n !== 0) return "—";
  return "$" + Number(n).toLocaleString();
}

export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-sky-500",
];

export function avatarColor(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const STATUS_STYLES = {
  purchased:  "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  sold:       "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400",
  terminate_without_loss: "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
    terminate_with_loss: "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
};

export const MONO_STYLES = {
  Monetized:       "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  "Not Monetized": "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  Pending:         "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
};

export const CAT_COLORS = {
  Gaming:        "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  Tech:          "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Food:          "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
  Sports:        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  Lifestyle:     "bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400",
  Religion:      "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  Education:     "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  Entertainment: "bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400",
  Finance:       "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Other:         "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

function formatDate(createdAt) {
  if (!createdAt) return "—";
  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }
  const d = new Date(createdAt);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── component ────────────────────────────────────────────────────────────────
export default function ChannelGridCard({ ch, index, onView, onEdit, onDelete }) {
  const hasBanner  = !!ch.bannerUrl;
  const hasProfile = !!ch.channelProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4, boxShadow: "0 12px 28px -5px rgba(0,0,0,0.1)" }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
    >
      {/* ── Header: banner or gradient ── */}
      <div className="relative h-20">
        {hasBanner ? (
          <img
            src={ch.bannerUrl}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
           <div className={`h-20 bg-gradient-to-br ${avatarColor(ch.id)} flex items-center justify-center`}>
        <span className="text-2xl font-bold text-white tracking-wide">
          {getInitials(ch.channelName)}
        </span>
      </div>
        )}

        {/* Dark overlay so avatar + text readable on banner */}
        {hasBanner && (
          <div className="absolute inset-0 bg-black/30" />
        )}

        {/* Channel logo / initials — bottom-left, overlapping card body */}
        <div className="absolute -bottom-5 left-4">
          {hasProfile ? (
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
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 pt-7">
        {/* Name + Category */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-tight line-clamp-1">
            {ch.channelName}
          </h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[ch.category] ?? CAT_COLORS.Other}`}>
            {ch.category}
          </span>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{ch.channelNiche}</p>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[ch.status] ?? ""}`}>
            {ch.status?.charAt(0).toUpperCase() + ch.status?.slice(1)}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MONO_STYLES[ch.monetizationStatus] ?? ""}`}>
            {ch.monetizationStatus}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <p className="text-gray-400 dark:text-gray-500">Subscribers</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200">{fmtSubs(ch.channelSubscribers)}</p>
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500">Videos</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200">{ch.totalVideos || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500">Buy Price</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200">{fmtDollar(ch.purchasePrice)}</p>
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500">Sale Price</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtDollar(ch.salePrice)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(ch.createdAt)}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(ch)}
              title="View Details"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
            ><Eye size={13} /></button>
            <button
              onClick={() => onEdit(ch)}
              title="Edit Channel"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition"
            ><Pencil size={13} /></button>
            <button
              onClick={() => onDelete(ch)}
              title="Delete Channel"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition"
            ><Trash2 size={13} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}