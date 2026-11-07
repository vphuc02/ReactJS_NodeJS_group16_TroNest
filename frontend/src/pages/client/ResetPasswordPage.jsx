import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Đường dẫn đặt lại mật khẩu không hợp lệ!');
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
        toast.success(res.message || 'Đặt lại mật khẩu thành công!');
        navigate('/login');
      } else {
        toast.error(res.message || 'Không thể đặt lại mật khẩu!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đường dẫn đã hết hạn hoặc không hợp lệ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-inline-01">
      <div className="page-account auth-inline-02">
        <div className="form-account auth-inline-03">
          
          {/* Logo */}
          <div className="inner-logo auth-inline-04">
            <Link to="/" className="auth-inline-05">
              <i className="fa-solid fa-house-circle-check auth-inline-06"></i>
              <span>TroNest</span>
            </Link>
          </div>

          <h2 className="inner-title auth-inline-07">Đặt lại mật khẩu</h2>
          <p className="inner-desc auth-inline-08">
            Thiết lập mật khẩu mới an toàn cho tài khoản của bạn
          </p>

          {!token ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
                <span>Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token!</span>
              </div>
              <Link to="/forgot-password" className="auth-inline-19 block">
                Yêu cầu gửi lại liên kết mới
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="inner-group auth-inline-09">
                <label className="auth-inline-10">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minLength={6}
                  className="auth-inline-11"
                />
              </div>

              <div className="inner-group auth-inline-12">
                <label className="auth-inline-10">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  minLength={6}
                  className="auth-inline-11"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-inline-17 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-key"></i>
                <span>{loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}</span>
              </button>
            </form>
          )}

          <div className="inner-footer auth-inline-18">
            Nhớ mật khẩu?{' '}
            <Link to="/login" className="auth-inline-19">
              Quay lại Đăng nhập
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
