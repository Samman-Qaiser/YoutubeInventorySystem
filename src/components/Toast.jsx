import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

const VARIANTS = {
  success: "bg-emerald-500",
  info:    "bg-blue-500",
  danger:  "bg-red-500",
};

export default function Toast({ message, show, onClose, variant = "success" }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed top-5 right-5 z-[200] flex items-center gap-3 ${VARIANTS[variant]} text-white px-4 py-3 rounded-2xl shadow-xl min-w-[220px] max-w-xs`}
        >
          <CheckCircle size={18} className="shrink-0" />
          <span className="text-sm font-medium flex-1">{message}</span>
          <button onClick={onClose} className="shrink-0 text-white/70 hover:text-white transition">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
