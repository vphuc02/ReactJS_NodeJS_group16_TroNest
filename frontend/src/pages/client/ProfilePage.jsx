import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Camera, ShieldCheck, Key } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await profileApi.updateProfile(formData);
      if (res.code === 200) {
        toast.success(res.message || 'Cập nhật thông tin thành công!');
        refreshUser();
      } else {
        toast.error(res.message || 'Cập nhật thất bại!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await profileApi.changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });

      if (res.code === 200) {
        toast.success(res.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mật khẩu hiện tại không đúng!');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      const res = await profileApi.sendResetPasswordEmail();
      if (res.code === 200) {
        toast.success(res.message || 'Đã gửi liên kết đổi mật khẩu tới email của bạn!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi email lúc này!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="border-b border-[#E6DFD3] pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
          Tài Khoản Của Bạn
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
          Hồ Sơ Cá Nhân
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Avatar & Overview (4 cols) */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-[#E6DFD3] shadow-xs text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
              alt="Avatar"
              className="w-full h-full rounded-3xl object-cover border-2 border-[#A67C52]/30 shadow-md"
            />
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#A67C52] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#8C6239] transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#A67C52] border border-[#E6DFD3]">
              {user?.role === 'ADMIN' ? 'Quản Trị Viên' : user?.role === 'LANDLORD' ? 'Chủ Trọ' : 'Khách Thuê'}
            </span>
          </div>
        </div>

        {/* Right Column: Edit Forms (8 cols) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Update Info Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Thông Tin Cơ Bản
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Hà Nội, Việt Nam"
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-2xl bg-[#A67C52] hover:bg-[#8C6239] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Đổi Mật Khẩu
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Xác nhận mật khẩu"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {pwdLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="text-xs font-semibold text-[#A67C52] hover:underline cursor-pointer"
                >
                  Gửi liên kết đổi mật khẩu qua email
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
