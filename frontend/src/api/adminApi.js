import api from './client';

export const adminApi = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getRooms: async (params = {}) => {
    const res = await api.get('/admin/rooms', { params });
    return res.data;
  },

  getRoomDetail: async (id) => {
    const res = await api.get(`/admin/rooms/detail/${id}`);
    return res.data;
  },

  approveRoom: async (id) => {
    const res = await api.post(`/admin/rooms/approve/${id}`);
    return res.data;
  },

  rejectRoom: async (id, reason) => {
    const res = await api.post(`/admin/rooms/reject/${id}`, { reason });
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/admin/rooms/delete/${id}`);
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserBlock: async (id, isBlocked) => {
    const res = await api.patch(`/admin/users/status/${id}`, { isBlocked });
    return res.data;
  },

  getLandlords: async (params = {}) => {
    const res = await api.get('/admin/landlords', { params });
    return res.data;
  },

  approveLandlord: async (id) => {
    const res = await api.post(`/admin/landlords/approve/${id}`);
    return res.data;
  },

  rejectLandlord: async (id, reason) => {
    const res = await api.post(`/admin/landlords/reject/${id}`, { reason });
    return res.data;
  },

  getCategories: async (params = {}) => {
    const res = await api.get('/admin/categories', { params });
    return res.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/admin/categories/create', data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/delete/${id}`);
    return res.data;
  }
};

