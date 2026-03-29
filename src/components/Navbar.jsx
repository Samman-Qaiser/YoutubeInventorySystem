import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Video, ShoppingCart,
  TrendingUp, BarChart2, ShieldAlert,
  ChevronLeft, ChevronRight, Store, X
} from "lucide-react";
import { navLinks } from "../constants/data";

const iconMap = {
  LayoutDashboard, Video, ShoppingCart,
  TrendingUp, BarChart2, ShieldAlert,
};

export default function Navbar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 z-50 flex flex-col
          ${collapsed ? "md:w-16" : "md:w-56"}
          ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className={`flex items-center gap-2 ${collapsed ? "max-md:flex md:hidden" : "flex"}`}>
            <Store className="text-emerald-500" size={22} />
            <span className="font-bold text-gray-800 dark:text-white text-lg tracking-tight">
              Abbas<span className="text-emerald-500">Stock</span>
            </span>
          </div>
          {collapsed && <Store className="text-emerald-500 mx-auto hidden md:block" size={22} />}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navLinks.map((link, i) => {
            const Icon = iconMap[link.icon];
            return (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <NavLink
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={`truncate ${collapsed ? "max-md:block md:hidden" : ""}`}>
                    {link.label}
                  </span>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`px-4 py-4 border-t border-gray-100 dark:border-gray-800 ${collapsed ? "max-md:block md:hidden" : "block"}`}>
          <p className="text-xs text-gray-400 dark:text-gray-600">v1.0.0 • Abbas Stock</p>
        </div>
      </aside>
    </>
  );
}