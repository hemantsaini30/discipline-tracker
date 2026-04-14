export default function StreakBadge({ streak, label = 'streak' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-1.5">
        <span className="text-amber-400 text-xs font-mono font-medium">{streak}</span>
        <span className="text-amber-500/70 text-xs">day {label}</span>
      </div>
    </div>
  );
}
