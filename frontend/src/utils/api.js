import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.APP_API_URL || 'http://192.168.0.133:5000') + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    console.log('Request interceptor - Token:', token);
    if (token) {
      config.headers.Authorization = token;
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Response error status:', error.response?.status);
    console.log('Original request:', originalRequest);

    if (error.response.status === 401 && !originalRequest._retry &&
      originalRequest.url !== '/users/refresh-token') {
      console.log('Attempting token refresh...');
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('jwtToken');
        console.log('Current token for refresh:', token);
        const response = await api.post('/users/refresh-token');
        console.log('Refresh token response:', response.data);

        if (response.data.success) {
          console.log('New token received:', response.data.token);
          localStorage.setItem('jwtToken', response.data.token);
          // Update the original request with the new token
          originalRequest.headers.Authorization = response.data.token;
          // Retry the original request with the new token
          return api(originalRequest);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('jwtToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Verify token
export const verifyToken = async () => {
  try {
    await api.get('/users/verify-token');
    return true;
  } catch (error) {
    return false;
  }
};

export default api;
