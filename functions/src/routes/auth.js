import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

router.post('/verify', async (req, res) => {
  try {
    const { firebaseUid, email, role, name } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      const userName = name || email.split('@')[0];
      user = new User({ firebaseUid, email, name: userName, role: role || null });
      await user.save();
    } else if (name && name !== user.name) {
      user.name = name;
      await user.save();
    }

    res.json({ 
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const { uid } = req.query;
    const user = await User.findOne({ firebaseUid: uid });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/role', async (req, res) => {
  try {
    const { firebaseUid, role } = req.body;
    
    if (!firebaseUid || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['normal', 'super'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/name', async (req, res) => {
  try {
    const { firebaseUid, name } = req.body;
    
    if (!firebaseUid || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { name },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
