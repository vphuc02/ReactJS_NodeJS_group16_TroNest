// frontend/src/utils/avatar.js

const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const resolveAvatar = (avatar) => {
  if (!avatar || avatar.includes('avatar.jpg')) {
    return '/admin/assets/images/avatar.jpg';
  }
  if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/uploads/')) {
    return API_BASE ? `${API_BASE}${avatar}` : avatar;
  }
  return avatar;
};

export const handleAvatarError = (e) => {
  e.currentTarget.onerror = null; // Ngăn chặn tuyệt đối vòng lặp vô hạn gây nhấp nháy giao diện
  e.currentTarget.src = '/admin/assets/images/avatar.jpg';
};

export const handleRoomImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = '/client/assets/images/product-1.jpg';
};

