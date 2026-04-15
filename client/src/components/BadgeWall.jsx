import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Flame } from 'lucide-react';

export default function BadgeWall() {
  const { user } = useAuth();
  if (!user?.badges?.length) return null;

  const iconMap = {
    'First Step': <Target size={16} />,
    '3-Day Streak': <Zap size={16} />,
    '7-Day Streak': <Flame size={16} />,
    '14-Day Streak': <Star size={16} />,
    '30-Day Streak': <Trophy size={16} />
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" } }
  };

  return (
    <div className="card p-5 border-t-2 border-t-accent-yellow/50 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

      <h3 className="text-text-primary font-bold tracking-wide uppercase text-xs mb-4 flex items-center gap-2 relative z-10">
        <Trophy size={16} className="text-accent-yellow drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> Badges Earned
      </h3>
      
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2 relative z-10">
        {user.badges.map((badge, i) => (
          <motion.div variants={item}
            key={i} 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-yellow/10 to-accent-yellow/5 border border-accent-yellow/20 text-accent-yellow text-xs font-semibold shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)] backdrop-blur-sm"
          >
            {iconMap[badge] || <Star size={14} />} {badge}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
