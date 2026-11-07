import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'LANDLORD' ? 'LANDLORD' : 'CUSTOMER';

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: address.trim(),
        role
      });

      if (res.code === 200) {
        toast.success(res.message || 'Đăng ký thành công!');
        navigate('/login');
      } else {
        toast.error(res.message || 'Đăng ký không thành công!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email này có thể đã được sử dụng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-inline-01">
      <div className="page-account auth-inline-02">
        <div className="form-account auth-inline-21">
          
          {/* Logo */}
          <div className="inner-logo auth-inline-22">
            <Link to="/" className="auth-inline-05">
              <i className="fa-solid fa-house-circle-check auth-inline-06"></i>
              <span>TroNest</span>
            </Link>
          </div>

          <h2 className="inner-title auth-inline-07">Đăng ký tài khoản mới</h2>
          <p className="auth-inline-23">Trở thành thành viên của cộng đồng TroNest</p>

          <form id="register-form" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="role-selector auth-inline-24">
              <label
                className={`auth-inline-25 cursor-pointer ${role === 'CUSTOMER' ? 'bg-white shadow-xs text-[#A67C52]' : ''}`}
                onClick={() => setRole('CUSTOMER')}
              >
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  checked={role === 'CUSTOMER'}
                  onChange={() => setRole('CUSTOMER')}
                  className="auth-inline-15"
                />
                <span>Khách thuê phòng</span>
              </label>

              <label
                className={`auth-inline-25 cursor-pointer ${role === 'LANDLORD' ? 'bg-white shadow-xs text-[#A67C52]' : ''}`}
                onClick={() => setRole('LANDLORD')}
              >
                <input
                  type="radio"
                  name="role"
                  value="LANDLORD"
                  checked={role === 'LANDLORD'}
                  onChange={() => setRole('LANDLORD')}
                  className="auth-inline-26"
                />
                <span>Chủ trọ cho thuê</span>
              </label>
            </div>

            {/* Landlord Notice */}
            {role === 'LANDLORD' && (
              <div className="auth-inline-27">
                <i className="fa-solid fa-circle-info auth-inline-28"></i>
                <span>
                  Lưu ý: Tài khoản Chủ trọ sau khi đăng ký sẽ ở trạng thái{' '}
                  <b>Chờ duyệt (PENDING)</b>. Admin sẽ kiểm tra và phê duyệt trước khi bạn có thể đăng bài.
                </span>
              </div>
            )}

            <div className="inner-group auth-inline-29">
              <label className="auth-inline-10">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="auth-inline-30"
              />
            </div>

            <div className="inner-group auth-inline-29">
              <label className="auth-inline-10">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="auth-inline-30"
              />
            </div>

            <div className="inner-group auth-inline-29">
              <label className="auth-inline-10">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                required
                className="auth-inline-30"
              />
            </div>

            <div className="inner-group auth-inline-29">
              <label className="auth-inline-10">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
                className="auth-inline-30"
              />
            </div>

            <div className="inner-group auth-inline-31">
              <label className="auth-inline-10">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quận Cầu Giấy, Hà Nội"
                className="auth-inline-30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-inline-17"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
            </button>
          </form>

          {/* Google OAuth Register */}
          <div className="auth-divider">
            <span>Hoặc đăng ký nhanh với</span>
          </div>

          <a
            href={`http://localhost:3000/auth/google?role=${role}`}
            className="btn-google-oauth no-underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z" />
              <path fill="#4A90E2" d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z" />
              <path fill="#FBBC05" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z" />
            </svg>
            <span>Tiếp tục với Google ({role === 'LANDLORD' ? 'Chủ trọ' : 'Khách thuê'})</span>
          </a>

          <div className="inner-footer auth-inline-18">
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-inline-19">
              Đăng nhập ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
