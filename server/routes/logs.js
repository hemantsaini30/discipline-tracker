import express from 'express';
import TaskLog from '../models/TaskLog.js';
import protect from '../middleware/auth.js';
import { todayString } from '../utils/dateHelpers.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const { date } = req.query;
  const logs = await TaskLog.find({ user: req.user._id, date: date || todayString() }).populate('task');
  res.json(logs);
});

router.get('/range', async (req, res) => {
  const { from, to, taskId } = req.query;
  const query = { user: req.user._id };
  if (from && to) query.date = { $gte: from, $lte: to };
  if (taskId) query.task = taskId;
  const logs = await TaskLog.find(query).sort('date');
  res.json(logs);
});

router.post('/', async (req, res) => {
  try {
    const { taskId, date, status, completedAt, minutesLate, note } = req.body;
    const log = await TaskLog.findOneAndUpdate(
      { user: req.user._id, task: taskId, date },
      { status, completedAt, minutesLate: minutesLate || 0, note },
      { upsert: true, new: true }
    );
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await TaskLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Log removed' });
});

export default router;
