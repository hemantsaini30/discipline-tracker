import TaskLog from '../models/TaskLog.js';
import Task from '../models/Task.js';
import { isTaskScheduledOnDate } from './dateHelpers.js';

export const calculateDayScore = async (userId, dateStr) => {
  const tasks = await Task.find({ user: userId, isActive: true });
  const scheduled = tasks.filter(t => isTaskScheduledOnDate(t, dateStr));
  if (scheduled.length === 0) return { score: 0, totalWeight: 0, earnedWeight: 0 };

  const logs = await TaskLog.find({ user: userId, date: dateStr });
  const logMap = {};
  logs.forEach(l => { logMap[l.task.toString()] = l; });

  let totalWeight = 0;
  let earnedWeight = 0;

  scheduled.forEach(task => {
    totalWeight += task.weight;
    const log = logMap[task._id.toString()];
    if (!log) return;
    if (log.status === 'completed') earnedWeight += task.weight;
    else if (log.status === 'late') earnedWeight += task.weight * 0.75;
    // missed = 0, skipped = 0
  });

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { score, totalWeight, earnedWeight, scheduledCount: scheduled.length };
};

export const isStreakDay = async (userId, dateStr, threshold = 60) => {
  const { score } = await calculateDayScore(userId, dateStr);
  return score >= threshold;
};
