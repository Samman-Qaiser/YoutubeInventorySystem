// src/components/AddChannelDrawer.jsx

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, Eye, EyeOff, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateChannel } from "../hooks/useChannels";
import { fetchYoutubeChannelData } from "../services/channel.services";

// ─── constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Gaming","Tech","Food","Sports","Lifestyle","Religion","Education","Entertainment","Finance","Other"];
const VIOLATIONS = ["None","Strike","Community Guidelines","Copyright"];

const EMPTY = {
  channelName:"", channelUrl:"", brandName:"", channelNiche:"",
  contentType:"", channelSubscribers:"", totalVideos:"", views:"",
  realtimeViews:"", watchTime:"", channelAge:"", monetizationStatus:"",
  earningData:"", verificationStatus:"", violation:"None", ownerShip:false,
  channelEmail:"", channelPassword:"", primaryEmail:"",
  purchasePrice:"", salePrice:"",sellerName:"",contactNumber:"", channelProfile:"", screenshotUrls:[],bannerUrl:""
};

const REQUIRED = [
"channelUrl","channelName",
 "purchasePrice","sellerName","salePrice",
];

const TOTAL_FIELDS = 26;

// ─── styles ──────────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 " +
  "text-sm text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2.5 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 " +
  "placeholder-gray-300 dark:placeholder-gray-600 transition-all duration-150 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";
const selectCls = inputCls + " cursor-pointer";

const sectionVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

// ─── sub-components ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="mt-6 first:mt-0 mb-3">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {children}
      </p>
      <div className="mt-2 h-px bg-gradient-to-r from-gray-100 dark:from-gray-800 via-gray-200 dark:via-gray-700 to-transparent" />
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />
        )}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AddChannelDrawer({ open, onClose }) {
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [urlLoading, setUrlLoading] = useState(false); // youtube fetch loader

const { mutate: createChannel, isPending, isSuccess, isError, error } = useCreateChannel();

  const fieldRefs = useRef(Array.from({ length: TOTAL_FIELDS }, () => null));
  const setRef    = (i) => (el) => { fieldRefs.current[i] = el; };

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Enter key navigation ─────────────────────────────────────────────────
  const focusNext = useCallback((i) => {
    const next = fieldRefs.current[i + 1];
    if (!next) return;
    next.focus();
    const tag  = next.tagName?.toLowerCase();
    const type = next.type?.toLowerCase();
    const textTypes = ["text","email","password","search","url","tel"];
    if (tag === "input" && textTypes.includes(type)) {
      const len = (next.value || "").length;
      try { next.setSelectionRange(len, len); } catch {}
    }
  }, []);

  const handleKeyDown = useCallback((e, index, isLast = false) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (isLast) {
      document.getElementById("drawer-submit-btn")?.click();
      return;
    }
    if (index === 16) {
      set("ownerShip", !form.ownerShip);
      focusNext(index);
      return;
    }
    focusNext(index);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNext, form.ownerShip]);

  const kd = (i, isLast = false) => (e) => handleKeyDown(e, i, isLast);

  // ── YouTube auto-fill ────────────────────────────────────────────────────
  const handleUrlBlur = async () => {
    const url = form.channelUrl.trim();
    if (!url) return;

    // basic youtube url check
    if (!url.includes("youtube.com")) return;

    setUrlLoading(true);
    try {
      const data = await fetchYoutubeChannelData(url);
      setForm((f) => ({
        ...f,
        channelName:         data.channelName     || f.channelName,
        channelProfile:      data.channelProfile  || f.channelProfile,
        bannerUrl:          data.bannerUrl          || f.bannerUrl,  
        channelAge:          data.channelAge      || f.channelAge,
        channelSubscribers:  data.subscribers     || f.channelSubscribers,
        totalVideos:         data.totalVideos     || f.totalVideos,
        views:               data.views           || f.views,
      }));
      toast.success("Channel details fetched!");
    } catch (err) {
      toast.error(err.message || "Could not fetch channel details");
    } finally {
      setUrlLoading(false);
    }
  };

  // ── escape key & body scroll lock ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCancel(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const newErr = {};
    REQUIRED.forEach((k) => {
      if (!form[k] || form[k] === "") newErr[k] = "Required";
    });
    if (form.purchasePrice && isNaN(Number(form.purchasePrice))) {
      newErr.purchasePrice = "Must be a number";
    }
    if (form.salePrice && isNaN(Number(form.salePrice))) {
      newErr.salePrice = "Must be a number";
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }

    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      salePrice:     Number(form.salePrice)     || 0,
      earningData:   Number(form.earningData)   || 0,
      watchTime:     Number(form.watchTime)     || 0,
    };

    // createChannel(payload, {
    //   onSuccess: () => {
    //     toast.success("Channel added successfully!");
    //     handleCancel();
    //   },
    //   onError: (err) => {
    //     toast.error(err.message || "Failed to add channel");
    //   },
    // });
    createChannel(payload);
  };

  // ── cancel / reset ───────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    onClose();
    setTimeout(() => {
      setForm(EMPTY);
      setErrors({});
      setShowPass(false);
    }, 350);
  }, [onClose]);
