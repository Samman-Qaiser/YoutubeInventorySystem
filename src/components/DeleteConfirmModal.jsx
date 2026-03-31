import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDeleteChannel } from "../hooks/useChannels";
import toast from "react-hot-toast";

export default function DeleteConfirmModal({ channel, open, onCancel }) {
  const { mutate: deleteChannel, isPending } = useDeleteChannel();

  // Escape key
  useEffect(() => {
    const h = (e) => { 
      if (e.key === "Escape" && !isPending) onCancel(); 
    };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onCancel, isPending]);

  // scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!channel) return null;

  const handleConfirm = () => {
    deleteChannel(channel.id, {
      onSuccess: (result) => {
        const message = result?.deletedTransactions 
          ? `"${channel.channelName}" and ${result.deletedTransactions} transaction${
              result.deletedTransactions > 1 ? 's' : ''
            } deleted successfully`
          : `"${channel.channelName}" deleted successfully`;
        
        toast.success(message);
        onCancel();
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast.error("Failed to delete channel. Please try again.");
      },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="dcm-ov"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isPending && onCancel()}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />

          <motion.div
            key="dcm-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={onCancel}
                disabled={isPending}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition disabled:opacity-40"
              >
                <X size={16} />
              </button>

              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 size={28} className="text-red-500" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-2">
                Delete Channel?
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {channel.channelName}
                </span>
                ? This action will also delete all associated transactions and cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
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