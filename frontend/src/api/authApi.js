import api from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/register', userData);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/forgot-password', { email });
    return res.data;
  },

  verifyOtp: async (email, otp) => {
    const res = await api.post('/forgot-password/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (payload) => {
    const res = await api.post('/forgot-password/reset-password', payload);
    return res.data;
  },

  resetPasswordFromLink: async (payload) => {
    const res = await api.post('/reset-password', payload);
    return res.data;
  },

  adminLogin: async (credentials) => {
    const res = await api.post('/admin/login', credentials);
    return res.data;
  }
};
