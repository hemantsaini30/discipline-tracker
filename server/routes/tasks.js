import express from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ user: req.user._id, isActive: true }).sort('order');
  res.json(tasks);
});

router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
  res.json({ message: 'Task archived' });
});

export default router;
