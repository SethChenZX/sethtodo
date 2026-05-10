import { Router } from 'express';
import Todo from '../models/Todo.js';
import User from '../models/User.js';
import { sendWeeklySummaryEmail } from '../utils/email.js';

const router = Router();

const WEEKLY_SUMMARY_SECRET = process.env.WEEKLY_SUMMARY_SECRET || process.env.DAILY_SUMMARY_SECRET;

const verifySecret = (req, res, next) => {
  const { secret } = req.body;
  if (!WEEKLY_SUMMARY_SECRET) {
    console.error('WEEKLY_SUMMARY_SECRET is not configured');
    return res.status(500).json({ error: 'Weekly summary not configured' });
  }
  if (secret !== WEEKLY_SUMMARY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const getWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

const ITEM_LIMIT = 30;

router.post('/send', verifySecret, async (req, res) => {
  try {
    const { weekStart, weekEnd } = getWeekRange();

    const createdTodos = await Todo.find({
      isDeleted: false,
      createdAt: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'email name')
      .sort({ createdAt: 1 })
      .limit(ITEM_LIMIT);

    const delayedTodos = await Todo.find({
      isDeleted: false,
      status: 'delayed',
      delayedAt: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'email name')
      .sort({ delayedAt: 1 })
      .limit(ITEM_LIMIT);

    const overdueTodos = await Todo.find({
      isDeleted: false,
      status: 'overdue',
      updatedAt: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const completedTodos = await Todo.find({
      isDeleted: false,
      status: 'completed',
      updatedAt: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const abandonedTodos = await Todo.find({
      isDeleted: false,
      status: 'abandoned',
      updatedAt: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'email name')
      .sort({ updatedAt: 1 })
      .limit(ITEM_LIMIT);

    const pendingTodos = await Todo.find({
      isDeleted: false,
      status: 'pending'
    })
      .populate('userId', 'email name')
      .sort({ deadline: 1 })
      .limit(ITEM_LIMIT);

    const createdCount = createdTodos.length;
    const delayedCount = delayedTodos.length;
    const overdueCount = overdueTodos.length;
    const completedCount = completedTodos.length;
    const abandonedCount = abandonedTodos.length;
    const pendingCount = pendingTodos.length;

    const totalTracked = completedCount + overdueCount + delayedCount + abandonedCount;
    const completionRate = totalTracked > 0
      ? ((completedCount / totalTracked) * 100).toFixed(1)
      : '0.0';

    const todosData = {
      created: createdTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        deadline: t.deadline,
        status: t.status
      })),
      delayed: delayedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status,
        delayDays: t.delayDays || 0,
        newDeadline: t.deadline
      })),
      overdue: overdueTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status,
        deadline: t.deadline
      })),
      completed: completedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status
      })),
      abandoned: abandonedTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        oldStatus: t.previousStatus || 'pending',
        newStatus: t.status
      })),
      pending: pendingTodos.map(t => ({
        email: t.userId?.email || 'Unknown',
        name: t.userId?.name || '',
        title: t.title,
        description: t.description || '',
        deadline: t.deadline,
        status: t.status
      }))
    };

    const stats = {
      createdCount,
      delayedCount,
      overdueCount,
      completedCount,
      abandonedCount,
      pendingCount,
      completionRate,
      todosData,
      weekStart,
      weekEnd
    };

    console.log('Weekly summary stats:', {
      createdCount,
      delayedCount,
      overdueCount,
      completedCount,
      abandonedCount,
      pendingCount,
      completionRate
    });

    await sendWeeklySummaryEmail(stats);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
