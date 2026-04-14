import express from 'express';
import TaskLog from '../models/TaskLog.js';
import Task from '../models/Task.js';
import protect from '../middleware/auth.js';
import { calculateDayScore } from '../utils/scoreCalculator.js';
import { calculateCurrentStreak, calculateBestStreak } from '../utils/streakCalculator.js';
import { getLast30Days, getLast90Days, isTaskScheduledOnDate } from '../utils/dateHelpers.js';

const router = express.Router();
router.use(protect);

// Global analytics
router.get('/global', async (req, res) => {
  try {
    const last30 = getLast30Days();
    const dailyScores = await Promise.all(last30.map(d => calculateDayScore(req.user._id, d)));
    const scores = last30.map((date, i) => ({ date, ...dailyScores[i] }));
    const currentStreak = await calculateCurrentStreak(req.user._id, req.user.streakThreshold);
    const bestStreak = await calculateBestStreak(req.user._id, req.user.streakThreshold);
    const totalLogs = await TaskLog.countDocuments({ user: req.user._id });
    const completedLogs = await TaskLog.countDocuments({ user: req.user._id, status: { $in: ['completed', 'late'] } });
    const avgScore = scores.reduce((a, s) => a + s.score, 0) / scores.length;

    res.json({ scores, currentStreak, bestStreak, totalLogs, completedLogs, avgScore: Math.round(avgScore) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Per-task analytics
router.get('/task/:taskId', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const last90 = getLast90Days();
    const logs = await TaskLog.find({ user: req.user._id, task: req.params.taskId });
    const logMap = {};
    logs.forEach(l => { logMap[l.date] = l; });

    const heatmap = last90.map(date => {
      const scheduled = isTaskScheduledOnDate(task, date);
      const log = logMap[date];
      let status = 'unscheduled';
      if (scheduled) {
        status = log ? log.status : 'pending';
      }
      return { date, status, minutesLate: log?.minutesLate || 0 };
    });

    const scheduled = heatmap.filter(h => h.status !== 'unscheduled');
    const completed = scheduled.filter(h => h.status === 'completed');
    const late = scheduled.filter(h => h.status === 'late');
    const missed = scheduled.filter(h => h.status === 'missed');

    // streak for this task
    let streak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      const h = heatmap[i];
      if (h.status === 'unscheduled' || h.status === 'pending') continue;
      if (h.status === 'completed' || h.status === 'late') streak++;
      else break;
    }

    let bestStreak = 0, cur = 0;
    heatmap.forEach(h => {
      if (h.status === 'completed' || h.status === 'late') { cur++; bestStreak = Math.max(bestStreak, cur); }
      else if (h.status === 'missed') cur = 0;
    });

    res.json({
      task,
      heatmap,
      stats: {
        totalScheduled: scheduled.length,
        completed: completed.length,
        late: late.length,
        missed: missed.length,
        streak,
        bestStreak,
        successRate: scheduled.length ? Math.round(((completed.length + late.length) / scheduled.length) * 100) : 0,
        avgMinutesLate: late.length ? Math.round(late.reduce((a, l) => a + l.minutesLate, 0) / late.length) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
