import { isStreakDay } from './scoreCalculator.js';

export const calculateCurrentStreak = async (userId, threshold = 60) => {
  let streak = 0;
  const today = new Date();
  let d = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    const qualifies = await isStreakDay(userId, dateStr, threshold);
    if (qualifies) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export const calculateBestStreak = async (userId, threshold = 60) => {
  let best = 0;
  let current = 0;
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const qualifies = await isStreakDay(userId, dateStr, threshold);
    if (qualifies) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
};
