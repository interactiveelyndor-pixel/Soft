import axios from 'axios';

let API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// If it's a hostname from Render (no protocol), prepend https://
if (API_URL && !API_URL.startsWith('http')) {
  API_URL = `https://${API_URL}`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('elyndor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('elyndor_token');
      localStorage.removeItem('elyndor_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
