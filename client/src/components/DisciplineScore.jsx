import { scoreToColor } from '../utils/scoreColors.js';

export default function DisciplineScore({ score, size = 'md', showLabel = true }) {
  const color = scoreToColor(score);
  const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' };
  const radius = size === 'lg' ? 42 : size === 'md' ? 34 : 26;
  const stroke = size === 'lg' ? 4 : 3;
  const dim = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#2a2a32" strokeWidth={stroke} />
          <circle
            cx={dim / 2} cy={dim / 2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${sizes[size]} font-mono font-medium`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && <span className="text-text-muted text-xs">discipline score</span>}
    </div>
  );
}
