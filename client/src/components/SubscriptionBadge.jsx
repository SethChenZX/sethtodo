import { useSubscription } from '../context/SubscriptionContext';

const SubscriptionBadge = ({ showLabel = true }) => {
  const { isPro } = useSubscription();

  if (!isPro) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      PRO
    </span>
  );
};

export default SubscriptionBadge;