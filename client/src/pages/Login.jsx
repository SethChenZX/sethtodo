import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { authApi } from '../utils/api';

const Login = () => {
  const { loginWithFirebase, loginWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const [step, setStep] = useState('credentials');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const otpInputs = useRef([]);

  useEffect(() => {
    if (user) {
      if (user.role === null || user.role === undefined) {
        navigate('/select-role');
      } else {
        navigate(user.role === 'super' ? '/admin' : '/');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLocalLoading(true);

    try {
      await authApi.sendOtp(email);
      setOtpSent(true);
      setStep('otp');
      setCountdown(60);
      setOtpError('');
    } catch (err) {
      setError(err.message || '確認コードの送信に失敗しました');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6 - index).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputs.current[nextIndex]?.focus();
      if (index + digits.length >= 6) {
        otpInputs.current[5]?.select();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    otpInputs.current[lastFilledIndex]?.focus();
    if (pastedData.length >= 6) {
      otpInputs.current[5]?.select();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setLocalLoading(true);

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setOtpError('6桁の確認コードを入力してください');
      setLocalLoading(false);
      return;
    }

    try {
      const result = await authApi.verifyOtp(email, otpCode);
      
      if (result.isVerified) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        await loginWithFirebase(userCredential.user);
      }
    } catch (err) {
      if (err.data) {
        setOtpError(err.data.error || '確認コードが正しくありません');
        if (err.data.remainingAttempts !== undefined) {
          setRemainingAttempts(err.data.remainingAttempts);
        }
        if (err.data.expired) {
          setOtp(['', '', '', '', '', '']);
          setStep('credentials');
          setOtpSent(false);
          setOtpError('');
          setError('確認コードの有効期限が切れました。再度お試しください。');
        }
      } else {
        setOtpError(err.message || '確認に失敗しました');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await loginWithFirebase(result.user);
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('ユーザーが見つかりません');
      } else if (err.code === 'auth/wrong-password') {
        setError('パスワードが正しくありません');
      } else if (err.code === 'auth/invalid-email') {
        setError('無効なメールアドレスです');
      } else if (err.code === 'auth/too-many-requests') {
        setError('試行回数が多すぎます。しばらく経ってから再度お試しください。');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('ログインに失敗しました');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上必要です');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    await handleSendOtp();
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLocalLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await loginWithGoogle(result.user);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Googleログインに失敗しました');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setError('');
    setRemainingAttempts(null);
  };

  const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    if (local.length <= 3) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.slice(0, 3)}***@${domain}`;
  };

  if (step === 'otp' && otpSent) {
    return (
      <div className="login-container">
        <button
          onClick={handleBackToCredentials}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: '#6b46c1',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← 戻る
        </button>

        <h2 style={{ marginBottom: '10px' }}>メールアドレスを確認</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          {maskEmail(email)} に確認コードを送信しました
        </p>

        <form onSubmit={handleVerifyOtp}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={7}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                autoFocus={index === 0}
                style={{
                  width: '48px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: `2px solid ${otpError ? '#dc2626' : '#ddd'}`,
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            ))}
          </div>

          {otpError && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>
              {otpError}
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <>（残り{remainingAttempts}回）</>
              )}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={localLoading}
            style={{ width: '100%', maxWidth: '300px', padding: '12px', fontSize: '16px' }}
          >
            {localLoading ? '確認中...' : '確認'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {countdown > 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>
              {countdown}秒後に再送信可能
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={localLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b46c1',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              確認コードを再送信
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Dodo Todo</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        タスク管理アプリ
      </p>

      <button
        onClick={handleGoogleLogin}
        disabled={localLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '300px',
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Googleでログイン
      </button>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '300px', 
        margin: '20px 0',
        color: '#666'
      }}>
        <div style={{ flex: 1, borderTop: '1px solid #ddd' }}></div>
        <span style={{ padding: '0 10px' }}>または</span>
        <div style={{ flex: 1, borderTop: '1px solid #ddd' }}></div>
      </div>

      <form onSubmit={isSignUp ? handleEmailSignupSubmit : handleEmailLogin} style={{ width: '100%', maxWidth: '300px' }}>
        {isSignUp && (
          <input
            type="text"
            placeholder="名前（任意）"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        )}
        
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        )}

        {error && (
          <p style={{ color: '#d9534f', fontSize: '14px', marginBottom: '10px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={localLoading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px'
          }}
        >
          {localLoading ? '処理中...' : (isSignUp ? '新規登録' : 'ログイン')}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        {isSignUp ? '既にアカウントをお持ちですか？' : '新規登録はこちら'}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#4a90d9',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginLeft: '5px'
          }}
        >
          {isSignUp ? 'ログイン' : '新規登録'}
        </button>
      </p>
    </div>
  );
};

export default Login;
