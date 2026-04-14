export const scoreToColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const statusColor = (status) => {
  const map = {
    completed: '#22c55e',
    late: '#eab308',
    missed: '#ef4444',
    pending: '#55556a',
    unscheduled: '#2a2a32',
  };
  return map[status] || '#2a2a32';
};

export const statusBg = (status) => {
  const map = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    late: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    missed: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  return map[status] || 'bg-zinc-800 text-zinc-500 border-zinc-700';
};
