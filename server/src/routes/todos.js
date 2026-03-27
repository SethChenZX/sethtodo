import { Router } from 'express';
import { verifyToken } from '../middleware/firebase.js';
import Todo from '../models/Todo.js';
import User from '../models/User.js';
import { sendTodoCreatedNotification } from '../utils/email.js';

const router = Router();

router.use(verifyToken);

const checkAndRestoreDelays = async (todos) => {
  const now = new Date();
  const updatedTodos = [];
  
  for (const todo of todos) {
    if (todo.status === 'delayed' && todo.delayedAt && todo.delayDays) {
      const delayedUntil = new Date(todo.delayedAt);
      delayedUntil.setDate(delayedUntil.getDate() + todo.delayDays);
      
      if (now >= delayedUntil) {
        todo.status = 'pending';
        todo.delayDays = null;
        todo.delayedAt = null;
        await todo.save();
        updatedTodos.push(todo);
      }
    }
  }
  return updatedTodos;
};

const checkAndMarkOverdue = async (todos) => {
  const now = new Date();
  const overdueTodos = [];
  
  for (const todo of todos) {
    if (todo.status === 'pending' && todo.deadline && !todo.isDeleted) {
      const deadline = new Date(todo.deadline);
      if (now > deadline) {
        todo.status = 'overdue';
        await todo.save();
        overdueTodos.push(todo);
      }
    }
  }
  return overdueTodos;
};

router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const todos = await Todo.find({ userId: user._id, isDeleted: false }).sort({ createdAt: -1 });
    await checkAndRestoreDelays(todos);
    await checkAndMarkOverdue(todos);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const todo = new Todo({
      userId: user._id,
      title: req.body.title,
      description: req.body.description,
      status: 'pending',
      deadline: today
    });

    await todo.save();

    const superUsers = await User.find({ role: 'super' });
    const creatorName = user.name || user.email || 'Unknown User';
    await sendTodoCreatedNotification(superUsers, todo, creatorName).catch(err => {
      console.error('Failed to send todo creation notification:', err);
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const todo = await Todo.findOne({ _id: req.params.id, userId: user._id, isDeleted: false });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    const { title, description, status, completedAt, delayDays } = req.body;
    if (title) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status) {
      todo.status = status;
      if (status === 'delayed' && delayDays) {
        todo.delayDays = delayDays;
        todo.delayedAt = new Date();
      } else if (status !== 'delayed') {
        todo.delayDays = null;
        todo.delayedAt = null;
      }
    }
    if (completedAt !== undefined) todo.completedAt = completedAt ? new Date(completedAt) : undefined;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  res.status(403).json({ error: 'Delete not allowed for normal users' });
});

export default router;
