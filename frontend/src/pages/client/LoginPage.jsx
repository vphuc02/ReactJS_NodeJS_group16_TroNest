import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({
        email,
        password,
        rememberPassword
      });

      if (res.code === 200) {
        toast.success(res.message || 'Đăng nhập thành công!');
        login(res.token, res.user);

        if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'LANDLORD') {
          navigate('/landlord/dashboard');
        } else {
          navigate(redirectUrl);
        }
      } else {
        toast.error(res.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E6DFD3] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-2xl bg-[#A67C52] text-white flex items-center justify-center shadow-md">
              <i className="fa-solid fa-house-circle-check text-lg"></i>
            </span>
            <span className="text-2xl font-bold font-serif text-slate-900">TroNest</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif pt-2">
            Đăng Nhập Tài Khoản
          </h2>
          <p className="text-xs text-slate-500">
            Truy cập hệ thống tìm kiếm và quản lý phòng trọ chuẩn boutique
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@tronest.com"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#A67C52] hover:text-[#8C6239] transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none transition-all"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberPassword}
              onChange={(e) => setRememberPassword(e.target.checked)}
              className="w-4 h-4 rounded text-[#A67C52] accent-[#A67C52] cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] text-[11px] text-slate-600 space-y-1.5">
            <p className="font-bold text-[#A67C52] text-[11.5px]">💡 Tài khoản mẫu sẵn có (Bấm để điền nhanh):</p>
            <div className="flex justify-between items-center text-slate-700">
              <span>Khách: <strong className="font-mono">khachhang@tronest.com</strong></span>
              <button
                type="button"
                onClick={() => { setEmail('khachhang@tronest.com'); setPassword('123456'); }}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#E6DFD3] text-[#A67C52] hover:bg-[#F5EFE6] font-bold cursor-pointer shadow-2xs"
              >
                Điền
              </button>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Chủ trọ: <strong className="font-mono">chutro.viet@tronest.com</strong></span>
              <button
                type="button"
                onClick={() => { setEmail('chutro.viet@tronest.com'); setPassword('123456'); }}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#E6DFD3] text-[#A67C52] hover:bg-[#F5EFE6] font-bold cursor-pointer shadow-2xs"
              >
                Điền
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Mật khẩu chung: <strong className="text-slate-600 font-mono">123456</strong></p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#A67C52]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>

          {/* Google OAuth Login */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-100 w-full"></div>
            <span className="bg-white px-2.5 text-[10px] text-slate-400 font-bold uppercase">Hoặc</span>
          </div>

          <a
            href="http://localhost:3000/auth/google"
            className="w-full py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs no-underline"
          >
            <i className="fa-brands fa-google text-red-500 text-sm"></i>
            <span>Tiếp tục với Google</span>
          </a>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <div>
            Chưa có tài khoản TroNest?{' '}
            <Link to="/register" className="font-bold text-[#A67C52] hover:text-[#8C6239]">
              Đăng ký ngay
            </Link>
          </div>
          <div>
            Bạn là Quản trị viên?{' '}
            <Link to="/admin/login" className="font-bold text-slate-700 hover:text-slate-900 underline">
              Cổng Quản Trị Hệ Thống
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

