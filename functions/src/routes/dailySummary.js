import { Router } from 'express';
import Todo from '../models/Todo.js';
import { sendDailySummaryEmail } from '../utils/email.js';

const router = Router();

const DAILY_SUMMARY_SECRET = process.env.DAILY_SUMMARY_SECRET;

const verifySecret = (req, res, next) => {
  const { secret } = req.body;
  if (!DAILY_SUMMARY_SECRET) {
    console.error('DAILY_SUMMARY_SECRET is not configured');
    return res.status(500).json({ error: 'Daily summary not configured' });
  }
  if (secret !== DAILY_SUMMARY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const getYesterdayRange = () => {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  return { yesterdayStart: yesterday, yesterdayEnd: yesterdayEnd };
};

router.post('/send', verifySecret, async (req, res) => {
  try {
    const { yesterdayStart, yesterdayEnd } = getYesterdayRange();

    const allTodos = await Todo.find({ isDeleted: false });

    let createdCount = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let delayedCount = 0;
    let abandonedCount = 0;

    for (const todo of allTodos) {
      const createdAt = new Date(todo.createdAt);
      const updatedAt = new Date(todo.updatedAt);

      if (createdAt >= yesterdayStart && createdAt <= yesterdayEnd) {
        createdCount++;
      }

      if (updatedAt >= yesterdayStart && updatedAt <= yesterdayEnd) {
        if (todo.status === 'completed') {
          completedCount++;
        } else if (todo.status === 'overdue') {
          overdueCount++;
        } else if (todo.status === 'delayed') {
          delayedCount++;
        } else if (todo.status === 'abandoned') {
          abandonedCount++;
        }
      }
    }

    const totalTracked = completedCount + overdueCount + delayedCount + abandonedCount;
    const completionRate = totalTracked > 0 
      ? ((completedCount / totalTracked) * 100).toFixed(1) 
      : '0.0';

    const stats = {
      createdCount,
      completedCount,
      overdueCount,
      delayedCount,
      abandonedCount,
      completionRate
    };

    console.log('Daily summary stats:', stats);

    await sendDailySummaryEmail(stats);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;