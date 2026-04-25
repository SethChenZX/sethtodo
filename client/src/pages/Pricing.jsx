import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const Pricing = () => {
  const { user } = useAuth();
  const { isPro, loading, startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      const url = await startCheckout();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      alert('サブスクリプションの開始に失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (isPro) {
    return (
      <div className="app">
        <div className="pricing-container">
          <div className="pricing-header">
            <h1>料金プラン</h1>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              ダッシュボードに戻る
            </button>
          </div>
          <div className="current-plan">
            <div className="current-plan-badge">現在のプラン</div>
            <h2>Proプラン</h2>
            <p className="current-plan-desc">
              すべてのプレミアム機能を利用中です
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/subscription')}>
              サブスクリプション管理
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>料金プラン</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ダッシュボードに戻る
          </button>
        </div>

        <div className="pricing-plans">
          <div className="pricing-card free">
            <h3>Freeプラン</h3>
            <div className="price">¥0<span>/月</span></div>
            <ul className="features">
              <li>Todo作成・編集・完了</li>
              <li>期限管理</li>
              <li>Basic通知</li>
            </ul>
            <button className="btn btn-secondary" disabled>
              現在利用中
            </button>
          </div>

          <div className="pricing-card pro">
            <div className="popular-badge">おすすめ</div>
            <h3>Proプラン</h3>
            <div className="price">¥980<span>/月</span></div>
            <ul className="features">
              <li>Todoの削除機能</li>
              <li>すべてのFreeプラン機能</li>
              <li>優先サポート</li>
              <li>月間サマリーメール</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={handleSubscribe}
              disabled={processing || loading}
            >
              {processing ? '処理中...' : 'Proプランにアップグレード'}
            </button>
          </div>
        </div>

        <div className="pricing-note">
          <p>※ サブスクリプションはStripeによって安全に処理されます</p>
          <p>※ 月間980円で、すべてのプレミアム機能がご利用可能です</p>
        </div>
      </div>

      <style>{`
        .pricing-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .pricing-header h1 {
          color: #333;
        }
        .pricing-plans {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .pricing-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
          text-align: center;
        }
        .pricing-card.pro {
          border: 2px solid #4a90d9;
        }
        .pricing-card h3 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #333;
        }
        .price {
          font-size: 36px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        .price span {
          font-size: 16px;
          font-weight: normal;
          color: #666;
        }
        .features {
          list-style: none;
          padding: 0;
          margin: 0 0 25px 0;
          text-align: left;
        }
        .features li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 14px;
        }
        .features li:last-child {
          border-bottom: none;
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #4a90d9;
          color: white;
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .current-plan {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .current-plan-badge {
          display: inline-block;
          background: #e8f5e9;
          color: #388e3c;
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .current-plan h2 {
          color: #333;
          margin-bottom: 10px;
        }
        .current-plan-desc {
          color: #666;
          margin-bottom: 25px;
        }
        .pricing-note {
          margin-top: 40px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        .pricing-note p {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default Pricing;