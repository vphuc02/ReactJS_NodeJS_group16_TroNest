import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
        email: email.trim(),
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
      console.error('Chi tiết lỗi đăng nhập:', err);
      if (!err.response) {
        toast.error('Không thể kết nối đến máy chủ Backend (http://localhost:3000). Vui lòng đảm bảo bạn đang chạy "npm run dev" trong terminal backend!', { duration: 6000 });
      } else {
        toast.error(err.response.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
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

          <h2 className="inner-title auth-inline-07">Đăng nhập hệ thống</h2>
          <p className="auth-inline-08">Dành cho Khách thuê và Chủ trọ</p>

          <form id="login-form" onSubmit={handleSubmit}>
            <div className="inner-group auth-inline-09">
              <label className="auth-inline-10">Email đăng nhập</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@tronest.com"
                required
                className="auth-inline-11"
              />
            </div>

            <div className="inner-group auth-inline-12 relative">
              <label className="auth-inline-10">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="auth-inline-11 w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-1"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="inner-meta auth-inline-13">
              <label className="auth-inline-14">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="auth-inline-15"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="auth-inline-19">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-inline-17"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            </button>
          </form>

          {/* Google OAuth */}
          <div className="auth-divider">
            <span>Hoặc tiếp tục với</span>
          </div>

          <a
            href="http://localhost:3000/auth/google"
            className="btn-google-oauth no-underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z" />
              <path fill="#4A90E2" d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z" />
              <path fill="#FBBC05" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z" />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </a>

          <div className="inner-footer auth-inline-18">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-inline-19">
              Đăng ký ngay
            </Link>
          </div>

          {/* Quick Demo Helper */}
          <div className="auth-inline-20">
            <div>
              <strong>Tài khoản mẫu:</strong>{' '}
              <button
                type="button"
                onClick={() => { setEmail('khachhang@tronest.com'); setPassword('123456'); }}
                className="text-[#A67C52] font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                Khách
              </button>{' | '}
              <button
                type="button"
                onClick={() => { setEmail('chutro.viet@tronest.com'); setPassword('123456'); }}
                className="text-[#A67C52] font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                Chủ trọ
              </button>{' | '}
              <Link to="/admin/login" className="text-slate-800 font-bold hover:underline">
                Admin
              </Link>{' | '}
              MK: <strong>123456</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
