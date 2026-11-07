import api from './client';

export const profileApi = {
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },

  updateProfile: async (formData) => {
    const res = await api.post('/profile/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  changePassword: async (passwords) => {
    const res = await api.post('/profile/change-password', passwords);
    return res.data;
  },

  sendResetPasswordEmail: async () => {
    const res = await api.post('/profile/send-reset-password-email');
    return res.data;
  }
};
