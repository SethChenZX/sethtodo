const getApiUrl = () => {
  const hostname = window.location.hostname;
  const isLocalNetwork = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.');

  if (isLocalNetwork) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  return 'https://dodo-todo-api.onrender.com/api';
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'エラーが発生しました');
    error.data = data;
    throw error;
  }
  return data;
};

export const fetchWithTimeout = async (url, options = {}, timeout = 60000) => {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timeout}ms`));
  }, timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError' && !err.message.includes('timeout')) {
      err.message = `Request timeout: ${url}`;
    }
    throw err;
  }
};



export const authApi = {
  sendOtp: async (email) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  verifyOtp: async (email, otp) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return handleResponse(response);
  },

  checkVerified: async (email) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/auth/check-verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return handleResponse(response);
  }
};

export const subscriptionApi = {
  createCheckoutSession: async (firebaseUid, email) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid, email })
    });
    return handleResponse(response);
  },

  createPortalSession: async (firebaseUid) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/stripe/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid })
    });
    return handleResponse(response);
  },

  getStatus: async (firebaseUid) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/stripe/subscription-status?firebaseUid=${firebaseUid}`);
    return handleResponse(response);
  },

  verifyPayment: async (sessionId, firebaseUid) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/stripe/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, firebaseUid })
    });
    return handleResponse(response);
  },

  syncSubscription: async (firebaseUid) => {
    const response = await fetchWithTimeout(`${getApiUrl()}/stripe/sync-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid })
    });
    return handleResponse(response);
  }
};

export { getApiUrl };
