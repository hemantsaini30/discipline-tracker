import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { getLogsForDate, upsertLog } from '../api/logs.js';
import { getDayPlan, saveDayPlan, resetDayPlan } from '../api/dayplan.js';
import TaskCard from '../components/TaskCard.jsx';
import DisciplineScore from '../components/DisciplineScore.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import AIInsight from '../components/AIInsight.jsx';
import { getGlobalAnalytics } from '../api/analytics.js';
import { todayStr, formatDate, formatTime } from '../utils/formatters.js';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks: allTasks } = useTasks();

  const [logs, setLogs] = useState([]);
  const [plan, setPlan] = useState(null);         // today's plan (list of tasks)
  const [analytics, setAnalytics] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);

  const today = todayStr();

  const fetchAll = useCallback(async () => {
    const [logsRes, planRes] = await Promise.all([
      getLogsForDate(today),
      getDayPlan(today),
    ]);
    setLogs(logsRes.data);
    setPlan(planRes.data);
  }, [today]);

  useEffect(() => {
    fetchAll();
    getGlobalAnalytics().then(r => setAnalytics(r.data)).catch(() => {});
  }, [fetchAll]);

  // Tasks shown on dashboard = today's plan tasks
  const todayTasks = plan?.tasks || [];
  const logMap = {};
  logs.forEach(l => {
    const taskId = l.task?._id || l.task;
    logMap[taskId] = l;
  });

  const completed = logs.filter(l => l.status === 'completed' || l.status === 'late').length;
  const todayScore = analytics?.scores?.[analytics.scores.length - 1]?.score ?? 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? 'Late night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const progress = todayTasks.length > 0 ? Math.round((completed / todayTasks.length) * 100) : 0;

  // Tasks not yet in today's plan
  const notInPlan = allTasks.filter(t => !todayTasks.find(pt => (pt._id || pt) === t._id));

  const handleOpenAdd = () => {
    setSelectedToAdd(todayTasks.map(t => t._id || t));
    setShowAddPanel(true);
  };

  const toggleSelect = (id) => {
    setSelectedToAdd(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    try {
      await saveDayPlan({ date: today, taskIds: selectedToAdd });
      setShowAddPanel(false);
      await fetchAll();
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-text-muted text-xs mb-0.5">{formatDate(today)}</div>
          <h1 className="text-text-primary text-base sm:text-lg font-medium">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge streak={analytics?.currentStreak ?? 0} />
          <DisciplineScore score={todayScore} size="sm" showLabel={false} />
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="bg-bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-xs">Today's progress</span>
          <span className="text-text-muted text-xs font-mono">
            {completed}/{todayTasks.length} · {progress}%
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: progress >= 80 ? '#22c55e' : progress >= 60 ? '#3b82f6' : progress >= 40 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
        {todayTasks.length === 0 && (
          <p className="text-text-muted text-xs mt-2">
            No tasks planned today.{' '}
            <button onClick={handleOpenAdd} className="text-accent-blue hover:underline">
              Add tasks
            </button>
          </p>
        )}
      </div>

      {/* ── Task list header ── */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-text-secondary text-xs uppercase tracking-wide">
          Today's tasks {plan?.isLocked && <span className="text-accent-blue/50 ml-1">locked</span>}
        </span>
        <button
          onClick={handleOpenAdd}
          className="text-xs text-accent-blue hover:text-blue-400 border border-accent-blue/20 hover:border-accent-blue/50 px-2.5 py-1 rounded-md transition-all"
        >
          + Manage
        </button>
      </div>

      {/* ── Manage/Add panel ── */}
      {showAddPanel && (
        <div className="bg-bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-xs uppercase tracking-wide">Select today's tasks</span>
            <button onClick={() => setShowAddPanel(false)} className="text-text-muted text-xs hover:text-text-secondary">cancel</button>
          </div>
          <div className="space-y-1.5 mb-4 max-h-56 overflow-y-auto">
            {allTasks.length === 0 && (
              <p className="text-text-muted text-xs py-2">
                No tasks exist yet. <Link to="/tasks" className="text-accent-blue hover:underline">Create tasks first →</Link>
              </p>
            )}
            {allTasks.map(task => (
              <label
                key={task._id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-all ${
                  selectedToAdd.includes(task._id)
                    ? 'bg-accent-blue/5 border-accent-blue/30 text-text-primary'
                    : 'border-border hover:border-zinc-600 text-text-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-500"
                  checked={selectedToAdd.includes(task._id)}
                  onChange={() => toggleSelect(task._id)}
                />
                <span className="flex-1 text-xs">{task.name}</span>
                {task.targetTime && (
                  <span className="text-text-muted text-xs font-mono shrink-0">{formatTime(task.targetTime)}</span>
                )}
                <span className="text-text-muted text-xs shrink-0 hidden sm:inline">{task.category}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-text-muted text-xs">{selectedToAdd.length} selected</span>
            <button
              onClick={handleSavePlan}
              disabled={savingPlan}
              className="btn-primary text-xs py-1.5 px-4"
            >
              {savingPlan ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tasks ── */}
      <div className="space-y-2 mb-5">
        {todayTasks.map(task => {
          const taskId = task._id || task;
          const taskObj = allTasks.find(t => t._id === taskId) || task;
          return (
            <TaskCard
              key={taskId}
              task={taskObj}
              log={logMap[taskId]}
              onUpdate={fetchAll}
            />
          );
        })}
      </div>

      {/* ── AI Insight ── */}
      <AIInsight />
    </div>
  );
}