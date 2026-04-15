import { useState } from 'react';
import { formatTime, getNowTimeStr, minutesBetween } from '../utils/formatters.js';
import { statusBg } from '../utils/scoreColors.js';
import { upsertLog, deleteLog } from '../api/logs.js';
import { todayStr } from '../utils/formatters.js';

export default function TaskCard({ task, log, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const status = log?.status || 'pending';

  const handleMark = async (intendedStatus) => {
    setLoading(true);
    try {
      const completedAt = getNowTimeStr();
      let finalStatus = intendedStatus;
      let minutesLate = 0;

      if (task.targetTime && intendedStatus === 'completed') {
        minutesLate = minutesBetween(task.targetTime, completedAt);
        if (minutesLate < 0) minutesLate = 0;
        if (minutesLate > (task.toleranceMinutes ?? 15)) {
          finalStatus = 'late';
        }
      }

      await upsertLog({
        taskId: task._id,
        date: todayStr(),
        status: finalStatus,
        completedAt,
        minutesLate,
      });
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!log?._id) return;
    setLoading(true);
    try {
      await deleteLog(log._id);
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  const dotColor = {
    completed: 'bg-green-500',
    late: 'bg-yellow-500',
    missed: 'bg-red-500',
    pending: 'bg-zinc-600',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border bg-bg-card transition-all
      ${status === 'missed' ? 'opacity-50 border-border' : 'border-border hover:border-zinc-600'}
      ${loading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor[status] || 'bg-zinc-600'}`} />

      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-sm font-medium truncate">{task.name}</div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.targetTime && (
            <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>
          )}
          <span className="text-text-muted text-xs hidden sm:inline">{task.category}</span>
          {log?.minutesLate > 0 && (
            <span className="text-yellow-500/80 text-xs">+{log.minutesLate}m</span>
          )}
          {log?.completedAt && status !== 'missed' && (
            <span className="text-zinc-600 text-xs font-mono">@ {formatTime(log.completedAt)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {loading && <span className="text-text-muted text-xs">...</span>}
        {!loading && status === 'pending' && (
          <>
            <button onClick={() => handleMark('completed')}
              className="text-xs text-green-400 border border-green-500/25 hover:border-green-500/60 hover:bg-green-500/5 px-2.5 py-1 rounded-md transition-all">
              Done
            </button>
            <button onClick={() => handleMark('missed')}
              className="text-xs text-zinc-500 border border-zinc-700 hover:text-red-400 hover:border-red-500/30 px-2.5 py-1 rounded-md transition-all">
              Miss
            </button>
          </>
        )}
        {!loading && status !== 'pending' && (
          <>
            <span className={`text-xs px-2.5 py-1 rounded-md border ${statusBg(status)}`}>
              {status}
            </span>
            <button onClick={handleUndo}
              className="text-zinc-600 text-xs hover:text-text-muted transition-colors ml-1">
              undo
            </button>
          </>
        )}
      </div>
    </div>
  );
}