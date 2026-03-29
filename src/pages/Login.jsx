import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, CheckCircle2 } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Hardcoded credentials
  const VALID_EMAIL = "admin@gmail.com";
  const VALID_PASSWORD = "1111";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    // Simulate loading
    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        setSuccess(true);
        setTimeout(() => {
          onLogin();
        }, 500);
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      if (field === "email") {
        passwordRef.current?.focus();
      } else {
        handleLogin(e);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Left Panel - Hero Branding */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background Texture/Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Abbas<span className="text-emerald-500">Stock</span>
            </h1>
          </div>

          <div className="max-w-md">
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Pakistan's #1 YouTube Channel <span className="text-emerald-500">Marketplace.</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              The professional dashboard to manage your channel inventory, monitor sales, and track profits with precision.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium backdrop-blur-md">📊 Track Sales</span>
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium backdrop-blur-md">📈 Manage Channels</span>
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium backdrop-blur-md">💰 Monitor Profits</span>
            </div>
          </div>
        </div>

        {/* Floating Stat Cards */}
        <div className="relative h-48 w-full z-10">
          <div className="absolute top-0 left-0 w-48 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-lg animate-float" style={{ animationDelay: '0s' }}>
            <p className="text-xs text-gray-400 font-medium">LISTED CHANNELS</p>
            <p className="text-xl font-bold text-white mt-1">48 Channels</p>
          </div>
          <div className="absolute top-12 left-56 w-48 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-lg animate-float" style={{ animationDelay: '1.5s' }}>
            <p className="text-xs text-gray-400 font-medium">TOTAL SALES</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">Rs 2.4M</p>
          </div>
          <div className="absolute top-24 left-10 w-48 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-lg animate-float" style={{ animationDelay: '3s' }}>
            <p className="text-xs text-gray-400 font-medium">CHANNELS SOLD</p>
            <p className="text-xl font-bold text-white mt-1">31 Channels</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-gray-500">© 2024 AbbasStock. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-950"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-full max-w-[400px] bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-800 ${error ? 'animate-shake' : ''}`}
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
              <Store className="text-emerald-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your AbbasStock account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "email")}
                  placeholder="admin@gmail.com"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "password")}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-12 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Invalid email or password. Please try again.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-2
                ${success 
                  ? "bg-emerald-500 text-white" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }
                ${loading ? "opacity-90 cursor-wait" : ""}
                ${success ? "scale-[1.02]" : "active:scale-95"}
              `}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>Logged In!</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>

      {/* Shake Keyframes style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
