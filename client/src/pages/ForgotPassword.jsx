import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      navigate('/login');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>パスワードリセット</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        登録したメールアドレスを入力してください。
        <br />
        パスワードリセット用のメールを送信します。
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
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

        {error && (
          <p style={{ color: '#d9534f', fontSize: '14px', marginBottom: '10px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px'
          }}
        >
          {loading ? '送信中...' : 'パスワードを送信'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <Link to="/login" style={{ color: '#4a90d9' }}>ログイン画面に戻る</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;