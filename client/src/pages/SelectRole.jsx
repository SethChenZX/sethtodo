import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SelectRole = () => {
  const { user, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = async (role) => {
    setLoading(true);
    setError('');

    try {
      const success = await updateUserRole(role);
      if (success) {
        navigate(role === 'super' ? '/admin' : '/');
      } else {
        setError('役割の選択に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>役割を選択してください</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
        {user?.email} でログイン中
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '400px' }}>
        <button
          onClick={() => handleSelectRole('normal')}
          disabled={loading}
          style={{
            padding: '20px',
            backgroundColor: '#e3f2fd',
            border: '2px solid #1976d2',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            opacity: loading ? 0.6 : 1
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
            通常ユーザー (Normal)
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            自分のTodoを作成・管理できます
          </p>
        </button>

        <button
          onClick={() => handleSelectRole('super')}
          disabled={loading}
          style={{
            padding: '20px',
            backgroundColor: '#fff3e0',
            border: '2px solid #f57c00',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            opacity: loading ? 0.6 : 1
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>
            管理者 (Super)
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            全ユーザーのTodoを管理できます
          </p>
        </button>
      </div>

      {error && (
        <p style={{ color: '#d9534f', marginTop: '20px' }}>
          {error}
        </p>
      )}

      {loading && (
        <p style={{ color: '#666', marginTop: '20px' }}>
          処理中...
        </p>
      )}
    </div>
  );
};

export default SelectRole;
