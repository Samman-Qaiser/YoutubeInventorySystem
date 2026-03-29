import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, Eye, EyeOff } from "lucide-react";

// ─── constants ──────────────────────────────────────────────────────────────
const CATEGORIES = ["Gaming","Tech","Food","Sports","Lifestyle","Religion","Education","Entertainment","Finance","Other"];
const STATUSES   = ["available","sold","hacked","pending"];
const VIOLATIONS = ["None","Strike","Community Guidelines","Copyright"];

const EMPTY = {
  channelName:"", channelUrl:"", brandName:"", category:"", niche:"",
  contentType:"", subscribers:"", totalVideos:"", views:"", realtimeViews:"",
  watchTime:"", channelAge:"", monetizationStatus:"", earningPerMonth:"",
  verificationStatus:"", violation:"None", ownershipTransfer:false,
  channelEmail:"", channelPassword:"", primaryMail:"",
  purchasePrice:"", salePrice:"", status:"",
};

const REQUIRED = ["channelName","category","monetizationStatus","channelEmail","channelPassword","purchasePrice","status"];

// Field indices for Enter-key navigation (must match ref array order below)
// 0:channelName  1:channelUrl  2:brandName  3:category  4:niche
// 5:contentType  6:subscribers 7:totalVideos 8:views     9:realtimeViews
// 10:watchTime  11:channelAge 12:monetizationStatus 13:earningPerMonth
// 14:verificationStatus 15:violation 16:ownershipTransfer(toggle)
// 17:channelEmail 18:channelPassword 19:primaryMail
// 20:purchasePrice 21:salePrice 22:status(last→submit)
const TOTAL_FIELDS = 23;

// ─── input style ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 " +
  "text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2.5 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 " +
  "placeholder-gray-300 dark:placeholder-gray-600 transition-all duration-150";
const selectCls = inputCls + " cursor-pointer";

// ─── section animation variants ──────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" } }),
};

