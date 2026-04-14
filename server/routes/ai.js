import express from 'express';
import protect from '../middleware/auth.js';
import groq from '../config/groq.js';
import TaskLog from '../models/TaskLog.js';
import Task from '../models/Task.js';
import { getLast30Days } from '../utils/dateHelpers.js';
import { calculateDayScore } from '../utils/scoreCalculator.js';

const router = express.Router();
router.use(protect);

router.post('/insights', async (req, res) => {
  try {
    const last30 = getLast30Days();
    const tasks = await Task.find({ user: req.user._id, isActive: true });
    const logs = await TaskLog.find({
      user: req.user._id,
      date: { $gte: last30[0], $lte: last30[last30.length - 1] },
    });

    const dailyScores = await Promise.all(last30.map(d => calculateDayScore(req.user._id, d)));
    const scoreData = last30.map((date, i) => ({ date, score: dailyScores[i].score }));

    const taskStats = tasks.map(t => {
      const taskLogs = logs.filter(l => l.task.toString() === t._id.toString());
      const missed = taskLogs.filter(l => l.status === 'missed').length;
      const late = taskLogs.filter(l => l.status === 'late').length;
      return { name: t.name, category: t.category, missed, late, total: taskLogs.length };
    });

    const prompt = `You are a discipline coach analyzing a user's habit tracking data. Be concise, direct, and data-driven. No motivational fluff.

User: ${req.user.name}
Last 30 days discipline scores: ${scoreData.map(s => `${s.date}: ${s.score}%`).join(', ')}

Task performance:
${taskStats.map(t => `- ${t.name} (${t.category}): ${t.missed} missed, ${t.late} late out of ${t.total} logged`).join('\n')}

Provide exactly 3 insights in this JSON format:
{
  "insights": [
    { "type": "pattern", "text": "..." },
    { "type": "weakness", "text": "..." },
    { "type": "improvement", "text": "..." }
  ]
}

Keep each insight under 20 words. Be specific. Use the data.`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: [] };
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
