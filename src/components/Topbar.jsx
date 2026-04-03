import { useState, useRef, useEffect } from "react";
import { 
  Sun, Moon, User, Menu, Settings, 
  LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";

export default function Topbar({ darkMode, setDarkMode, collapsed, setMobileMenuOpen, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Welcome back, Admin 👋</p>
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

        {/* Notification Bell Component */}
        <NotificationBell />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setProfileOpen(!profileOpen); }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">Admin</span>
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
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
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