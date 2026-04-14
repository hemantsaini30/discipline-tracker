import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext.jsx';
import { createTask, deleteTask } from '../api/tasks.js';
import { formatTime } from '../utils/formatters.js';

const CATEGORIES = ['Morning Routine', 'Sleep', 'Study', 'Fitness', 'Sports', 'Work', 'Personal Care', 'Productivity'];
const RECURRENCE = ['daily', 'weekdays', 'weekends', 'custom'];

const EMPTY = { name: '', category: 'Productivity', recurrence: 'daily', targetTime: '', toleranceMinutes: 15, weight: 1 };

export default function Tasks() {
  const { tasks, fetchTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTask(form);
      await fetchTasks();
      setForm(EMPTY);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this task?')) return;
    await deleteTask(id);
    fetchTasks();
  };

  const grouped = {};
  tasks.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-text-primary font-medium text-lg">Tasks</h1>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="text-text-secondary text-xs uppercase tracking-wide mb-4">New Task</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-text-muted text-xs block mb-1">Task name</label>
                <input className="w-full" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Wake up at 5:00 AM" />
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Category</label>
                <select className="w-full" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Recurrence</label>
                <select className="w-full" value={form.recurrence} onChange={e => setForm(p => ({ ...p, recurrence: e.target.value }))}>
                  {RECURRENCE.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Target time</label>
                <input type="time" className="w-full" value={form.targetTime} onChange={e => setForm(p => ({ ...p, targetTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Tolerance (min)</label>
                <input type="number" className="w-full" value={form.toleranceMinutes} onChange={e => setForm(p => ({ ...p, toleranceMinutes: +e.target.value }))} min={0} max={120} />
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Weight (importance 1–5)</label>
                <input type="number" className="w-full" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: +e.target.value }))} min={0.5} max={5} step={0.5} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create task'}</button>
            </div>
          </form>
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted text-sm">No tasks yet. Create your first habit above.</p>
        </div>
      )}

      {Object.entries(grouped).map(([cat, catTasks]) => (
        <div key={cat} className="mb-5">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-2">{cat}</div>
          <div className="space-y-1.5">
            {catTasks.map(task => (
              <div key={task._id} className="card p-3.5 flex items-center gap-3 hover:border-zinc-600 transition-all group">
                <Link to={`/tasks/${task._id}`} className="flex-1 min-w-0">
                  <div className="text-text-primary text-sm font-medium">{task.name}</div>
                  <div className="flex gap-2 mt-0.5">
                    {task.targetTime && <span className="text-text-muted text-xs font-mono">{formatTime(task.targetTime)}</span>}
                    <span className="text-text-muted text-xs">{task.recurrence} · weight {task.weight}</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-text-muted text-xs hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  archive
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
