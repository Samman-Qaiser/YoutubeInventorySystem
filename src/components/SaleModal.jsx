import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeDollarSign, User, Phone, Loader2 } from "lucide-react";

const inputCls =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 " +
  "text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2.5 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 " +
  "placeholder-gray-300 dark:placeholder-gray-600 transition-all duration-150";

export default function SaleModal({ channel, open, onClose, onConfirm, isLoading = false }) {
  const [buyerName, setBuyerName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState({});
  const [lastChannelId, setLastChannelId] = useState(null);

  // Reset fields when a NEW channel is selected (without calling setState in an effect body)
  if (channel && channel.id !== lastChannelId) {
    setLastChannelId(channel.id);
    setSalePrice(channel.salePrice != null ? String(channel.salePrice) : "");
    setBuyerName("");
    setContact("");
    setErrors({});
  }

  // Escape key
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const profit = (Number(salePrice) || 0) - (channel?.purchasePrice || 0);

  const validate = () => {
    const err = {};
    if (!buyerName.trim()) err.buyerName = "Buyer name is required";
    if (!salePrice || Number(salePrice) <= 0)
      err.salePrice = "Valid sale price is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleConfirm = () => {
    if (isLoading) return; // Don't submit if already loading
    if (!validate()) return;
    onConfirm({
      buyerName: buyerName.trim(),
      salePrice: Number(salePrice),
      contactNumber: contact.trim(),
    });
  };

  if (!channel) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="sm-ov"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />

          {/* Modal */}
          <motion.div
            key="sm-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <BadgeDollarSign size={22} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">
                      Mark as Sold
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Recording sale for{" "}
                      <strong className="text-gray-700 dark:text-gray-200">
                        {channel.channelName}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-px bg-gradient-to-r from-emerald-400 via-emerald-200 dark:via-emerald-700 to-transparent" />
              </div>

              {/* Body */}
              <div className="px-6 pb-4 flex flex-col gap-4">
                {/* Buyer Name */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Buyer Name{" "}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />
                  </label>
                  <div className="relative">
                    <User
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"
                    />
                    <input
                      value={buyerName}
                      onChange={(e) => {
                        setBuyerName(e.target.value);
                        if (errors.buyerName)
                          setErrors((v) => ({ ...v, buyerName: "" }));
                      }}
                      disabled={isLoading}
                      placeholder="Enter buyer's full name"
                      className={inputCls + " pl-8 disabled:opacity-50 disabled:cursor-not-allowed"}
                    />
                  </div>
                  {errors.buyerName && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.buyerName}
                    </p>
                  )}
                </div>

                {/* Sale Price */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Sale Price{" "}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                      Rs
                    </span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => {
                        setSalePrice(e.target.value);
                        if (errors.salePrice)
                          setErrors((v) => ({ ...v, salePrice: "" }));
                      }}
                      disabled={isLoading}
                      placeholder="0"
                      className={inputCls + " pl-9 disabled:opacity-50 disabled:cursor-not-allowed"}
                    />
                  </div>
                  {errors.salePrice && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.salePrice}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Contact Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none"
                    />
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      disabled={isLoading}
                      placeholder="+92 300 1234567"
                      className={inputCls + " pl-8 disabled:opacity-50 disabled:cursor-not-allowed"}
                    />
                  </div>
                </div>

                {/* Profit Preview */}
                <div
                  className={`rounded-xl p-3.5 border ${profit >= 0 ? "border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/10" : "border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Purchase Price
                    </span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      $ {(channel.purchasePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Sale Price
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      $ {(Number(salePrice) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 mb-2" />
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${profit >= 0 ? "text-violet-500" : "text-red-500"}`}
                    >
                      {profit >= 0 ? "Profit" : "Loss"}
                    </span>
                    <span
                      className={`text-sm font-bold ${profit >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {profit < 0 && "-"}$ {Math.abs(profit).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95
                    ${isLoading 
                      ? "bg-gray-400 cursor-not-allowed opacity-70" 
                      : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BadgeDollarSign size={15} /> Confirm Sale
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}