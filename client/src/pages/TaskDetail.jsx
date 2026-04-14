import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTaskAnalytics } from '../api/analytics.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import DisciplineScore from '../components/DisciplineScore.jsx';
import { formatTime } from '../utils/formatters.js';

export default function TaskDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTaskAnalytics(id).then(r => { setData(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-6 text-text-muted text-sm">Loading...</div>;
  if (!data) return <div className="p-6 text-text-muted text-sm">Not found</div>;

  const { task, heatmap, stats } = data;

  const statBlocks = [
    { label: 'Scheduled', value: stats.totalScheduled },
    { label: 'Completed', value: stats.completed, color: 'text-green-400' },
    { label: 'Late', value: stats.late, color: 'text-yellow-400' },
    { label: 'Missed', value: stats.missed, color: 'text-red-400' },
    { label: 'Streak', value: `${stats.streak}d` },
    { label: 'Best streak', value: `${stats.bestStreak}d` },
    { label: 'Avg late', value: `${stats.avgMinutesLate}m` },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <Link to="/tasks" className="text-text-muted text-xs hover:text-text-secondary mb-4 inline-block">← Tasks</Link>

      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-text-primary font-medium text-lg">{task.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
              <span>{task.category}</span>
              <span>·</span>
              <span>{task.recurrence}</span>
              {task.targetTime && <><span>·</span><span className="font-mono">{formatTime(task.targetTime)}</span></>}
              <span>·</span>
              <span>weight {task.weight}</span>
            </div>
          </div>
          <DisciplineScore score={stats.successRate} size="sm" showLabel={false} />
        </div>
        <div className="text-text-muted text-xs mt-2">{stats.successRate}% success rate</div>
      </div>

      {/* Heatmap */}
      <div className="card p-5 mb-4">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-4">90-day calendar</h2>
        <HeatmapCalendar data={heatmap} />
      </div>

      {/* Stats grid */}
      <div className="card p-5 mb-4">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-4">Summary</h2>
        <div className="grid grid-cols-4 gap-3">
          {statBlocks.map(s => (
            <div key={s.label} className="text-center">
              <div className={`font-mono text-xl font-medium ${s.color || 'text-text-primary'}`}>{s.value}</div>
              <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent logs */}
      <div className="card p-5">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-3">Recent entries</h2>
        <div className="space-y-1.5">
          {heatmap.filter(h => h.status !== 'unscheduled' && h.status !== 'pending').slice(-14).reverse().map(h => (
            <div key={h.date} className="flex items-center justify-between text-xs">
              <span className="text-text-muted font-mono">{h.date}</span>
              <div className="flex items-center gap-2">
                {h.minutesLate > 0 && <span className="text-yellow-500/60">+{h.minutesLate}m</span>}
                <span style={{ color: h.status === 'completed' ? '#22c55e' : h.status === 'late' ? '#eab308' : '#ef4444' }}>
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
