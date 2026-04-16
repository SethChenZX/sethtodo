import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

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

  useEffect(() => {
    if (user) {
      if (user.role === null || user.role === undefined) {
        navigate('/select-role');
      } else {
        navigate(user.role === 'super' ? '/admin' : '/');
      }
    }
  }, [user, navigate]);

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

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setLocalLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上必要です');
      setLocalLoading(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await loginWithFirebase(result.user, displayName);
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています');
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('登録に失敗しました');
      }
    } finally {
      setLocalLoading(false);
    }
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

      <form onSubmit={isSignUp ? handleEmailSignup : handleEmailLogin} style={{ width: '100%', maxWidth: '300px' }}>
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

        {!isSignUp && (
          <p style={{ marginTop: '5px', marginBottom: '10px', fontSize: '14px', textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: '#4a90d9' }}>パスワードを忘れた場合</Link>
          </p>
        )}

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