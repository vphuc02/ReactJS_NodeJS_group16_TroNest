import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { setAuthToken } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app mount, kiểm tra phiên đăng nhập với backend bằng httpOnly cookie bảo mật
  useEffect(() => {
    const initAuth = async () => {
      // Dọn dẹp token cũ trong localStorage nếu có từ trước để chống rủi ro XSS
      localStorage.removeItem('token');

      try {
        const res = await authApi.getMe();
        if (res.code === 200 && res.user) {
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch {
        // Phiên chưa đăng nhập hoặc cookie hết hạn
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setAuthToken(newToken);
    setUser(userData);
    localStorage.removeItem('token'); // Không lưu token trong localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async (callApi = true) => {
    if (callApi) {
      try {
        await authApi.logout();
      } catch {
        // Bỏ qua lỗi logout API nếu có
      }
    }
    setToken(null);
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Đã đăng xuất tài khoản!');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.code === 200 && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isCustomer: user?.role === 'CUSTOMER',
        isLandlord: user?.role === 'LANDLORD',
        isAdmin: user?.role === 'ADMIN',
        login: handleLogin,
        logout: handleLogout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

