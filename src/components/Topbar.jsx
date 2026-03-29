import { useState, useRef, useEffect } from "react";
import { 
  Sun, Moon, Bell, User, Menu, Settings, 
  LogOut, CheckCircle, PlusCircle, FileText, 
  RefreshCw, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Topbar({ darkMode, setDarkMode, collapsed, setMobileMenuOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'CricketZone channel sold successfully', time: '2 mins ago', icon: 'check', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', read: false },
    { id: 2, title: 'New purchase recorded: TechVault PK', time: '1 hour ago', icon: 'plus', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', read: false },
    { id: 3, title: 'Monthly report is ready', time: '3 hours ago', icon: 'file', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', read: false },
    { id: 4, title: 'IslamicReminders ownership transferred', time: 'Yesterday', icon: 'refresh', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', read: false },
    { id: 5, title: 'Hacked channel alert: DailyVlogs786', time: '2 days ago', icon: 'alert', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', read: false },
  ];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-30 transition-all duration-300
        ${collapsed ? "md:left-16" : "md:left-56"} left-0`}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Welcome back, Abbas 👋</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:scale-105 transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:scale-105 transition-all"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full leading-none border-2 border-white dark:border-gray-900">5</span>
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                  <button className="text-xs font-medium text-emerald-500 hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800/50 last:border-0 relative">
                      {!notif.read && <div className="absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      <div className={`p-2 rounded-xl shrink-0 ml-2 ${notif.bg} ${notif.color}`}>
                        {notif.icon === "check" && <CheckCircle size={16} />}
                        {notif.icon === "plus" && <PlusCircle size={16} />}
                        {notif.icon === "file" && <FileText size={16} />}
                        {notif.icon === "refresh" && <RefreshCw size={16} />}
                        {notif.icon === "alert" && <AlertTriangle size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">Abbas</span>
          </div>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-2 z-50"
              >
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <User size={16} /> My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}