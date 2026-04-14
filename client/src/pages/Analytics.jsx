import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { getGlobalAnalytics, getTaskAnalytics } from '../api/analytics.js';
import TrendChart from '../components/TrendChart.jsx';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import DisciplineScore from '../components/DisciplineScore.jsx';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const { tasks } = useTasks();
  const [global, setGlobal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [taskData, setTaskData] = useState(null);

  useEffect(() => { getGlobalAnalytics().then(r => setGlobal(r.data)); }, []);

  const loadTask = async (taskId) => {
    setSelected(taskId);
    const { data } = await getTaskAnalytics(taskId);
    setTaskData(data);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-text-primary font-medium text-lg mb-6">Analytics</h1>

      {/* Global trend */}
      {global && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-secondary text-xs uppercase tracking-wide">Global 30-day trend</h2>
            <span className="text-text-muted text-xs font-mono">{global.avgScore}% avg</span>
          </div>
          <TrendChart data={global.scores} height={130} />
        </div>
      )}

      {/* Task selector */}
      <div className="card p-5 mb-4">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-3">Per-task analytics</h2>
        <div className="flex flex-wrap gap-1.5">
          {tasks.map(t => (
            <button
              key={t._id}
              onClick={() => loadTask(t._id)}
              className={`text-xs px-2.5 py-1 rounded border transition-all ${
                selected === t._id
                  ? 'bg-accent-blue/10 border-accent-blue/40 text-accent-blue'
                  : 'border-border text-text-muted hover:border-zinc-600 hover:text-text-secondary'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task data */}
      {taskData && (
        <>
          <div className="card p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-text-primary text-sm font-medium">{taskData.task.name}</h2>
                <span className="text-text-muted text-xs">{taskData.task.category}</span>
              </div>
              <DisciplineScore score={taskData.stats.successRate} size="sm" showLabel={false} />
            </div>
            <HeatmapCalendar data={taskData.heatmap} />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              ['streak', `${taskData.stats.streak}d`],
              ['success', `${taskData.stats.successRate}%`],
              ['missed', taskData.stats.missed],
              ['avg late', `${taskData.stats.avgMinutesLate}m`],
            ].map(([label, val]) => (
              <div key={label} className="card p-3 text-center">
                <div className="text-text-primary font-mono text-lg font-medium">{val}</div>
                <div className="text-text-muted text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to={`/tasks/${taskData.task._id}`} className="text-accent-blue text-xs hover:underline">
              Full task page →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
