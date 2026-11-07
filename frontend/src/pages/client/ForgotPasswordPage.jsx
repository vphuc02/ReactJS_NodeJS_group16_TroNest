import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Lock, Clock, ArrowLeft, RotateCw } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const navigate = useNavigate();

  // Timer countdown cho bước 2
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

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.code === 200) {
        toast.success(res.message || 'Mã OTP đã được gửi vào email của bạn!');
        setCountdown(res.expiresIn || 300);
        setStep(2);
      } else {
        toast.error(res.message || 'Không thể gửi mã OTP!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tìm thấy tài khoản với email này!');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Mã OTP phải gồm đúng 6 chữ số!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      if (res.code === 200) {
        toast.success('Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.');
        setResetToken(res.resetToken);
        setStep(3);
      } else {
        toast.error(res.message || 'Mã OTP không chính xác!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
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
        email,
        resetToken,
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
      toast.error(err.response?.data?.message || 'Phiên đặt lại mật khẩu đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E6DFD3] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-[#A67C52] text-white flex items-center justify-center shadow-md">
              <i className="fa-solid fa-house-circle-check text-lg"></i>
            </span>
            <span className="text-2xl font-bold font-serif text-slate-900">TroNest</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif pt-2">
            Khôi Phục Mật Khẩu
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Nhập email đã đăng ký để nhận mã OTP 6 chữ số'}
            {step === 2 && 'Nhập mã xác thực OTP gửi về hộp thư'}
            {step === 3 && 'Thiết lập mật khẩu mới an toàn cho tài khoản'}
          </p>
        </div>

        {/* 3-Step Stepper Progress Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD3]">
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-[#A67C52]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#A67C52] text-white' : 'bg-slate-200'}`}>
              1
            </span>
            <span>Email</span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200"></div>

          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-[#A67C52]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#A67C52] text-white' : 'bg-slate-200'}`}>
              2
            </span>
            <span>Mã OTP</span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200"></div>

          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-[#A67C52]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-[#A67C52] text-white' : 'bg-slate-200'}`}>
              3
            </span>
            <span>Mật Khẩu</span>
          </div>
        </div>

        {/* STEP 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ Email tài khoản
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@tronest.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Input OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate max-w-[200px]">
                Gửi tới: <strong>{email}</strong>
              </span>
              <div className="flex items-center gap-1 font-bold text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown > 0 ? formatTimer(countdown) : 'Hết hạn'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhập mã OTP (6 chữ số)
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-center tracking-widest text-lg font-black text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Xác Thực Mã OTP'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Đổi email khác</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp(null)}
                className="inline-flex items-center gap-1 text-[#A67C52] font-bold hover:underline cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Gửi lại mã</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={6}
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="font-bold text-[#A67C52] hover:text-[#8C6239]">
            Quay lại Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
};

