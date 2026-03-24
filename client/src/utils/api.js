const getApiUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  
  return import.meta.env.VITE_API_URL || 'https://dodo-todo-api.onrender.com/api';
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

export const authApi = {
  sendOtp: async (email) => {
    const response = await fetch(`${getApiUrl()}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  verifyOtp: async (email, otp) => {
    const response = await fetch(`${getApiUrl()}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return handleResponse(response);
  },

  checkVerified: async (email) => {
    const response = await fetch(`${getApiUrl()}/auth/check-verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  }
};

export { getApiUrl };
