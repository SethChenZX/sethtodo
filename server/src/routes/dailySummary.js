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

const getTodayRange = () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { todayStart, todayEnd };
};

const ITEM_LIMIT = 15;

router.post('/send', verifySecret, async (req, res) => {
  try {
    const { todayStart, todayEnd } = getTodayRange();
    const now = new Date();

    const createdTodos = await Todo.find({
      isDeleted: false,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('userId', 'email name')
      .sort({ createdAt: 1 })
      .limit(ITEM_LIMIT);

    const delayedTodos = await Todo.find({
      isDeleted: false,
      status: 'delayed',
      delayedAt: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('userId', 'email name')
      .sort({ delayedAt: 1 })
      .limit(ITEM_LIMIT);

    const overdueTodos = await Todo.find({
      isDeleted: false,
      status: 'overdue',
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const completedTodos = await Todo.find({
      isDeleted: false,
      status: 'completed',
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const abandonedTodos = await Todo.find({
      isDeleted: false,
      status: 'abandoned',
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const createdCount = createdTodos.length;
    const delayedCount = delayedTodos.length;
    const overdueCount = overdueTodos.length;
    const completedCount = completedTodos.length;
    const abandonedCount = abandonedTodos.length;

    const totalTracked = completedCount + overdueCount + delayedCount + abandonedCount;
    const completionRate = totalTracked > 0
      ? ((completedCount / totalTracked) * 100).toFixed(1)
      : '0.0';

    const todosData = {
      created: createdTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        title: t.title,
        description: t.description || '',
        deadline: t.deadline,
        status: t.status
      })),
      delayed: delayedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status,
        delayDays: t.delayDays || 0,
        newDeadline: t.deadline
      })),
      overdue: overdueTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status,
        deadline: t.deadline
      })),
      completed: completedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status
      })),
      abandoned: abandonedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status
      }))
    };

    const stats = {
      createdCount,
      delayedCount,
      overdueCount,
      completedCount,
      abandonedCount,
      completionRate,
      todosData
    };

    console.log('Daily summary stats:', {
      createdCount,
      delayedCount,
      overdueCount,
      completedCount,
      abandonedCount,
      completionRate
    });

    await sendDailySummaryEmail(stats);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;