import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.0.133:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = token;
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

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.post('http://192.168.0.133:5000/api/users/refresh-token', { token });

        if (response.data.success) {
          localStorage.setItem('jwtToken', response.data.token);
          originalRequest.headers.Authorization = response.data.token;
          return api(originalRequest);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }

    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Handle common error cases
//     if (error.response?.status === 404) {
//       console.error('Resource not found');
//     } else if (error.response?.status === 500) {
//       console.error('Server error');
//     }
//     return Promise.reject(error);
//   }
// );

// api.interceptors.request.use(
//   (config) => {
//     // Could dispatch a loading state action here
//     return config;
//   }
// );

// api.interceptors.response.use(
//   (response) => {
//     // Could dispatch an action to clear loading state
//     return response;
//   }
// );

export default api;