// ─── small helpers ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="mt-6 first:mt-0 mb-3">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{children}</p>
      <div className="mt-2 h-px bg-gradient-to-r from-gray-100 dark:from-gray-800 via-gray-200 dark:via-gray-700 to-transparent" />
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── main drawer ─────────────────────────────────────────────────────────────
export default function AddChannelDrawer({ open, onClose, onSuccess }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);

  // Ref array for Enter-key navigation
  const fieldRefs = useRef(Array.from({ length: TOTAL_FIELDS }, () => null));
  const setRef = (i) => (el) => { fieldRefs.current[i] = el; };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
  };

  // ── Enter-key navigation ───────────────────────────────────────────────────
  const focusNext = useCallback((currentIndex) => {
    const next = fieldRefs.current[currentIndex + 1];
    if (!next) return; // last field handled separately

    next.focus();

    // Place cursor at END of existing text for text/email/password/number inputs
    const tag  = next.tagName?.toLowerCase();
    const type = next.type?.toLowerCase();
    const textTypes = ["text","email","password","search","url","tel"];
    if (tag === "input" && textTypes.includes(type)) {
      const len = (next.value || "").length;
      try { next.setSelectionRange(len, len); } catch { /* number inputs don't support this */ }
    }
    // For number inputs just focus is enough (setSelectionRange throws)
  }, []);

  const handleKeyDown = useCallback((e, index, isLast = false) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (isLast) {
      // Trigger submit on last field
      document.getElementById("drawer-submit-btn")?.click();
      return;
    }

    // Toggle switch at index 16
    if (index === 16) {
      set("ownershipTransfer", !form.ownershipTransfer);
      focusNext(index);
      return;
    }

    focusNext(index);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNext, form.ownershipTransfer]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const validate = () => {
    const newErr = {};
    REQUIRED.forEach(k => { if (!form[k] || form[k] === "") newErr[k] = "This field is required"; });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("New channel data:", form);
    onSuccess();
    setForm(EMPTY);
    setErrors({});
    setShowPass(false);
  };

  const handleCancel = useCallback(() => {
    onClose();
    setTimeout(() => { setForm(EMPTY); setErrors({}); setShowPass(false); }, 350);
  }, [onClose]);

  // shorthand for key handler
  const kd = (i, isLast = false) => (e) => handleKeyDown(e, i, isLast);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-[100] flex flex-col border-l-2 border-emerald-500"
          >
            {/* Header */}
            <div className="shrink-0 px-5 pt-5 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Add New Channel</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Fill in the channel details below</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <X size={18} />
                </button>
              </div>
              {/* Header gradient line */}
              <div className="h-px bg-gradient-to-r from-emerald-400 via-emerald-200 dark:via-emerald-700 to-transparent" />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-3 pb-6">

              {/* ── Section 1: Channel Info ── */}
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Channel Info</SectionLabel>
                <div className="flex flex-col gap-3">

                  <Field label="Channel Name" required error={errors.channelName}>
                    <input ref={setRef(0)} value={form.channelName}
                      onChange={e => set("channelName", e.target.value)} onKeyDown={kd(0)}
                      placeholder="e.g. TechVault PK" className={inputCls} />
                  </Field>

                  <Field label="Channel URL" error={errors.channelUrl}>
                    <div className="relative">
                      <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                      <input ref={setRef(1)} value={form.channelUrl}
                        onChange={e => set("channelUrl", e.target.value)} onKeyDown={kd(1)}
                        placeholder="youtube.com/channel..." className={inputCls + " pl-8"} />
                    </div>
                  </Field>

                  <Field label="Brand Name" error={errors.brandName}>
                    <input ref={setRef(2)} value={form.brandName}
                      onChange={e => set("brandName", e.target.value)} onKeyDown={kd(2)}
                      placeholder="e.g. TechVault" className={inputCls} />
                  </Field>

                  <Field label="Category" required error={errors.category}>
                    <select ref={setRef(3)} value={form.category}
                      onChange={e => set("category", e.target.value)} onKeyDown={kd(3)}
                      className={selectCls}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Niche" error={errors.niche}>
                    <input ref={setRef(4)} value={form.niche}
                      onChange={e => set("niche", e.target.value)} onKeyDown={kd(4)}
                      placeholder="e.g. Gadgets & Reviews" className={inputCls} />
                  </Field>

                  <Field label="Content Type" error={errors.contentType}>
                    <select ref={setRef(5)} value={form.contentType}
                      onChange={e => set("contentType", e.target.value)} onKeyDown={kd(5)}
                      className={selectCls}>
                      <option value="">Select type</option>
                      <option>Long-form</option>
                      <option>Short-form</option>
                      <option>Mixed</option>
                    </select>
                  </Field>
                </div>
              </motion.div>

              {/* ── Section 2: Channel Stats ── */}
              <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Channel Stats</SectionLabel>
                <div className="grid grid-cols-2 gap-3">

                  <Field label="Subscribers" error={errors.subscribers}>
                    <input ref={setRef(6)} value={form.subscribers}
                      onChange={e => set("subscribers", e.target.value)} onKeyDown={kd(6)}
                      placeholder="e.g. 125K" className={inputCls} />
                  </Field>

                  <Field label="Total Videos" error={errors.totalVideos}>
                    <input ref={setRef(7)} value={form.totalVideos}
                      onChange={e => set("totalVideos", e.target.value)} onKeyDown={kd(7)}
                      placeholder="e.g. 312" className={inputCls} />
                  </Field>

                  <Field label="Total Views" error={errors.views}>
                    <input ref={setRef(8)} value={form.views}
                      onChange={e => set("views", e.target.value)} onKeyDown={kd(8)}
                      placeholder="e.g. 4.2M" className={inputCls} />
                  </Field>

                  <Field label="Realtime Views" error={errors.realtimeViews}>
                    <input ref={setRef(9)} value={form.realtimeViews}
                      onChange={e => set("realtimeViews", e.target.value)} onKeyDown={kd(9)}
                      placeholder="e.g. 1.5K/day" className={inputCls} />
                  </Field>

                  <Field label="Watch Time (hrs)" error={errors.watchTime}>
                    <input ref={setRef(10)} type="number" value={form.watchTime}
                      onChange={e => set("watchTime", e.target.value)} onKeyDown={kd(10)}
                      placeholder="e.g. 80000" className={inputCls} />
                  </Field>

                  <Field label="Channel Age" error={errors.channelAge}>
                    <input ref={setRef(11)} value={form.channelAge}
                      onChange={e => set("channelAge", e.target.value)} onKeyDown={kd(11)}
                      placeholder="e.g. 2 years" className={inputCls} />
                  </Field>
                </div>
              </motion.div>

              {/* ── Section 3: Monetization & Status ── */}
              <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Monetization & Status</SectionLabel>
                <div className="flex flex-col gap-3">

                  <Field label="Monetization Status" required error={errors.monetizationStatus}>
                    <select ref={setRef(12)} value={form.monetizationStatus}
                      onChange={e => set("monetizationStatus", e.target.value)} onKeyDown={kd(12)}
                      className={selectCls}>
                      <option value="">Select status</option>
                      <option>Monetized</option>
                      <option>Not Monetized</option>
                      <option>Pending</option>
                    </select>
                  </Field>

                  <Field label="Earning per Month (Rs)" error={errors.earningPerMonth}>
                    <input ref={setRef(13)} type="number" value={form.earningPerMonth}
                      onChange={e => set("earningPerMonth", e.target.value)} onKeyDown={kd(13)}
                      placeholder="e.g. 15000" className={inputCls} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Verification" error={errors.verificationStatus}>
                      <select ref={setRef(14)} value={form.verificationStatus}
                        onChange={e => set("verificationStatus", e.target.value)} onKeyDown={kd(14)}
                        className={selectCls}>
                        <option value="">Select</option>
                        <option>Verified</option>
                        <option>Not Verified</option>
                      </select>
                    </Field>

                    <Field label="Violation" error={errors.violation}>
                      <select ref={setRef(15)} value={form.violation}
                        onChange={e => set("violation", e.target.value)} onKeyDown={kd(15)}
                        className={selectCls}>
                        {VIOLATIONS.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Ownership Transfer toggle */}
                  <div className="flex items-center justify-between py-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ownership Transfer</label>
                    <button
                      ref={setRef(16)}
                      type="button"
                      onKeyDown={kd(16)}
                      onClick={() => set("ownershipTransfer", !form.ownershipTransfer)}
                      className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                        ${form.ownershipTransfer ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <motion.span
                        animate={{ x: form.ownershipTransfer ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="pointer-events-none absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ── Section 4: Account Credentials ── */}
              <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Account Credentials</SectionLabel>
                <div className="flex flex-col gap-3">

                  <Field label="Channel Email" required error={errors.channelEmail}>
                    <input ref={setRef(17)} type="email" value={form.channelEmail}
                      onChange={e => set("channelEmail", e.target.value)} onKeyDown={kd(17)}
                      placeholder="channel@gmail.com" className={inputCls} />
                  </Field>

                  <Field label="Channel Password" required error={errors.channelPassword}>
                    <div className="relative">
                      <input
                        ref={setRef(18)}
                        type={showPass ? "text" : "password"}
                        value={form.channelPassword}
                        onChange={e => set("channelPassword", e.target.value)}
                        onKeyDown={kd(18)}
                        placeholder="••••••••"
                        className={inputCls + " pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 transition"
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Primary Mail" error={errors.primaryMail}>
                    <input ref={setRef(19)} type="email" value={form.primaryMail}
                      onChange={e => set("primaryMail", e.target.value)} onKeyDown={kd(19)}
                      placeholder="owner@gmail.com" className={inputCls} />
                  </Field>
                </div>
              </motion.div>

              {/* ── Section 5: Pricing ── */}
              <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Pricing</SectionLabel>
                <div className="flex flex-col gap-3">

                  <Field label="Purchase Price (Rs)" required error={errors.purchasePrice}>
                    <input ref={setRef(20)} type="number" value={form.purchasePrice}
                      onChange={e => set("purchasePrice", e.target.value)} onKeyDown={kd(20)}
                      placeholder="e.g. 280000" className={inputCls} />
                  </Field>

                  <Field label="Sale Price (Rs)" error={errors.salePrice}>
                    <input ref={setRef(21)} type="number" value={form.salePrice}
                      onChange={e => set("salePrice", e.target.value)} onKeyDown={kd(21)}
                      placeholder="e.g. 380000" className={inputCls} />
                  </Field>

                  <Field label="Status" required error={errors.status}>
                    <select ref={setRef(22)} value={form.status}
                      onChange={e => set("status", e.target.value)}
                      onKeyDown={kd(22, true /* last → submit */)}
                      className={selectCls}>
                      <option value="">Select status</option>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </motion.div>

              <div className="h-4" />
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-white dark:bg-gray-900">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                id="drawer-submit-btn"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition active:scale-95"
              >
                Add Channel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
