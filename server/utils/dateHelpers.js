export const todayString = () => new Date().toISOString().slice(0, 10);

export const getDayOfWeek = (dateStr) => new Date(dateStr).getDay();

export const isTaskScheduledOnDate = (task, dateStr) => {
  const day = getDayOfWeek(dateStr);
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'weekdays') return day >= 1 && day <= 5;
  if (task.recurrence === 'weekends') return day === 0 || day === 6;
  if (task.recurrence === 'custom') return task.customDays.includes(day);
  return false;
};

export const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

export const getLast90Days = () => {
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};
