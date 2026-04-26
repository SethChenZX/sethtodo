import { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionApi } from '../utils/api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState({
    isPro: false,
    subscriptionStatus: null,
    subscriptionPlan: null,
    subscriptionCurrentPeriodEnd: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionStatusRef = async () => {
    if (!user) {
      return;
    }

    try {
      const status = await subscriptionApi.getStatus(user.uid);
      setSubscription({
        isPro: status.isPro,
        subscriptionStatus: status.subscriptionStatus,
        subscriptionPlan: status.subscriptionPlan,
        subscriptionCurrentPeriodEnd: status.subscriptionCurrentPeriodEnd
      });
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    }
  };

  const fetchSubscriptionStatus = async () => {
    await fetchSubscriptionStatusRef();
  };

  const startCheckout = async () => {
    if (!user) return null;

    try {
      const { url } = await subscriptionApi.createCheckoutSession(user.uid, user.email);
      return url;
    } catch (err) {
      console.error('Error starting checkout:', err);
      setError(err.message);
      throw err;
    }
  };

  const openBillingPortal = async () => {
    if (!user) return null;

    try {
      const { url } = await subscriptionApi.createPortalSession(user.uid);
      return url;
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      error,
      isPro: subscription.isPro,
      fetchSubscriptionStatus,
      startCheckout,
      openBillingPortal
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);