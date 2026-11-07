import api from './client';

export const favoriteApi = {
  getFavorites: async () => {
    const res = await api.get('/favorites');
    return res.data;
  },

  addFavorite: async (roomId) => {
    const res = await api.post(`/favorites/add/${roomId}`);
    return res.data;
  },

  removeFavorite: async (roomId) => {
    const res = await api.delete(`/favorites/remove/${roomId}`);
    return res.data;
  }
};

