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
  }
};

