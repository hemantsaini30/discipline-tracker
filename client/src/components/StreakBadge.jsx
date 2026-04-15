import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakBadge({ streak, label, isBest }) {
  const isHot = streak >= 7;
  
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.05 }}
      className={`card flex items-center gap-4 px-5 py-4 border ${isHot ? 'bg-gradient-to-br from-accent-yellow/10 to-accent-red/10 border-accent-yellow/30 shadow-glow-pink' : 'border-white/10'}`}
    >
      <div className={`p-2.5 rounded-xl ${isHot ? 'bg-gradient-to-br from-accent-yellow to-accent-red text-white shadow-lg' : 'bg-white/10 text-text-muted'}`}>
        <Flame size={24} className={isHot ? 'animate-pulse-slow' : ''} />
      </div>
      <div>
        <div className="text-3xl font-bold font-mono tracking-tight text-white leading-none drop-shadow-md">
          {streak} 
          <span className="text-sm font-sans font-medium text-text-secondary ml-1 tracking-normal">days</span>
        </div>
        <div className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mt-1.5">{label}</div>
      </div>
    </motion.div>
  );
}
