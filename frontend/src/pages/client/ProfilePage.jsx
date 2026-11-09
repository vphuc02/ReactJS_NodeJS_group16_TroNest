import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import { resolveAvatar, handleAvatarError } from '../../utils/avatar';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [avatarPreview, setAvatarPreview] = useState(() => resolveAvatar(user?.avatar));
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setFacebook(user.facebook || '');
      setAvatarPreview(resolveAvatar(user.avatar));
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      formData.append('facebook', facebook.trim());
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
      toast.error(err.response?.data?.message || 'Mật khẩu cũ không chính xác!');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="pb-16 pt-2 sm:pt-3">
      <div className="container max-w-5xl mx-auto px-4 space-y-6">
        
        {/* Hero Profile Header Card */}
        <div className="profile-hero bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DFD3] shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-7">
            
            {/* Avatar */}
            <div
              className="avatar-wrapper relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Nhấn vào ảnh để đổi avatar từ máy tính"
            >
              <img
                src={avatarPreview}
                alt={user?.fullName || "Avatar"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-[#A67C52]/50 bg-[#F5EFE6] transition-all group-hover:brightness-90"
                onError={handleAvatarError}
              />
              <div className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <i className="fa-solid fa-camera text-base sm:text-lg mb-0.5"></i>
                <span className="text-[10px] font-semibold tracking-wide">Đổi ảnh</span>
              </div>
              <span className="absolute bottom-0 right-0 w-8 h-8 bg-[#A67C52] text-white border-2 border-white rounded-full flex items-center justify-center text-xs shadow-md">
                <i className="fa-solid fa-camera"></i>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Info Summary */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19] tracking-tight m-0">
                  {user?.fullName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EFE6] text-[#8C6239] border border-[#E6DFD3]">
                    <i className="fa-solid fa-user-check text-[11px] text-[#A67C52]"></i>
                    <span>{user?.role === 'LANDLORD' ? 'Chủ trọ cho thuê' : user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách thuê TroNest'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#6E4B26] border border-[#E6DFD3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A67C52] animate-pulse"></span>
                    <span>Đang hoạt động</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#6E6A63] justify-center sm:justify-start mt-2.5">
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-envelope text-[#A67C52]"></i>
                  <span>{user?.email}</span>
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-phone text-[#A67C52]"></i>
                    <span>{user?.phone}</span>
                  </span>
                )}
                {user?.facebook && (
                  <a
                    href={user.facebook.startsWith('http') ? user.facebook : `https://${user.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#1877F2] hover:underline font-medium no-underline"
                    title="Mở liên kết Facebook"
                  >
                    <i className="fa-brands fa-facebook text-sm"></i>
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 2 Column Grid for Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Update Info Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1C1B19] flex items-center gap-2 pb-4 border-b border-[#E6DFD3]">
              <i className="fa-regular fa-id-badge text-[#A67C52]"></i>
              <span>Cập Nhật Thông Tin Cá Nhân</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Họ và tên (*)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quận Cầu Giấy, Hà Nội"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Link Facebook cá nhân</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1877F2]">
                    <i className="fa-brands fa-facebook text-sm"></i>
                  </span>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username-cua-ban"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#8C867A] mt-1">
                  Thêm liên kết Facebook giúp người thuê hoặc chủ trọ liên hệ trao đổi thuận tiện hơn.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-hotelier btn-hotelier-bronze w-full justify-center cursor-pointer"
              >
                <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-floppy-disk text-xs"></i>
                </span>
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1C1B19] flex items-center gap-2 pb-4 border-b border-[#E6DFD3]">
              <i className="fa-solid fa-lock text-[#A67C52]"></i>
              <span>Đổi Mật Khẩu</span>
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B19] mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-hotelier btn-hotelier-dark w-full justify-center cursor-pointer"
              >
                <span>{pwdLoading ? 'Đang đổi...' : 'Cập Nhật Mật Khẩu'}</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-key text-xs"></i>
                </span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
