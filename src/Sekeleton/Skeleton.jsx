// src/components/ui/Skeleton.jsx
import { motion } from "framer-motion";

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
    <motion.div
      className="absolute inset-0"
      initial={{ translateX: "-100%" }}
      animate={{ translateX: "100%" }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }}
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
      }}
    />
  </div>
);

export default Skeleton;