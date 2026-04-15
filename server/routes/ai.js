import express from 'express';
import protect from '../middleware/auth.js';
import Groq from 'groq-sdk';
import TaskLog from '../models/TaskLog.js';
import Task from '../models/Task.js';
import { getLast30Days } from '../utils/dateHelpers.js';
import { calculateDayScore } from '../utils/scoreCalculator.js';

const router = express.Router();
router.use(protect);

router.post('/insights', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const last30 = getLast30Days();
    const tasks = await Task.find({ user: req.user._id, isActive: true });
    const logs = await TaskLog.find({
      user: req.user._id,
      date: { $gte: last30[0], $lte: last30[last30.length - 1] },
    });

    const dailyScores = await Promise.all(
      last30.map(d => calculateDayScore(req.user._id, d))
    );
    const scoreData = last30.map((date, i) => ({
      date,
      score: dailyScores[i].score,
    }));

    const taskStats = tasks.map(t => {
      const taskLogs = logs.filter(
        l => l.task.toString() === t._id.toString()
      );
      const missed = taskLogs.filter(l => l.status === 'missed').length;
      const late = taskLogs.filter(l => l.status === 'late').length;
      const completed = taskLogs.filter(l => l.status === 'completed').length;
      return {
        name: t.name,
        category: t.category,
        missed,
        late,
        completed,
        total: taskLogs.length,
      };
    });

    const recentScores = scoreData.slice(-14).map(s => `${s.date}:${s.score}%`).join(', ');
    const taskSummary = taskStats
      .map(t => `${t.name}: ${t.completed} done, ${t.late} late, ${t.missed} missed`)
      .join('\n');

    const prompt = `Analyze this habit tracking data and return ONLY valid JSON, no markdown, no explanation.

Recent scores (last 14 days): ${recentScores}

Tasks:
${taskSummary}

Return exactly this JSON structure:
{"insights":[{"type":"pattern","text":"one sentence observation about patterns"},{"type":"weakness","text":"one sentence about the biggest weakness"},{"type":"improvement","text":"one sentence about what is improving"}]}`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    // Strip any markdown fences
    const clean = raw.replace(/```json|```/gi, '').trim();
    // Extract JSON object
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ insights: [{ type: 'pattern', text: 'Keep logging data for better insights.' }] });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('AI route error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;