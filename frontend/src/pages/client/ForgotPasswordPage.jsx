import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.code === 200) {
        toast.success(res.message || 'Mã xác thực OTP đã được gửi tới email của bạn!');
        setStep(2);
        setCountdown(res.expiresIn || 300);
      } else {
        toast.error(res.message || 'Không thể gửi mã xác thực!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tìm thấy tài khoản với email này!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Mã OTP gồm đúng 6 chữ số!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email.trim(), otp.trim());
      if (res.code === 200) {
        toast.success(res.message || 'Xác thực OTP thành công!');
        setResetToken(res.resetToken);
        setStep(3);
      } else {
        toast.error(res.message || 'Mã OTP không chính xác!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
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
      const res = await authApi.resetPassword({
        email: email.trim(),
        resetToken,
        password,
        confirmPassword
      });

      if (res.code === 200) {
        toast.success(res.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Không thể đặt lại mật khẩu!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Phiên đặt lại mật khẩu đã hết hạn!');
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
              <i className="fa-solid.fa-house-circle-check auth-inline-06"></i>
              <span>TroNest</span>
            </Link>
          </div>

          <h2 className="inner-title auth-inline-07">Khôi phục mật khẩu</h2>
          <p className="auth-inline-08">
            {step === 1 && 'Nhập email đã đăng ký để nhận mã xác thực OTP 6 chữ số'}
            {step === 2 && 'Nhập mã xác thực 6 chữ số vừa nhận được trong hộp thư'}
            {step === 3 && 'Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn'}
          </p>

          {/* Stepper */}
          <div className="forgot-stepper">
            <div className={`forgot-step ${step >= 1 ? 'is-active' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Email</span>
            </div>
            <div className="forgot-step-line"></div>
            <div className={`forgot-step ${step >= 2 ? 'is-active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Mã OTP</span>
            </div>
            <div className="forgot-step-line"></div>
            <div className={`forgot-step ${step >= 3 ? 'is-active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Mật khẩu mới</span>
            </div>
          </div>

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendEmail}>
              <div className="inner-group auth-inline-09">
                <label className="auth-inline-10">Địa chỉ Email tài khoản</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@tronest.com"
                  required
                  className="auth-inline-11"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-inline-17"
              >
                {loading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="forgot-info-box">
                <div className="forgot-info-text">
                  Mã OTP đã được gửi tới email <strong>{email}</strong>
                </div>
                <div className="forgot-timer-badge">
                  <i className="fa-regular fa-clock"></i>
                  <span>{formatCountdown(countdown)}</span>
                </div>
              </div>

              <div className="inner-group auth-inline-09">
                <label className="auth-inline-10">Nhập mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  required
                  className="auth-inline-11 forgot-otp-input text-center text-xl tracking-widest font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || countdown === 0}
                className="auth-inline-17"
              >
                {loading ? 'Đang xác thực...' : 'Xác thực mã OTP'}
              </button>

              <div className="forgot-secondary-actions">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-link-muted cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Đổi địa chỉ Email</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="btn-link-accent cursor-pointer"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  <span>Gửi lại mã OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password Form */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
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

              <div className="inner-group auth-inline-09">
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
                className="auth-inline-17"
              >
                {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
              </button>
            </form>
          )}

          <div className="inner-footer auth-inline-18">
            Quay lại{' '}
            <Link to="/login" className="auth-inline-19">
              Đăng nhập
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
