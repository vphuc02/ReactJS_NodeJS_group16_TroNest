import api from './client';

export const landlordApi = {
  getDashboard: async () => {
    const res = await api.get('/landlord/dashboard');
    return res.data;
  },

  getRooms: async (params = {}) => {
    const res = await api.get('/landlord/rooms', { params });
    return res.data;
  },

  getCreateData: async () => {
    const res = await api.get('/landlord/rooms/create');
    return res.data;
  },

  createRoom: async (payload) => {
    const res = await api.post('/landlord/rooms/create', payload);
    return res.data;
  },

  getEditData: async (id) => {
    const res = await api.get(`/landlord/rooms/edit/${id}`);
    return res.data;
  },

  updateRoom: async (id, payload) => {
    const res = await api.post(`/landlord/rooms/edit/${id}`, payload);
    return res.data;
  },

  changeStatus: async (id, status) => {
    const res = await api.patch(`/landlord/rooms/status/${id}`, { status });
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/landlord/rooms/delete/${id}`);
    return res.data;
  },

  uploadImages: async (formData) => {
    const res = await api.post('/landlord/rooms/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

