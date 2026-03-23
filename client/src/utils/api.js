export const getApiUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  
  return import.meta.env.VITE_API_URL || 'https://dodo-todo-api.onrender.com/api';
};
