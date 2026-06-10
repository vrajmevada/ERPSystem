import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('[Axios Request] Token from localStorage:', token);

  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      if (parsedToken) {
        config.headers.Authorization = `Bearer ${parsedToken}`;
        console.log('[Axios Request] Auth header set successfully (parsed)');
      }
    } catch {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Request] Auth header set (raw)');
    }
  } else {
    console.warn('[Axios Request] No token found in localStorage!');
  }

  console.log('[Axios Request] Final Authorization Header:', config.headers.Authorization);
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Axios Response] Error intercepted:', error.response?.status, error.message);
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      const basename = import.meta.env.VITE_APP_BASE_NAME || '';
      window.location.href = `${basename}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;