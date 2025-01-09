import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.APP_API_URL || 'http://gamenightmanager.com') + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = token;
      console.log('Request with token:', {
        url: config.url,
        method: config.method,
        authHeader: config.headers.Authorization
      });
    } else {
      console.log('Request without token:', {
        url: config.url,
        method: config.method
      });
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor with detailed logging
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = token;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/users/refresh-token', { refreshToken });

        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Add token verification function
export const verifyToken = async () => {
  try {
    const response = await api.get('/users/verify-token');
    return response.data.valid;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export default api;
