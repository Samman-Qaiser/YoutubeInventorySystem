import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertTriangle, ExternalLink, X } from "lucide-react";
import { useOverdueChannels } from "../hooks/useOverdueChannels";
import Toast from "./Toast";

export default function NotificationBell() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState({ show: false, message: "", variant: "success" });
  const notificationsRef = useRef(null);

  const {
    overdueChannels,
    unreadOverdueChannels,
    markAsRead,
    markAllAsRead,
    refetchOverdue,
  } = useOverdueChannels();

  const showToast = (message, variant = "success") => {
    setToastMsg({ show: true, message, variant });
    setTimeout(() => setToastMsg({ show: false, message: "", variant: "success" }), 3000);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (channel) => {
    const youtubeUrl =
      channel.channelUrl ||
      `https://youtube.com/@${channel.channelName?.toLowerCase().replace(/\s/g, "")}`;
    window.open(youtubeUrl, "_blank");
    markAsRead(channel.id);
  };

  const getInitials = (name = "") => {
    return (
      name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0] || "")
        .join("")
        .toUpperCase() || "CH"
    );
  };

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "Unknown time";
    const createdDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - createdDate) / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sold":
        return {
          text: "Sold",
          color:
            "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        };
      case "purchased":
        return {
          text: "Purchased",
          color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        };
      case "hacked":
        return {
          text: "Hacked",
          color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
        };
      default:
        return {
          text: "Active",
          color: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
        };
    }
  };

  const AVATAR_COLORS = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-orange-400 to-amber-500",
    "from-pink-400 to-rose-500",
    "from-cyan-400 to-sky-500",
  ];

  const getAvatarColor = (id) => {
    const strId = String(id || "");
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
      hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  const totalUnread = unreadOverdueChannels.length;
  const totalNotifications = overdueChannels.length;

  const handleMarkAllAsRead = () => {
    if (totalUnread === 0) return;
    markAllAsRead();
    showToast(`Marked all ${totalUnread} notifications as read`, "success");
  };

  return (
    <>
      <div className="relative" ref={notificationsRef}>
        {/* Bell Button */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:scale-105 transition-all"
        >
          <Bell size={18} />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
              {totalNotifications}
            </span>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Overdue Ownership
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Channels older than 7 days without ownership transfer
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {totalUnread > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-emerald-500 hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      <CheckCircle size={12} />
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[450px] overflow-y-auto">
                {overdueChannels.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <CheckCircle size={24} className="text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No overdue channels
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      All channels have ownership transferred
                    </p>
                  </div>
                ) : (
                  overdueChannels.map((channel) => {
                    // ✅ FIXED: removed the incorrect '!' — channel is unread if it EXISTS in unreadOverdueChannels
                    const isUnread = unreadOverdueChannels.some(
                      (c) => c.id === channel.id
                    );
                    const statusBadge = getStatusBadge(channel.status);

                    return (
                      <div
                        key={channel.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 relative cursor-pointer ${
                          isUnread ? "bg-amber-50/30 dark:bg-amber-900/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(channel)}
                      >
                        {/* Unread dot indicator */}
                        {isUnread && (
                          <div className="absolute left-1 top-7 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Channel Avatar */}
                          <div className="shrink-0">
                            <div
                              className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center 
                              ${
                                !channel.channelProfile
                                  ? `bg-gradient-to-br ${getAvatarColor(channel.id)}`
                                  : ""
                              }`}
                            >
                              {channel.channelProfile ? (
                                <img
                                  src={channel.channelProfile}
                                  alt={channel.channelName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.classList.add(
                                      "bg-gradient-to-br",
                                      ...getAvatarColor(channel.id).split(" ")
                                    );
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-bold text-white">
                                  {getInitials(channel.channelName)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Channel Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {channel.channelName}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusBadge.color}`}
                                  >
                                    {statusBadge.text}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {channel.category || "Uncategorized"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    Created {getTimeAgo(channel.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <ExternalLink size={12} className="text-gray-400 shrink-0" />
                            </div>

                            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              <span>Ownership transfer pending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {overdueChannels.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {overdueChannels.length} channel
                    {overdueChannels.length !== 1 ? "s" : ""} need ownership transfer
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toast
        show={toastMsg.show}
        message={toastMsg.message}
        variant={toastMsg.variant}
        onClose={() => setToastMsg({ show: false, message: "", variant: "success" })}
      />
    </>
  );
}