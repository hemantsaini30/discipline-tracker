const BADGE_DEFS = [
  { id: 'streak_10', label: '10-day streak', desc: 'Maintained discipline for 10 consecutive days', threshold: (s) => s.currentStreak >= 10 },
  { id: 'streak_30', label: '30-day streak', desc: '30 consecutive streak days', threshold: (s) => s.currentStreak >= 30 },
  { id: 'streak_50', label: '50 days active', desc: 'Reached 50-day streak', threshold: (s) => s.currentStreak >= 50 },
  { id: 'streak_100', label: '100-day discipline', desc: '100 day streak milestone', threshold: (s) => s.currentStreak >= 100 },
  { id: 'total_100', label: '100 tasks done', desc: 'Completed 100 total logs', threshold: (s) => s.completedLogs >= 100 },
  { id: 'best_80', label: 'Consistent week', desc: 'Weekly avg score above 80%', threshold: (s) => s.avgScore >= 80 },
];

export default function BadgeWall({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {BADGE_DEFS.map(badge => {
        const earned = badge.threshold(stats);
        return (
          <div
            key={badge.id}
            className={`card p-3 transition-all ${earned ? 'border-amber-500/20' : 'opacity-30'}`}
          >
            <div className={`text-xs font-medium mb-0.5 ${earned ? 'text-amber-400' : 'text-text-muted'}`}>
              {badge.label}
            </div>
            <div className="text-text-muted text-xs">{badge.desc}</div>
            {earned && <div className="mt-2 text-amber-500/50 text-xs">earned</div>}
          </div>
        );
      })}
    </div>
  );
}
