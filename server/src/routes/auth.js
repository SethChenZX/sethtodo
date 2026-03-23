import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

router.post('/verify', async (req, res) => {
  try {
    const { firebaseUid, email, role } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      user = new User({ firebaseUid, email, role: role || 'normal' });
      await user.save();
    }

    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const { firebaseUid } = req.query;
    const user = await User.findOne({ firebaseUid });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/role', async (req, res) => {
  try {
    const { firebaseUid, role } = req.body;
    
    if (!firebaseUid || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
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
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
