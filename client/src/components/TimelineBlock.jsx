import { formatTime } from '../utils/formatters.js';
import { statusColor } from '../utils/scoreColors.js';

export default function TimelineBlock({ tasks = [], logs = [] }) {
  const logMap = {};
  logs.forEach(l => { logMap[l.task?._id || l.task] = l; });

  const categories = {};
  tasks.forEach(t => {
    const cat = t.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  });

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([cat, catTasks]) => (
        <div key={cat}>
          <div className="text-text-muted text-xs uppercase tracking-wider mb-2 px-1">{cat}</div>
          <div className="space-y-1.5">
            {catTasks.map(task => {
              const log = logMap[task._id];
              const status = log?.status || 'pending';
              return (
                <div key={task._id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-bg-card border border-border">
                  <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: statusColor(status) }} />
                  <div className="flex-1">
                    <span className="text-text-primary text-xs">{task.name}</span>
                  </div>
                  {task.targetTime && (
                    <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>
                  )}
                  <span className="text-xs" style={{ color: statusColor(status) }}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
