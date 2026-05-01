import axios from 'axios';

let API_URL = import.meta.env.VITE_API_BASE_URL;

// Fallback to current origin if we are in production and VITE_API_BASE_URL is missing
if (!API_URL && !import.meta.env.DEV) {
  API_URL = window.location.origin.replace('frontend', 'backend').replace('soft', 'soft-backend');
}

// Default fallback
if (!API_URL) {
  API_URL = 'http://localhost:8000';
}

// Clean up Render subdomains if they come in partially
if (API_URL && !API_URL.includes('localhost') && !API_URL.includes('onrender.com')) {
  API_URL = `${API_URL}.onrender.com`;
}

// Prepend protocol if missing
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
      // Don't redirect on login/register failures, let the components handle the error
      const isAuthEndpoint = error.config.url === '/auth/login' || error.config.url === '/auth/register';
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('elyndor_token');
        localStorage.removeItem('elyndor_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
