import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { getDayPlan, saveDayPlan, resetDayPlan } from '../api/dayplan.js';
import { tomorrowStr, formatDate, formatTime } from '../utils/formatters.js';

export default function TomorrowPlan() {
  const { tasks } = useTasks();
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [planLocked, setPlanLocked] = useState(false);
  const tomorrow = tomorrowStr();

  useEffect(() => {
    getDayPlan(tomorrow).then(r => {
      const plan = r.data;
      const ids = (plan.tasks || []).map(t => t._id || t);
      setSelected(ids);
      setNote(plan.note || '');
      setPlanLocked(plan.isLocked || false);
    }).catch(() => {
      // Auto-select based on recurrence
      const dayOfWeek = new Date(tomorrow + 'T00:00:00').getDay();
      const autoIds = tasks.filter(t => {
        if (t.recurrence === 'daily') return true;
        if (t.recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
        if (t.recurrence === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
        return false;
      }).map(t => t._id);
      setSelected(autoIds);
    });
  }, [tasks, tomorrow]);

  const toggle = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleSave = async () => {
    await saveDayPlan({ date: tomorrow, taskIds: selected, note });
    setSaved(true);
    setPlanLocked(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    await resetDayPlan(tomorrow);
    setPlanLocked(false);
    // Re-auto-select
    const dayOfWeek = new Date(tomorrow + 'T00:00:00').getDay();
    const autoIds = tasks.filter(t => {
      if (t.recurrence === 'daily') return true;
      if (t.recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (t.recurrence === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      return false;
    }).map(t => t._id);
    setSelected(autoIds);
  };

  // Group by category
  const grouped = {};
  tasks.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-text-primary font-medium text-base sm:text-lg">Tomorrow's Plan</h1>
          <p className="text-text-muted text-xs mt-0.5">{formatDate(tomorrow)}</p>
        </div>
        {planLocked && (
          <div className="flex items-center gap-2">
            <span className="text-accent-blue text-xs border border-accent-blue/20 px-2 py-1 rounded">Locked</span>
            <button onClick={handleReset} className="text-text-muted text-xs hover:text-text-secondary transition-colors">reset</button>
          </div>
        )}
      </div>

      {/* Task selection by category */}
      {Object.entries(grouped).map(([cat, catTasks]) => (
        <div key={cat} className="mb-4">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-2">{cat}</div>
          <div className="space-y-1.5">
            {catTasks.map(task => (
              <label
                key={task._id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  selected.includes(task._id)
                    ? 'bg-accent-blue/5 border-accent-blue/30'
                    : 'bg-bg-card border-border hover:border-zinc-600'
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-500 w-3.5 h-3.5"
                  checked={selected.includes(task._id)}
                  onChange={() => toggle(task._id)}
                />
                <span className="flex-1 text-text-primary text-xs">{task.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {task.targetTime && (
                    <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>
                  )}
                  <span className="text-text-muted text-xs hidden sm:inline">w:{task.weight}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="bg-bg-card border border-border rounded-lg p-6 text-center mb-4">
          <p className="text-text-muted text-sm">No tasks yet.</p>
        </div>
      )}

      {/* Note */}
      <div className="bg-bg-card border border-border rounded-lg p-4 mb-4">
        <label className="text-text-muted text-xs block mb-2">Note for tomorrow</label>
        <textarea
          className="w-full h-16 text-xs resize-none bg-bg-secondary border border-border rounded-md p-2.5 text-text-primary"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Reminders, intention, context..."
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs">{selected.length} of {tasks.length} tasks selected</span>
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Locked in' : 'Lock in plan'}
        </button>
      </div>
    </div>
  );
}