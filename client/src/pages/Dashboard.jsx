import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { getLogsForDate } from '../api/logs.js';
import TaskCard from '../components/TaskCard.jsx';
import TimelineBlock from '../components/TimelineBlock.jsx';
import AIInsight from '../components/AIInsight.jsx';
import DisciplineScore from '../components/DisciplineScore.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import { getGlobalAnalytics } from '../api/analytics.js';
import { todayStr, formatDate } from '../utils/formatters.js';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [view, setView] = useState('cards'); // 'cards' | 'timeline'

  const fetchLogs = useCallback(async () => {
    const { data } = await getLogsForDate(todayStr());
    setLogs(data);
  }, []);

  useEffect(() => {
    fetchLogs();
    getGlobalAnalytics().then(r => setAnalytics(r.data));
  }, [fetchLogs]);

  const logMap = {};
  logs.forEach(l => { logMap[l.task?._id || l.task] = l; });

  const todayScore = analytics?.scores?.[analytics.scores.length - 1]?.score ?? 0;
  const completed = logs.filter(l => l.status === 'completed' || l.status === 'late').length;
  const remaining = Math.max(0, tasks.length - completed);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-text-muted text-xs mb-1">{formatDate(todayStr())}</div>
          <h1 className="text-text-primary text-lg font-medium">{greeting}, {user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge streak={analytics?.currentStreak ?? 0} />
          <DisciplineScore score={todayScore} size="sm" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-xs">Today's progress</span>
          <span className="text-text-muted text-xs font-mono">{completed}/{tasks.length} tasks</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-blue rounded-full transition-all duration-500"
            style={{ width: tasks.length ? `${(completed / tasks.length) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-text-muted text-xs">{todayScore}% discipline score</span>
          {remaining > 0 && <span className="text-text-muted text-xs">{remaining} remaining</span>}
          {remaining === 0 && tasks.length > 0 && <span className="text-green-400 text-xs">All done</span>}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide">Schedule</h2>
        <div className="flex gap-1">
          {['cards', 'timeline'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-2.5 py-1 rounded transition-all ${view === v ? 'bg-bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'cards' ? (
        <div className="space-y-2 mb-6">
          {tasks.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-text-muted text-sm">No tasks scheduled.</p>
              <Link to="/tasks" className="text-accent-blue text-xs mt-2 inline-block hover:underline">Add tasks →</Link>
            </div>
          )}
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} log={logMap[task._id]} onUpdate={fetchLogs} />
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <TimelineBlock tasks={tasks} logs={logs} />
        </div>
      )}

      {/* AI Insight */}
      <AIInsight />
    </div>
  );
}
