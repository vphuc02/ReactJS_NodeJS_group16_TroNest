import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@tronest.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng điền email và mật khẩu quản trị!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.adminLogin({ email, password });
      if (res.code === 200) {
        toast.success(res.message || 'Đăng nhập Quản trị viên thành công!');
        login(res.token, res.admin || { email, role: 'ADMIN', fullName: 'Quản trị viên' });
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      if (!err.response) {
        toast.error('Không thể kết nối đến máy chủ Backend (http://localhost:3000). Vui lòng đảm bảo bạn đang chạy "npm run dev"!');
      } else {
        toast.error(err.response.data?.message || 'Tài khoản Quản trị không chính xác!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/50 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto border border-slate-800 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-serif pt-1">
            Đăng Nhập Quản Trị
          </h2>
          <p className="text-xs text-slate-500">
            Cổng quản trị bảo mật dành riêng cho Ban Quản trị TroNest
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Quản trị viên
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tronest.com"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">(Tài khoản mặc định: admin@tronest.com / 123456)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Đang kiểm tra...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Truy Cập Cổng Quản Trị</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            ← Quay về trang chủ TroNest
          </Link>
        </div>

      </div>
    </div>
  );
};
