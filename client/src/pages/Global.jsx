import { useState, useEffect } from 'react';
import { getGlobalAnalytics } from '../api/analytics.js';
import DisciplineScore from '../components/DisciplineScore.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import TrendChart from '../components/TrendChart.jsx';
import BadgeWall from '../components/BadgeWall.jsx';

export default function Global() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getGlobalAnalytics().then(r => setData(r.data));
  }, []);

  if (!data) return <div className="p-6 text-text-muted text-sm">Loading...</div>;

  const todayScore = data.scores[data.scores.length - 1]?.score ?? 0;

  const stats = [
    { label: 'Total logs', value: data.totalLogs },
    { label: 'Completed', value: data.completedLogs, color: 'text-green-400' },
    { label: 'Best streak', value: `${data.bestStreak}d` },
    { label: 'Monthly avg', value: `${data.avgScore}%` },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-text-primary font-medium text-lg mb-6">Global Performance</h1>

      {/* Top score row */}
      <div className="card p-6 mb-4 flex items-center gap-6">
        <DisciplineScore score={todayScore} size="lg" />
        <div className="flex-1">
          <div className="text-text-secondary text-sm mb-1">Today's score</div>
          <StreakBadge streak={data.currentStreak} />
          <div className="text-text-muted text-xs mt-2">{data.currentStreak}-day active streak</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`font-mono text-xl font-medium ${s.color || 'text-text-primary'}`}>{s.value}</div>
            <div className="text-text-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card p-5 mb-4">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-4">30-day trend</h2>
        <TrendChart data={data.scores} height={140} />
      </div>

      {/* Badge wall */}
      <div className="card p-5">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-4">Milestones</h2>
        <BadgeWall stats={{ currentStreak: data.currentStreak, completedLogs: data.completedLogs, avgScore: data.avgScore }} />
      </div>
    </div>
  );
}
