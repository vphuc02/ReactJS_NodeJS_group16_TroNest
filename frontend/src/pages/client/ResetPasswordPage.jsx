import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import { Lock, KeyRound } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error('Liên kết đặt lại mật khẩu không hợp lệ!');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPasswordFromLink({
        token,
        email,
        password,
        confirmPassword
      });

      if (res.code === 200) {
        toast.success(res.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Liên kết đổi mật khẩu đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">Liên kết không hợp lệ</h2>
          <p className="text-xs text-slate-500">Mã token hoặc email trong liên kết bị thiếu hoặc không chính xác.</p>
          <Link to="/login" className="inline-block px-5 py-2 rounded-full bg-[#A67C52] text-white text-xs font-bold">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E6DFD3] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">
            Đặt Lại Mật Khẩu
          </h2>
          <p className="text-xs text-slate-500">
            Khôi phục quyền truy cập cho tài khoản <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                minLength={6}
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : 'Đổi Mật Khẩu Mới'}
          </button>
        </form>
      </div>
    </div>
  );
};
