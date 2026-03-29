import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, Eye, EyeOff } from "lucide-react";

// ─── constants ──────────────────────────────────────────────────────────────
const CATEGORIES   = ["Gaming","Tech","Food","Sports","Lifestyle","Religion","Education","Entertainment","Finance","Other"];
const STATUSES     = ["available","sold","hacked","pending"];
const VIOLATIONS   = ["None","Strike","Community Guidelines","Copyright"];

const EMPTY = {
  channelName: "", channelUrl: "", brandName: "", category: "", niche: "",
  contentType: "", subscribers: "", totalVideos: "", views: "", realtimeViews: "",
  watchTime: "", channelAge: "", monetizationStatus: "", earningPerMonth: "",
  verificationStatus: "", violation: "None", ownershipTransfer: false,
  channelEmail: "", channelPassword: "", primaryMail: "",
  purchasePrice: "", salePrice: "", status: "",
};

const REQUIRED = ["channelName","category","monetizationStatus","channelEmail","channelPassword","purchasePrice","status"];

// ─── field components ────────────────────────────────────────────────────────
const inputCls = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-300 dark:placeholder-gray-600 transition";
const selectCls = inputCls + " cursor-pointer";

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-6 first:mt-0">
      {children}
    </p>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── main drawer ─────────────────────────────────────────────────────────────
export default function AddChannelDrawer({ open, onClose, onSuccess }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
  };

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const validate = () => {
    const newErr = {};
    REQUIRED.forEach(k => {
      if (!form[k] || form[k] === "") newErr[k] = "This field is required";
    });
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
            transition={{ duration: 0.22 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
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

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-2 pb-4">

              {/* ── Section 1: Channel Info ── */}
              <SectionLabel>Channel Info</SectionLabel>
              <div className="flex flex-col gap-3">

                <Field label="Channel Name" required error={errors.channelName}>
                  <input value={form.channelName} onChange={e => set("channelName", e.target.value)}
                    placeholder="e.g. TechVault PK" className={inputCls} />
                </Field>

                <Field label="Channel URL" error={errors.channelUrl}>
                  <div className="relative">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                    <input value={form.channelUrl} onChange={e => set("channelUrl", e.target.value)}
                      placeholder="youtube.com/channel..." className={inputCls + " pl-8"} />
                  </div>
                </Field>

                <Field label="Brand Name" error={errors.brandName}>
                  <input value={form.brandName} onChange={e => set("brandName", e.target.value)}
                    placeholder="e.g. TechVault" className={inputCls} />
                </Field>

                <Field label="Category" required error={errors.category}>
                  <select value={form.category} onChange={e => set("category", e.target.value)} className={selectCls}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Niche" error={errors.niche}>
                  <input value={form.niche} onChange={e => set("niche", e.target.value)}
                    placeholder="e.g. Gadgets & Reviews" className={inputCls} />
                </Field>

                <Field label="Content Type" error={errors.contentType}>
                  <select value={form.contentType} onChange={e => set("contentType", e.target.value)} className={selectCls}>
                    <option value="">Select type</option>
                    <option>Long-form</option>
                    <option>Short-form</option>
                    <option>Mixed</option>
                  </select>
                </Field>
              </div>

              {/* ── Section 2: Channel Stats ── */}
              <SectionLabel>Channel Stats</SectionLabel>
              <div className="grid grid-cols-2 gap-3">

                <Field label="Subscribers" error={errors.subscribers}>
                  <input value={form.subscribers} onChange={e => set("subscribers", e.target.value)}
                    placeholder="e.g. 125K" className={inputCls} />
                </Field>

                <Field label="Total Videos" error={errors.totalVideos}>
                  <input value={form.totalVideos} onChange={e => set("totalVideos", e.target.value)}
                    placeholder="e.g. 312" className={inputCls} />
                </Field>

                <Field label="Total Views" error={errors.views}>
                  <input value={form.views} onChange={e => set("views", e.target.value)}
                    placeholder="e.g. 4.2M" className={inputCls} />
                </Field>

                <Field label="Realtime Views" error={errors.realtimeViews}>
                  <input value={form.realtimeViews} onChange={e => set("realtimeViews", e.target.value)}
                    placeholder="e.g. 1.5K/day" className={inputCls} />
                </Field>

                <Field label="Watch Time (hrs)" error={errors.watchTime}>
                  <input type="number" value={form.watchTime} onChange={e => set("watchTime", e.target.value)}
                    placeholder="e.g. 80000" className={inputCls} />
                </Field>

                <Field label="Channel Age" error={errors.channelAge}>
                  <input value={form.channelAge} onChange={e => set("channelAge", e.target.value)}
                    placeholder="e.g. 2 years" className={inputCls} />
                </Field>
              </div>

              {/* ── Section 3: Monetization & Status ── */}
              <SectionLabel>Monetization & Status</SectionLabel>
              <div className="flex flex-col gap-3">

                <Field label="Monetization Status" required error={errors.monetizationStatus}>
                  <select value={form.monetizationStatus} onChange={e => set("monetizationStatus", e.target.value)} className={selectCls}>
                    <option value="">Select status</option>
                    <option>Monetized</option>
                    <option>Not Monetized</option>
                    <option>Pending</option>
                  </select>
                </Field>

                <Field label="Earning per Month (Rs)" error={errors.earningPerMonth}>
                  <input type="number" value={form.earningPerMonth} onChange={e => set("earningPerMonth", e.target.value)}
                    placeholder="e.g. 15000" className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Verification" error={errors.verificationStatus}>
                    <select value={form.verificationStatus} onChange={e => set("verificationStatus", e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>Verified</option>
                      <option>Not Verified</option>
                    </select>
                  </Field>

                  <Field label="Violation" error={errors.violation}>
                    <select value={form.violation} onChange={e => set("violation", e.target.value)} className={selectCls}>
                      {VIOLATIONS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Ownership Transfer toggle */}
                <div className="flex items-center justify-between py-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ownership Transfer</label>
                  <button
                    type="button"
                    onClick={() => set("ownershipTransfer", !form.ownershipTransfer)}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
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

              {/* ── Section 4: Account Credentials ── */}
              <SectionLabel>Account Credentials</SectionLabel>
              <div className="flex flex-col gap-3">

                <Field label="Channel Email" required error={errors.channelEmail}>
                  <input type="email" value={form.channelEmail} onChange={e => set("channelEmail", e.target.value)}
                    placeholder="channel@gmail.com" className={inputCls} />
                </Field>

                <Field label="Channel Password" required error={errors.channelPassword}>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.channelPassword}
                      onChange={e => set("channelPassword", e.target.value)}
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
                  <input type="email" value={form.primaryMail} onChange={e => set("primaryMail", e.target.value)}
                    placeholder="owner@gmail.com" className={inputCls} />
                </Field>
              </div>

              {/* ── Section 5: Pricing ── */}
              <SectionLabel>Pricing</SectionLabel>
              <div className="flex flex-col gap-3">

                <Field label="Purchase Price (Rs)" required error={errors.purchasePrice}>
                  <input type="number" value={form.purchasePrice} onChange={e => set("purchasePrice", e.target.value)}
                    placeholder="e.g. 280000" className={inputCls} />
                </Field>

                <Field label="Sale Price (Rs)" error={errors.salePrice}>
                  <input type="number" value={form.salePrice} onChange={e => set("salePrice", e.target.value)}
                    placeholder="e.g. 380000" className={inputCls} />
                </Field>

                <Field label="Status" required error={errors.status}>
                  <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                    <option value="">Select status</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* bottom padding */}
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
