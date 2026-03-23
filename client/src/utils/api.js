export const getApiUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/sethtodo-a6ea4/us-central1/api';
  }
  
  return '/api';
};
