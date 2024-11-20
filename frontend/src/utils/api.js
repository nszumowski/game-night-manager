import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.APP_API_URL || 'http://localhost:5000') + '/api',
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
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized response - clearing token');
      localStorage.removeItem('jwtToken');
      delete api.defaults.headers.common['Authorization'];
    }
    console.log('Response error status:', error.response?.status);
    console.log('Original request:', error.config);
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
