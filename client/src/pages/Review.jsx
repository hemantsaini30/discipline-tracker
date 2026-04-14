import { useState, useEffect } from 'react';
import { getGlobalAnalytics } from '../api/analytics.js';
import { getLogsForDate } from '../api/logs.js';
import { useTasks } from '../context/TaskContext.jsx';
import AIInsight from '../components/AIInsight.jsx';
import TrendChart from '../components/TrendChart.jsx';
import { todayStr, formatDate } from '../utils/formatters.js';
import { statusColor } from '../utils/scoreColors.js';

export default function Review() {
  const { tasks } = useTasks();
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getGlobalAnalytics().then(r => setAnalytics(r.data));
    getLogsForDate(todayStr()).then(r => setLogs(r.data));
  }, []);

  const logMap = {};
  logs.forEach(l => { logMap[l.task?._id || l.task] = l; });

  const completed = logs.filter(l => l.status === 'completed');
  const late = logs.filter(l => l.status === 'late');
  const missed = logs.filter(l => l.status === 'missed');
  const pending = tasks.filter(t => !logMap[t._id]);

  const last7 = analytics?.scores?.slice(-7) || [];
  const thisWeekAvg = last7.length ? Math.round(last7.reduce((a, s) => a + s.score, 0) / last7.length) : 0;
  const prevWeek = analytics?.scores?.slice(-14, -7) || [];
  const prevAvg = prevWeek.length ? Math.round(prevWeek.reduce((a, s) => a + s.score, 0) / prevWeek.length) : 0;
  const trend = thisWeekAvg - prevAvg;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-text-primary font-medium text-lg">Daily Review</h1>
        <span className="text-text-muted text-xs">{formatDate(todayStr())}</span>
      </div>

      {/* Week trend */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-secondary text-xs uppercase tracking-wide">This week avg</span>
          <span className={`text-xs font-mono ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs last week
          </span>
        </div>
        <div className="text-text-primary text-2xl font-mono font-medium mb-3">{thisWeekAvg}%</div>
        {analytics && <TrendChart data={analytics.scores.slice(-14)} height={80} />}
      </div>

      {/* Today breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-4 text-center">
          <div className="text-green-400 text-xl font-mono font-medium">{completed.length}</div>
          <div className="text-text-muted text-xs mt-1">completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-yellow-400 text-xl font-mono font-medium">{late.length}</div>
          <div className="text-text-muted text-xs mt-1">late</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-red-400 text-xl font-mono font-medium">{missed.length}</div>
          <div className="text-text-muted text-xs mt-1">missed</div>
        </div>
      </div>

      {/* What went well */}
      {completed.length > 0 && (
        <div className="card p-5 mb-3">
          <h2 className="text-green-400/70 text-xs uppercase tracking-wide mb-3">What went well</h2>
          <div className="space-y-1.5">
            {completed.map(log => {
              const task = tasks.find(t => t._id === (log.task?._id || log.task));
              return (
                <div key={log._id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 shrink-0" />
                  <span className="text-text-secondary text-xs">{task?.name || 'Task'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* What was missed */}
      {missed.length > 0 && (
        <div className="card p-5 mb-3">
          <h2 className="text-red-400/70 text-xs uppercase tracking-wide mb-3">What was missed</h2>
          <div className="space-y-1.5">
            {missed.map(log => {
              const task = tasks.find(t => t._id === (log.task?._id || log.task));
              return (
                <div key={log._id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 shrink-0" />
                  <span className="text-text-secondary text-xs">{task?.name || 'Task'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Still pending */}
      {pending.length > 0 && (
        <div className="card p-5 mb-4 border-zinc-700">
          <h2 className="text-text-muted text-xs uppercase tracking-wide mb-3">Still pending</h2>
          <div className="space-y-1">
            {pending.map(task => (
              <div key={task._id} className="text-text-muted text-xs">{task.name}</div>
            ))}
          </div>
        </div>
      )}

      {/* AI insight */}
      <AIInsight />
    </div>
  );
}
