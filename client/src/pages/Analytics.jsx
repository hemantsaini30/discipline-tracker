import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { getGlobalAnalytics, getTaskAnalytics } from '../api/analytics.js';
import { getLogsRange } from '../api/logs.js';
import TrendChart from '../components/TrendChart.jsx';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import DisciplineScore from '../components/DisciplineScore.jsx';
import { scoreToColor } from '../utils/scoreColors.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const CustomBar = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border px-3 py-2 rounded-lg text-xs">
        <div className="text-text-muted mb-1">{label}</div>
        <div className="font-mono" style={{ color: scoreToColor(payload[0].value) }}>
          {payload[0].value}%
        </div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { tasks } = useTasks();
  const [global, setGlobal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [tab, setTab] = useState('overview'); // 'overview' | 'tasks'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGlobalAnalytics().then(r => setGlobal(r.data));
  }, []);

  const loadTask = async (task) => {
    setSelectedTask(task);
    setLoading(true);
    try {
      const { data } = await getTaskAnalytics(task._id);
      setTaskData(data);
    } finally {
      setLoading(false);
    }
  };

  // Weekly breakdown from scores
  const weeklyData = global ? (() => {
    const weeks = [];
    const scores = global.scores;
    for (let i = 0; i < scores.length; i += 7) {
      const chunk = scores.slice(i, i + 7);
      const avg = chunk.reduce((a, s) => a + s.score, 0) / chunk.length;
      weeks.push({ week: `W${Math.floor(i / 7) + 1}`, score: Math.round(avg) });
    }
    return weeks;
  })() : [];

  // Category radar — per-category success rate
  const categoryData = (() => {
    if (!tasks.length) return [];
    const cats = {};
    tasks.forEach(t => {
      if (!cats[t.category]) cats[t.category] = { name: t.category.replace(' ', '\n'), tasks: [] };
      cats[t.category].tasks.push(t);
    });
    return Object.values(cats).map(c => ({
      category: c.name,
      tasks: c.tasks.length,
      value: c.tasks.length * 20, // placeholder — replace with real completion %
    }));
  })();

  // Consistency: how many days per week had score >= 60
  const consistencyData = global ? (() => {
    const scores = global.scores;
    const weeks = [];
    for (let i = 0; i < scores.length; i += 7) {
      const chunk = scores.slice(i, i + 7);
      const good = chunk.filter(s => s.score >= 60).length;
      weeks.push({ week: `W${Math.floor(i / 7) + 1}`, days: good, total: chunk.length });
    }
    return weeks;
  })() : [];

  if (!global) return (
    <div className="p-4 sm:p-6 text-text-muted text-sm flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      Loading analytics...
    </div>
  );

  const todayScore = global.scores[global.scores.length - 1]?.score ?? 0;
  const last7 = global.scores.slice(-7);
  const thisWeekAvg = Math.round(last7.reduce((a, s) => a + s.score, 0) / (last7.length || 1));
  const prev7 = global.scores.slice(-14, -7);
  const prevAvg = Math.round(prev7.reduce((a, s) => a + s.score, 0) / (prev7.length || 1));
  const weekTrend = thisWeekAvg - prevAvg;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-text-primary font-medium text-base sm:text-lg">Analytics</h1>
        <div className="flex gap-1 bg-bg-card border border-border rounded-lg p-1">
          {['overview', 'tasks'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md capitalize transition-all ${
                tab === t ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Today', value: `${todayScore}%`, color: scoreToColor(todayScore) },
              { label: 'This week', value: `${thisWeekAvg}%`, sub: `${weekTrend >= 0 ? '+' : ''}${weekTrend}% vs last`, subColor: weekTrend >= 0 ? '#22c55e' : '#ef4444' },
              { label: 'Monthly avg', value: `${global.avgScore}%`, color: scoreToColor(global.avgScore) },
              { label: 'Best streak', value: `${global.bestStreak}d` },
            ].map(k => (
              <div key={k.label} className="bg-bg-card border border-border rounded-lg p-3.5">
                <div className="text-text-muted text-xs mb-1">{k.label}</div>
                <div className="font-mono text-xl font-medium" style={{ color: k.color || 'var(--color-text-primary)' }}>
                  {k.value}
                </div>
                {k.sub && (
                  <div className="text-xs font-mono mt-0.5" style={{ color: k.subColor }}>
                    {k.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 30-day trend */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary text-xs uppercase tracking-wide">30-day discipline score</span>
              <span className="text-text-muted text-xs font-mono">{global.avgScore}% avg</span>
            </div>
            <TrendChart data={global.scores} height={130} />
          </div>

          {/* Weekly avg bars */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <span className="text-text-secondary text-xs uppercase tracking-wide block mb-3">Weekly averages</span>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="week" tick={{ fill: '#55556a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#55556a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomBar />} />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {weeklyData.map((d, i) => (
                    <Cell key={i} fill={scoreToColor(d.score)} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Consistency — days per week above threshold */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <span className="text-text-secondary text-xs uppercase tracking-wide block mb-3">
              Streak days per week <span className="text-text-muted normal-case">(≥60% score)</span>
            </span>
            <div className="flex items-end gap-2 h-14">
              {consistencyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${(w.days / 7) * 48}px`,
                      background: w.days >= 5 ? '#22c55e' : w.days >= 3 ? '#3b82f6' : w.days >= 1 ? '#eab308' : '#2a2a32',
                      minHeight: 2,
                    }}
                  />
                  <span className="text-text-muted text-xs">{w.week}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              {[['#22c55e', '5–7 days'], ['#3b82f6', '3–4'], ['#eab308', '1–2'], ['#2a2a32', '0']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span className="text-text-muted text-xs">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total logged', value: global.totalLogs, color: '' },
              { label: 'Completed', value: global.completedLogs, color: 'text-green-400' },
              { label: 'Completion rate', value: `${global.totalLogs ? Math.round((global.completedLogs / global.totalLogs) * 100) : 0}%`, color: 'text-accent-blue' },
            ].map(s => (
              <div key={s.label} className="bg-bg-card border border-border rounded-lg p-3.5 text-center">
                <div className={`font-mono text-xl font-medium ${s.color || 'text-text-primary'}`}>{s.value}</div>
                <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-4">

          {/* Task picker */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <span className="text-text-secondary text-xs uppercase tracking-wide block mb-3">Select task</span>
            <div className="flex flex-wrap gap-1.5">
              {tasks.map(t => (
                <button
                  key={t._id}
                  onClick={() => loadTask(t)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    selectedTask?._id === t._id
                      ? 'bg-accent-blue/10 border-accent-blue/50 text-accent-blue'
                      : 'border-border text-text-muted hover:border-zinc-600 hover:text-text-secondary'
                  }`}
                >
                  {t.name}
                </button>
              ))}
              {tasks.length === 0 && (
                <span className="text-text-muted text-xs">No tasks yet.</span>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}

          {!loading && taskData && (
            <>
              {/* Task header */}
              <div className="bg-bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-text-primary font-medium text-sm">{taskData.task.name}</h2>
                    <span className="text-text-muted text-xs">{taskData.task.category} · {taskData.task.recurrence}</span>
                  </div>
                  <DisciplineScore score={taskData.stats.successRate} size="sm" showLabel={false} />
                </div>
              </div>

              {/* Task KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Streak', value: `${taskData.stats.streak}d`, color: '#f59e0b' },
                  { label: 'Best', value: `${taskData.stats.bestStreak}d`, color: '#8888a0' },
                  { label: 'On time', value: taskData.stats.completed, color: '#22c55e' },
                  { label: 'Late', value: taskData.stats.late, color: '#eab308' },
                  { label: 'Missed', value: taskData.stats.missed, color: '#ef4444' },
                  { label: 'Success', value: `${taskData.stats.successRate}%`, color: scoreToColor(taskData.stats.successRate) },
                  { label: 'Avg late', value: `${taskData.stats.avgMinutesLate}m`, color: '#8888a0' },
                  { label: 'Scheduled', value: taskData.stats.totalScheduled, color: '#8888a0' },
                ].map(s => (
                  <div key={s.label} className="bg-bg-card border border-border rounded-lg p-3 text-center">
                    <div className="font-mono text-lg font-medium" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <div className="bg-bg-card border border-border rounded-lg p-4">
                <span className="text-text-secondary text-xs uppercase tracking-wide block mb-3">90-day heatmap</span>
                <HeatmapCalendar data={taskData.heatmap} />
              </div>

              {/* Recent log */}
              <div className="bg-bg-card border border-border rounded-lg p-4">
                <span className="text-text-secondary text-xs uppercase tracking-wide block mb-3">Recent history</span>
                <div className="space-y-1.5">
                  {taskData.heatmap
                    .filter(h => h.status !== 'unscheduled' && h.status !== 'pending')
                    .slice(-20)
                    .reverse()
                    .map(h => (
                      <div key={h.date} className="flex items-center justify-between">
                        <span className="text-text-muted text-xs font-mono">{h.date}</span>
                        <div className="flex items-center gap-2">
                          {h.minutesLate > 0 && (
                            <span className="text-yellow-500/60 text-xs">+{h.minutesLate}m</span>
                          )}
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              color: h.status === 'completed' ? '#22c55e' : h.status === 'late' ? '#eab308' : '#ef4444',
                              background: h.status === 'completed' ? '#22c55e15' : h.status === 'late' ? '#eab30815' : '#ef444415',
                            }}
                          >
                            {h.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}