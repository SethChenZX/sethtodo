import { Router } from 'express';
import { verifyToken } from '../middleware/firebase.js';
import Todo from '../models/Todo.js';
import User from '../models/User.js';

const router = Router();

router.use(verifyToken);

router.get('/todos', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user || user.role !== 'super') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const todos = await Todo.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });

    const now = new Date();
    for (const todo of todos) {
      if (!todo.isDeleted && todo.status === 'delayed' && todo.delayedAt && todo.delayDays) {
        const delayedUntil = new Date(todo.delayedAt);
        delayedUntil.setDate(delayedUntil.getDate() + todo.delayDays);
        if (now >= delayedUntil) {
          todo.status = 'pending';
          todo.delayDays = null;
          todo.delayedAt = null;
          await todo.save();
        }
      }
      if (!todo.isDeleted && todo.status === 'pending' && todo.deadline) {
        const deadline = new Date(todo.deadline);
        if (now > deadline) {
          todo.status = 'overdue';
          await todo.save();
        }
      }
    }
    
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user || user.role !== 'super') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted', todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/restore', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user || user.role !== 'super') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo restored', todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user || user.role !== 'super') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
