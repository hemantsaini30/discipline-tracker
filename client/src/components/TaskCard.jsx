import { formatTime } from '../utils/formatters.js';
import { statusBg } from '../utils/scoreColors.js';
import { upsertLog } from '../api/logs.js';
import { todayStr } from '../utils/formatters.js';

export default function TaskCard({ task, log, onUpdate }) {
  const status = log?.status || 'pending';

  const handleMark = async (newStatus) => {
    const now = new Date();
    const completedAt = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    let minutesLate = 0;

    if (task.targetTime && (newStatus === 'completed' || newStatus === 'late')) {
      const [th, tm] = task.targetTime.split(':').map(Number);
      const targetMins = th * 60 + tm;
      const actualMins = now.getHours() * 60 + now.getMinutes();
      minutesLate = Math.max(0, actualMins - targetMins);
      if (minutesLate > task.toleranceMinutes) newStatus = 'late';
    }

    await upsertLog({ taskId: task._id, date: todayStr(), status: newStatus, completedAt, minutesLate });
    onUpdate?.();
  };

  const statusDot = { completed: 'bg-accent-green', late: 'bg-accent-yellow', missed: 'bg-accent-red', pending: 'bg-text-muted' };

  return (
    <div className={`card p-3.5 flex items-center gap-3 hover:border-zinc-600 transition-all ${status === 'missed' ? 'opacity-60' : ''}`}>
      <div className={`status-dot shrink-0 ${statusDot[status] || 'bg-text-muted'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-sm font-medium truncate">{task.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {task.targetTime && (
            <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>
          )}
          <span className="text-text-muted text-xs">{task.category}</span>
          {log?.minutesLate > 0 && (
            <span className="text-amber-500/80 text-xs">+{log.minutesLate}m late</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {status === 'pending' && (
          <>
            <button onClick={() => handleMark('completed')} className="text-xs text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/50 px-2 py-1 rounded transition-all">Done</button>
            <button onClick={() => handleMark('missed')} className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-500/30 px-2 py-1 rounded transition-all">Miss</button>
          </>
        )}
        {status !== 'pending' && (
          <span className={`text-xs px-2 py-1 rounded border ${statusBg(status)}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
