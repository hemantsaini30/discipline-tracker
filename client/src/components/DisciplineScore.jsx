import { scoreToColor } from '../utils/scoreColors.js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DisciplineScore({ score, size = 'md', showLabel = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = scoreToColor(score);
  const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' };
  const radius = size === 'lg' ? 42 : size === 'md' ? 34 : 26;
  const stroke = size === 'lg' ? 4 : 3;
  const dim = (radius + stroke) * 2 + 20; 
  const circumference = 2 * Math.PI * radius;
  
  const circleVariants = {
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset: circumference - (score / 100) * circumference,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  useEffect(() => {
    let start = 0;
    const end = Math.round(score);
    if (start === end) {
      setDisplayScore(end);
      return;
    }
    const stepTime = Math.abs(Math.floor(1500 / (end || 1)));
    let timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  // Determine glow based on exact hex values returned from scoreToColor
  let filterColor = "drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))"; // green default
  if (color === '#ef4444') filterColor = "drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))"; // red
  if (color === '#eab308') filterColor = "drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))"; // yellow
  if (color === '#f97316') filterColor = "drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))"; // orange

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <motion.circle
            cx={dim / 2} cy={dim / 2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ filter: filterColor }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${sizes[size]} font-mono font-medium drop-shadow-md`} style={{ color }}>
            {displayScore}
          </span>
        </div>
      </div>
      {showLabel && <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">discipline score</span>}
    </div>
  );
}
