import api from './client';

export const roomApi = {
  getHomeData: async () => {
    const res = await api.get('/');
    return res.data;
  },

  getRooms: async (params = {}) => {
    const res = await api.get('/rooms', { params });
    return res.data;
  },

  getRoomDetail: async (id) => {
    const res = await api.get(`/rooms/detail/${id}`);
    return res.data;
  },

  getNearbyRooms: async (params) => {
    const res = await api.get('/api/geo/nearby', { params });
    return res.data;
  },

  getProvinces: async () => {
    const res = await api.get('/api/geo/provinces');
    return res.data;
  },

  getWards: async (code) => {
    const res = await api.get(`/api/geo/provinces/${encodeURIComponent(code)}/wards`);
    return res.data;
  }
};


