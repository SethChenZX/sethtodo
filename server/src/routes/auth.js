import { Router } from 'express';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import { sendOtpEmail } from '../utils/email.js';

const router = Router();

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'メールアドレスが必要です' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '無効なメールアドレス形式です' });
    }

    await Verification.deleteMany({ email: email.toLowerCase() });

    const otp = otpGenerator.generate(6, { 
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false, 
      specialChars: false 
    });

    const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 5;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    const verification = new Verification({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      attempts: 0,
      verified: false
    });
    await verification.save();

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: '確認コードをメールに送信しました',
      expiresIn: expiresMinutes * 60
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'メール送信に失敗しました' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: 'メールアドレスと確認コードが必要です',
        isVerified: false
      });
    }

    const verification = await Verification.findOne({
      email: email.toLowerCase(),
      verified: false
    }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(400).json({
        error: '確認コードが無効です。再度送信してください。',
        isVerified: false,
        remainingAttempts: 0
      });
    }

    if (verification.verified) {
      return res.status(400).json({
        error: 'この確認コードは既に検証済みです',
        isVerified: false
      });
    }

    if (verification.isExpired()) {
      await Verification.deleteOne({ _id: verification._id });
      return res.status(400).json({
        error: '確認コードの有効期限が切れました。再度送信してください。',
        isVerified: false,
        expired: true
      });
    }

    if (verification.attempts >= 5) {
      await Verification.deleteOne({ _id: verification._id });
      return res.status(400).json({
        error: '入力回数が上限に達しました。再度送信してください。',
        isVerified: false
      });
    }

    verification.attempts += 1;
    await verification.save();

    if (verification.otp !== otp) {
      const remainingAttempts = 5 - verification.attempts;
      if (remainingAttempts <= 0) {
        await Verification.deleteOne({ _id: verification._id });
        return res.status(400).json({
          error: '入力回数が上限に達しました。再度送信してください。',
          isVerified: false
        });
      }
      return res.status(400).json({
        error: `確認コードが正しくありません（残り${remainingAttempts}回）`,
        isVerified: false,
        remainingAttempts
      });
    }

    verification.verified = true;
    await verification.save();

    res.json({
      success: true,
      isVerified: true,
      message: 'メールアドレスの確認が完了しました'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: '確認処理中にエラーが発生しました', isVerified: false });
  }
});

router.post('/check-verified', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'メールアドレスが必要です' });
    }

    const verification = await Verification.findOne({
      email: email.toLowerCase(),
      verified: true
    }).sort({ createdAt: -1 });

    res.json({
      isVerified: !!verification
    });
  } catch (error) {
    console.error('Check verified error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { firebaseUid, email, role } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      user = new User({ firebaseUid, email, role: null });
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