useEffect(() => {
  if (isSuccess) {
    toast.success("Channel added successfully!");
    handleCancel();
  }
}, [isSuccess]);

useEffect(() => {
  if (isError) {
    toast.error(error?.message || "Failed to add channel");
  }
}, [isError]);
  const isDisabled = urlLoading || isPending;

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
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">
                    Add New Channel
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Paste URL to auto-fill details
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="h-px bg-gradient-to-r from-emerald-400 via-emerald-200 dark:via-emerald-700 to-transparent" />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-3 pb-6">

              {/* ── Section 1: Channel Info ── */}
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Channel Info</SectionLabel>
                <div className="flex flex-col gap-3">

                  {/* URL — triggers auto-fill on blur */}
                  
                  <Field label="Channel URL" required error={errors.channelUrl}>
                    <div className="relative">
                      <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" />
                    
                      <input
                     
                        ref={setRef(0)}
                        value={form.channelUrl}
                        onChange={(e) => set("channelUrl", e.target.value)}
                        onBlur={handleUrlBlur}
                        onKeyDown={kd(0)}
                        placeholder="youtube.com/@channel..."
                        className={inputCls + " pl-8 pr-8"}
                        disabled={isDisabled}
                      />
                  
                      {urlLoading && (
                        <Loader2
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
                        />
                      )}
                    </div>
                    {urlLoading && (
                      <p className="text-[11px] text-emerald-500 mt-1">
                        Fetching channel details...
                      </p>
                    )}
                  </Field>

                  {/* Channel profile preview */}
                  {form.channelProfile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    >
                      <img
                        src={form.channelProfile}
                        alt="channel"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {form.channelName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {Number(form.channelSubscribers).toLocaleString()} subscribers
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <Field label="Channel Name" required error={errors.channelName}>
                    <input
                      ref={setRef(1)}
                      value={form.channelName}
                      onChange={(e) => set("channelName", e.target.value)}
                      onKeyDown={kd(1)}
                      placeholder="e.g. TechVault PK"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Brand Name" error={errors.brandName}>
                    <input
                      ref={setRef(2)}
                      value={form.brandName}
                      onChange={(e) => set("brandName", e.target.value)}
                      onKeyDown={kd(2)}
                      placeholder="e.g. TechVault"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Channel Niche" error={errors.channelNiche}>
                    <input
                      ref={setRef(3)}
                      value={form.channelNiche}
                      onChange={(e) => set("channelNiche", e.target.value)}
                      onKeyDown={kd(3)}
                      placeholder="e.g. Gadgets & Reviews"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>
                     <Field label="Category" error={errors.category}>
                    <select
                      ref={setRef(4)}
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      onKeyDown={kd(4)}
                      className={selectCls}
                      disabled={isDisabled}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Content Type" error={errors.contentType}>
                    <select
                      ref={setRef(5)}
                      value={form.contentType}
                      onChange={(e) => set("contentType", e.target.value)}
                      onKeyDown={kd(5)}
                      className={selectCls}
                      disabled={isDisabled}
                    >
                      <option value="">Select type</option>
                      <option>Long</option>
                      <option>Short</option>
                      <option>Mixed</option>
                    </select>
                  </Field>
                </div>
              </motion.div>

              {/* ── Section 2: Channel Stats ── */}
              <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Channel Stats</SectionLabel>
                <div className="grid grid-cols-2 gap-3">

                  <Field label="Subscribers" error={errors.channelSubscribers}>
                    <input
                      ref={setRef(6)}
                      value={form.channelSubscribers}
                      onChange={(e) => set("channelSubscribers", e.target.value)}
                      onKeyDown={kd(6)}
                      placeholder="e.g. 125000"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Total Videos" error={errors.totalVideos}>
                    <input
                      ref={setRef(7)}
                      value={form.totalVideos}
                      onChange={(e) => set("totalVideos", e.target.value)}
                      onKeyDown={kd(7)}
                      placeholder="e.g. 312"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Total Views" error={errors.views}>
                    <input
                      ref={setRef(8)}
                      value={form.views}
                      onChange={(e) => set("views", e.target.value)}
                      onKeyDown={kd(8)}
                      placeholder="e.g. 4200000"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Realtime Views" error={errors.realtimeViews}>
                    <input
                      ref={setRef(9)}
                      value={form.realtimeViews}
                      onChange={(e) => set("realtimeViews", e.target.value)}
                      onKeyDown={kd(9)}
                      placeholder="e.g. 1500"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Watch Time (hrs)" error={errors.watchTime}>
                    <input
                      ref={setRef(10)}
                      type="number"
                      value={form.watchTime}
                      onChange={(e) => set("watchTime", e.target.value)}
                      onKeyDown={kd(10)}
                      placeholder="e.g. 80000"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <Field label="Channel Age" error={errors.channelAge}>
                    <input
                      ref={setRef(11)}
                      value={form.channelAge}
                      onChange={(e) => set("channelAge", e.target.value)}
                      onKeyDown={kd(11)}
                      placeholder="e.g. 2025-01-01"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>
                </div>
              </motion.div>

              {/* ── Section 3: Monetization ── */}
              <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionLabel>Monetization & Status</SectionLabel>
                <div className="flex flex-col gap-3">

                  <Field label="Monetization Status"  error={errors.monetizationStatus}>
                    <select
                      ref={setRef(12)}
                      value={form.monetizationStatus}
                      onChange={(e) => set("monetizationStatus", e.target.value)}
                      onKeyDown={kd(12)}
                      className={selectCls}
                      disabled={isDisabled}
                    >
                      <option value="">Select status</option>
                      <option>Monetized</option>
                      <option>Not Monetized</option>
                      <option>Pending</option>
                    </select>
                  </Field>

                  <Field label="Earning per Month (Rs)" error={errors.earningData}>
                    <input
                      ref={setRef(13)}
                      type="text"
                      value={form.earningData}
                      onChange={(e) => set("earningData", e.target.value)}
                      onKeyDown={kd(13)}
                      placeholder="e.g. 15000"
                      className={inputCls}
                      disabled={isDisabled}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Verification" error={errors.verificationStatus}>
                      <select
                        ref={setRef(14)}
                        value={form.verificationStatus}
                        onChange={(e) => set("verificationStatus", e.target.value)}
                        onKeyDown={kd(14)}
                        className={selectCls}
                        disabled={isDisabled}
                      >
                        <option value="">Select</option>
                        <option>Verified</option>
                        <option>Not Verified</option>
                      </select>
                    </Field>

                    <Field label="Violation" error={errors.violation}>
                      <select
                        ref={setRef(15)}
                        value={form.violation}
                        onChange={(e) => set("violation", e.target.value)}
                        onKeyDown={kd(15)}
                        className={selectCls}
                        disabled={isDisabled}
                      >
                        {VIOLATIONS.map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Ownership toggle */}
                  <div className="flex items-center justify-between py-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Ownership Transfer
                    </label>
                    <button
                      ref={setRef(16)}
                      type="button"
                      onKeyDown={kd(16)}
                      onClick={() => set("ownerShip", !form.ownerShip)}
                      disabled={isDisabled}
                      className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${form.ownerShip ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <motion.span
                        animate={{ x: form.ownerShip ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="pointer-events-none absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ── Section 4: Credentials ── */}
          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
  <SectionLabel>Account Credentials</SectionLabel>
  <div className="flex flex-col gap-3">

    <Field label="Channel Email"  error={errors.channelEmail}>
      <input
        ref={setRef(17)}
        type="email"
        value={form.channelEmail}
        onChange={(e) => set("channelEmail", e.target.value)}
        onKeyDown={kd(17)}
        placeholder="channel@gmail.com"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>

    <Field label="Channel Password"  error={errors.channelPassword}>
      <div className="relative">
        <input
          ref={setRef(18)}
          type={showPass ? "text" : "password"}
          value={form.channelPassword}
          onChange={(e) => set("channelPassword", e.target.value)}
          onKeyDown={kd(18)}
          placeholder="••••••••"
          className={inputCls + " pr-10"}
          disabled={isDisabled}
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

    {/* ✅ Primary Email — userId ki jagah */}
    <Field label="Primary Email" error={errors.primaryEmail}>
      <input
        ref={setRef(19)}
        type="email"
        value={form.primaryEmail}
        onChange={(e) => set("primaryEmail", e.target.value)}
        onKeyDown={kd(19)}
        placeholder="primary@gmail.com"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>
  </div>
</motion.div>

              {/* ── Section 5: Pricing ── */}
           <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
  <SectionLabel>Pricing & Seller Info</SectionLabel>
  <div className="flex flex-col gap-3">

    <Field label="Purchase Price ($)" required error={errors.purchasePrice}>
      <input
        ref={setRef(22)}
        type="text"
        value={form.purchasePrice}
        onChange={(e) => set("purchasePrice", e.target.value)}
        onKeyDown={kd(22)}
        placeholder="e.g. 150"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>

    <Field label="Expected Sale Price ($)" required error={errors.salePrice}>
      <input
        ref={setRef(23)}
        type="text"
        value={form.salePrice}
        onChange={(e) => set("salePrice", e.target.value)}
        onKeyDown={kd(23)}
        placeholder="e.g. 220"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>

    {/* ✅ Seller Name */}
    <Field label="Seller Name" required error={errors.sellerName}>
      <input
        ref={setRef(20)}
        value={form.sellerName}
        onChange={(e) => set("sellerName", e.target.value)}
        onKeyDown={kd(20)}
        placeholder="e.g. Ali Hassan"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>

    {/* ✅ Contact Number */}
    <Field label="Contact Number" error={errors.contactNumber}>
      <input
        ref={setRef(21)}
        value={form.contactNumber}
        onChange={(e) => set("contactNumber", e.target.value)}
        onKeyDown={kd(21)}
        placeholder="e.g. 03001234567"
        className={inputCls}
        disabled={isDisabled}
      />
    </Field>

  </div>
</motion.div>

              <div className="h-4" />
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-white dark:bg-gray-900">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                id="drawer-submit-btn"
                onClick={handleSubmit}
                disabled={isDisabled}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Channel"
                )}
              </button>
     
            </div>
          </motion.div>
                   {error && <p className="text-red-500">{error.message}</p>}
        </>
      )}
    </AnimatePresence>
  );
}