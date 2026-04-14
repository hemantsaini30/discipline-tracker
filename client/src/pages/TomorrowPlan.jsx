import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { getDayPlan, saveDayPlan } from '../api/dayplan.js';
import { tomorrowStr, formatDate, formatTime } from '../utils/formatters.js';

export default function TomorrowPlan() {
  const { tasks } = useTasks();
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const tomorrow = tomorrowStr();

  useEffect(() => {
    // Pre-select auto-scheduled tasks
    const dayOfWeek = new Date(tomorrow + 'T00:00:00').getDay();
    const autoSelected = tasks.filter(t => {
      if (t.recurrence === 'daily') return true;
      if (t.recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (t.recurrence === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      return false;
    }).map(t => t._id);
    setSelected(autoSelected);
  }, [tasks, tomorrow]);

  const toggle = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleSave = async () => {
    const { default: api } = await import('../api/axios.js');
    await api.post('/dayplan', { date: tomorrow, taskIds: selected, note });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-text-primary font-medium text-lg mb-1">Tomorrow's Plan</h1>
      <p className="text-text-muted text-xs mb-6">{formatDate(tomorrow)}</p>

      <div className="card p-5 mb-4">
        <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-3">Select tasks</h2>
        <div className="space-y-1.5">
          {tasks.map(task => (
            <label
              key={task._id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-all ${
                selected.includes(task._id)
                  ? 'bg-accent-blue/5 border-accent-blue/30'
                  : 'border-border hover:border-zinc-600'
              }`}
            >
              <input
                type="checkbox"
                className="accent-blue-500 w-3.5 h-3.5"
                checked={selected.includes(task._id)}
                onChange={() => toggle(task._id)}
              />
              <div className="flex-1">
                <span className="text-text-primary text-xs">{task.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {task.targetTime && <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>}
                <span className="text-text-muted text-xs">{task.category}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <label className="text-text-muted text-xs block mb-2">Note (optional)</label>
        <textarea
          className="w-full h-16 text-xs resize-none"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Anything special about tomorrow?"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs">{selected.length} tasks selected</span>
        <button onClick={handleSave} className="btn-primary">
          {saved ? 'Locked in ✓' : 'Lock in schedule'}
        </button>
      </div>
    </div>
  );
}
