import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const Subscription = () => {
  const { user } = useAuth();
  const { subscription, isPro, fetchSubscriptionStatus, openBillingPortal } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    
    const loadSubscription = async () => {
      try {
        await fetchSubscriptionStatus();
      } catch (e) {
        console.error('Failed to fetch subscription:', e);
      }
      if (!cancelled) {
        setShowContent(true);
      }
    };
    
    loadSubscription();
    
    timer = setTimeout(() => {
      if (!cancelled) {
        setShowContent(true);
      }
    }, 5000);
    
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true' || canceled === 'true') {
      setShowContent(true);
      if (canceled === 'true') {
        alert('サブスクリプションの作成がキャンセルされました。');
      } else if (success === 'true') {
        alert('サブスクリプションが正常に開始されました！');
      }
      navigate('/subscription', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleDashboardReturn = () => {
    setShowContent(true);
    navigate('/');
  };

  const handleManageBilling = async () => {
    setProcessing(true);
    try {
      const url = await openBillingPortal();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      alert('請求管理の開始に失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'アクティブ',
      past_due: '支払い遅延',
      canceled: 'キャンセル済み',
      trialing: '試用中',
      incomplete: '未完了'
    };
    return labels[status] || status || '-';
  };

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      past_due: 'status-past-due',
      canceled: 'status-canceled'
    };
    return classes[status] || '';
  };

  return (
    <div className="app">
      <div className="subscription-container">
        <div className="subscription-header">
          <h1>サブスクリプション</h1>
          <button className="btn btn-secondary" onClick={handleDashboardReturn}>
            ダッシュボードに戻る
          </button>
        </div>

        {!showContent && <div className="loading">読み込み中...</div>}

        {showContent && (
          <div className="subscription-content">
            {isPro ? (
              <div className="subscription-card pro">
                <div className="plan-info">
                  <span className="plan-badge">Pro</span>
                  <h2>Proプラン</h2>
                </div>

                <div className="subscription-details">
                  <div className="detail-row">
                    <span className="detail-label">ステータス</span>
                    <span className={`detail-value ${getStatusClass(subscription.subscriptionStatus)}`}>
                      {getStatusLabel(subscription.subscriptionStatus)}
                    </span>
                  </div>

                  {subscription.subscriptionCurrentPeriodEnd && (
                    <div className="detail-row">
                      <span className="detail-label">次回請求日</span>
                      <span className="detail-value">
                        {formatDate(subscription.subscriptionCurrentPeriodEnd)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="subscription-features">
                  <h3>Proプランの特典</h3>
                  <ul>
                    <li>Todoの削除機能</li>
                    <li>優先サポート</li>
                    <li>月間サマリーメール</li>
                  </ul>
                </div>

                <div className="subscription-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleManageBilling}
                    disabled={processing}
                  >
                    {processing ? '処理中...' : '請求情報を管理'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="subscription-card free">
                <div className="plan-info">
                  <h2>Freeプラン</h2>
                </div>

                <div className="subscription-details">
                  <p className="free-desc">
                    Proプランにアップグレードして、すべてのプレミアム機能をお楽しみください。
                  </p>
                </div>

                <div className="subscription-features">
                  <h3>Proプランの特典</h3>
                  <ul>
                    <li>Todoの削除機能</li>
                    <li>優先サポート</li>
                    <li>月間サマリーメール</li>
                  </ul>
                </div>

                <div className="subscription-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/pricing')}
                  >
                    プランを比較する
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .subscription-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .subscription-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .subscription-header h1 {
          color: #333;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .subscription-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .subscription-card.pro {
          border: 2px solid #4a90d9;
        }
        .plan-info {
          text-align: center;
          margin-bottom: 25px;
        }
        .plan-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .plan-info h2 {
          color: #333;
          margin: 0;
        }
        .subscription-details {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
          font-size: 14px;
        }
        .detail-value {
          font-weight: 500;
          color: #333;
        }
        .status-active {
          color: #388e3c;
        }
        .status-past-due {
          color: #d32f2f;
        }
        .status-canceled {
          color: #888;
        }
        .subscription-features {
          margin-bottom: 25px;
        }
        .subscription-features h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
        }
        .subscription-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .subscription-features li {
          padding: 8px 0;
          color: #555;
          font-size: 14px;
          padding-left: 20px;
          position: relative;
        }
        .subscription-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4a90d9;
        }
        .subscription-actions {
          text-align: center;
        }
        .free-desc {
          color: #666;
          text-align: center;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default Subscription;