import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCodeFromUrl = searchParams.get('oobCode') || '';
  const [oobCode, setOobCode] = useState(oobCodeFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://dodo-todo-api.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oobCode) {
      setError('リセットコードが無効です');
      return;
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }

      if (response.ok) {
        navigate('/login');
      } else {
        throw new Error(data.error || 'エラーが発生しました');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>新しいパスワードを設定</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Firebaseから届いたメールに記載された
        <br />
        リセットコードを貼り付けてください。
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
        <input
          type="text"
          placeholder="リセットコード（必須）"
          value={oobCode}
          onChange={(e) => setOobCode(e.target.value)}
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
          placeholder="新しいパスワード（8文字以上）"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
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
          placeholder="新しいパスワード（確認）"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
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
          {loading ? '処理中...' : 'パスワードを変更'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <Link to="/login" style={{ color: '#4a90d9' }}>ログイン画面に戻る</Link>
      </p>
    </div>
  );
};

export default ResetPassword;