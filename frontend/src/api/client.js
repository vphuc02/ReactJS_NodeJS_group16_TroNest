import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? 'http://localhost:3000' : ''),
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

let memoryToken = null;

export const setAuthToken = (token) => {
  memoryToken = token;
};

// Request interceptor: Gắn JWT token trong bộ nhớ vào Header Authorization nếu có
api.interceptors.request.use(
  (config) => {
    if (memoryToken) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Bắt mã lỗi 401 (hết hạn phiên)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      memoryToken = null;
      localStorage.removeItem('token');
      // Nếu hết phiên và không ở trang login, có thể dọn user cũ
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

