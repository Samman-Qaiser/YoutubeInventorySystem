import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, CheckCircle2, TrendingUp, Users, DollarSign } from "lucide-react";

const VALID_EMAIL = "admin@gmail.com";
const VALID_PASSWORD = "1111";

const stats = [
  { icon: TrendingUp, label: "Listed Channels", value: "48", color: "#10b981" },
  { icon: DollarSign, label: "Total Sales", value: "Rs 2.4M", color: "#f59e0b" },
  { icon: Users, label: "Channels Sold", value: "31", color: "#3b82f6" },
];

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-emerald-500/10"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animation: `drift ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + "s",
          }}
        />
      ))}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        setSuccess(true);
        setTimeout(() => onLogin?.(), 1200);
      } else {
        setError(true);
        setLoading(false);
      }
    }, 900);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      field === "email" ? passwordRef.current?.focus() : handleLogin(e);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }} className="min-h-screen flex bg-[#0a0f1a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

        @keyframes drift {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          66% { transform: translateY(10px) translateX(-8px); opacity: 0.5; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--r, 0deg)); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .stat-card { animation: float-card 4s ease-in-out infinite; }
        .stat-card:nth-child(2) { animation-delay: 1.3s; }
        .stat-card:nth-child(3) { animation-delay: 2.6s; }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .shimmer-text {
          background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #10b981);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .glow-btn:hover::before { left: 100%; }
        .input-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s;
        }
        .input-field:focus {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08);
          outline: none;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Left Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-14 relative overflow-hidden grid-bg"
      >
        <ParticleField />

        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-40" style={{ animation: 'pulse-ring 3s ease-in-out infinite' }} />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="text-white" size={22} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Youtube<span className="shimmer-text">Stock</span>
              </span>
              <p className="text-xs text-emerald-500/70 font-medium tracking-widest uppercase mt-0.5">Channel Marketplace</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">Pakistan's #1 Platform</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Buy & Sell YouTube Channels{" "}
              <span className="shimmer-text">Smarter.</span>
            </h2>
            <p className="text-base text-white/40 leading-relaxed font-light">
              Professional dashboard to manage your channel inventory, monitor sales, and track profits — all in one place.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="relative z-10 flex flex-col gap-4"
        >
          {stats.map(({ icon: Icon, label, value, color }, i) => (
            <div
              key={label}
              className="stat-card flex items-center gap-4 p-4 rounded-2xl border"
              style={{
                background: `rgba(255,255,255,0.03)`,
                borderColor: `rgba(255,255,255,0.07)`,
                backdropFilter: 'blur(12px)',
                '--r': `${(i - 1) * 0.5}deg`,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium tracking-widest uppercase">{label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{value}</p>
              </div>
              <div className="ml-auto w-16 h-6 opacity-30">
                <svg viewBox="0 0 64 24" fill="none">
                  <polyline
                    points={`0,${24 - Math.random() * 10} 16,${24 - Math.random() * 18} 32,${24 - Math.random() * 14} 48,${24 - Math.random() * 20} 64,${24 - Math.random() * 16}`}
                    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-white/20">© YoutubeStock. All rights reserved.</p>
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative"
        style={{ background: 'linear-gradient(135deg, #0d1424 0%, #0a0f1a 100%)' }}
      >
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full bg-emerald-500/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full bg-emerald-500/4 pointer-events-none" />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-[400px] ${error ? 'shake' : ''}`}
        >
          {/* Card */}
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="mb-10">
              <div className="flex lg:hidden items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Store className="text-white" size={16} />
                </div>
                <span className="text-lg font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Youtube<span className="shimmer-text">Stock</span>
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Welcome back
              </h3>
              <p className="text-sm text-white/40 font-light">Sign in to access your dashboard</p>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">
                  Email address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                    style={{ color: focused === 'email' ? '#10b981' : 'rgba(255,255,255,0.3)' }}
                    size={16}
                  />
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(false); }}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => handleKeyDown(e, "email")}
                    placeholder="admin@gmail.com"
                    className="input-field w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                    style={{ color: focused === 'password' ? '#10b981' : 'rgba(255,255,255,0.3)' }}
                    size={16}
                  />
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => handleKeyDown(e, "password")}
                    placeholder="••••••••"
                    className="input-field w-full rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/30 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <AlertCircle className="text-red-400 shrink-0" size={15} />
                    <p className="text-xs font-medium text-red-400">Invalid email or password. Please try again.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                onClick={handleLogin}
                disabled={loading || success}
                whileTap={{ scale: 0.97 }}
                className="glow-btn w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2.5 mt-2 transition-all duration-300"
                style={{
                  background: success
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: success
                    ? '0 8px 32px rgba(16,185,129,0.4)'
                    : '0 8px 24px rgba(16,185,129,0.25)',
                  opacity: loading ? 0.85 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    />
                  ) : success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      <span>Logged in!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Divider hint */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-center text-xs text-white/20 font-light">
                Secured by AbbasStock · Pakistan's #1 Channel Marketplace
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}