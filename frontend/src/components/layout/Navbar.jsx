import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatar, handleAvatarError } from '../../utils/avatar';

export const Navbar = () => {
  const { user, isAuthenticated, isLandlord, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Floating Pill Navbar - Hotelier Luxury Hospitality Style */}
      <header className="fixed top-4 inset-x-0 z-50 px-2 sm:px-6 pointer-events-none">
        <div className="w-[96%] max-w-[1440px] mx-auto pointer-events-auto">
          <nav className="rounded-full bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E6DFD3] shadow-[0_10px_34px_rgba(28,27,25,0.08),0_1px_2px_rgba(28,27,25,0.04)] hover:shadow-[0_14px_42px_rgba(166,124,82,0.16)] transition-all duration-300 px-4 sm:px-7 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: TroNest Hotelier Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Mở menu"
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E6DFD3] bg-[#F5EFE6] hover:bg-[#A67C52] text-[#1C1B19] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <i className="fa-solid fa-bars text-xs sm:text-sm"></i>
              </button>

              <Link to="/" title="TroNest - Nền tảng tìm kiếm phòng trọ sang trọng, an tâm" className="flex items-center gap-2.5 group no-underline">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#A67C52] border border-[#8C6239]/30 flex items-center justify-center text-white group-hover:bg-[#1C1B19] transition-all duration-200 shadow-xs">
                  <i className="fa-solid fa-house-chimney text-sm sm:text-base"></i>
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1C1B19] group-hover:text-[#A67C52] transition-colors duration-200">
                  TroNest
                </span>
              </Link>
            </div>

            {/* Middle: Main Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-4 flex-1 px-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-[13.5px] lg:text-sm font-semibold transition-all duration-200 no-underline flex items-center gap-2 group ${
                    isActive
                      ? 'text-[#A67C52] bg-[#F5EFE6]'
                      : 'text-[#1C1B19] hover:text-[#A67C52] hover:bg-[#F5EFE6]'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4C2AA] group-hover:bg-[#A67C52] transition-colors"></span>
                <span>Trang Chủ</span>
              </NavLink>

              <NavLink
                to="/rooms"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-[13.5px] lg:text-sm font-semibold transition-all duration-200 no-underline flex items-center gap-2 group ${
                    isActive
                      ? 'text-[#A67C52] bg-[#F5EFE6]'
                      : 'text-[#1C1B19] hover:text-[#A67C52] hover:bg-[#F5EFE6]'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4C2AA] group-hover:bg-[#A67C52] transition-colors"></span>
                <span>Tất Cả Phòng</span>
              </NavLink>

              <NavLink
                to="/rooms?category=can-ho-mini-studio"
                className={({ isActive }) =>
                  `hidden lg:flex px-4 py-2 rounded-full text-[13.5px] lg:text-sm font-semibold transition-all duration-200 no-underline items-center gap-2 group ${
                    isActive
                      ? 'text-[#A67C52] bg-[#F5EFE6]'
                      : 'text-[#6E6A63] hover:text-[#A67C52] hover:bg-[#F5EFE6]'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4C2AA] group-hover:bg-[#A67C52] transition-colors"></span>
                <span>Studio & Căn Hộ</span>
              </NavLink>
            </nav>

            {/* Right: Actions (Post Room + Auth Buttons) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin/dashboard"
                      title="Cổng Quản trị"
                      className="rounded-full bg-[#1C1B19] hover:bg-[#2A2825] text-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 no-underline transition-all duration-200"
                    >
                      <i className="fa-solid fa-shield-halved text-[#C59B6D]"></i>
                      <span className="hidden sm:inline">Cổng Quản trị</span>
                    </Link>
                  ) : isLandlord ? (
                    <>
                      <Link
                        to="/landlord/dashboard"
                        title="Kênh Quản lý Chủ trọ"
                        className="rounded-full bg-[#F5EFE6] hover:bg-[#E6DFD3] text-[#8C6239] border border-[#E6DFD3] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 no-underline transition-all duration-200"
                      >
                        <i className="fa-solid fa-house-chimney-user text-xs"></i>
                        <span className="hidden sm:inline">Kênh Chủ Trọ</span>
                      </Link>
                      <Link
                        to="/landlord/rooms/create"
                        title="Đăng tin trọ"
                        className="btn-hotelier btn-hotelier-bronze text-xs sm:text-sm no-underline"
                      >
                        <span className="hidden xs:inline sm:inline">Đăng tin trọ</span>
                        <span className="btn-hotelier-icon">
                          <i className="fa-solid fa-plus text-[11px]"></i>
                        </span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/register?role=LANDLORD"
                      title="Đăng tin trọ"
                      className="btn-hotelier btn-hotelier-bronze text-xs sm:text-sm no-underline"
                    >
                      <span className="hidden xs:inline sm:inline">Đăng tin trọ</span>
                      <span className="btn-hotelier-icon">
                        <i className="fa-solid fa-plus text-[11px]"></i>
                      </span>
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-6 bg-[#E6DFD3] mx-0.5"></div>

                  {/* User Profile Capsule */}
                  <div className="flex items-center gap-1.5 pl-1">
                    <Link
                      to={isLandlord ? "/landlord/profile" : (isAdmin ? "/admin/dashboard" : "/profile")}
                      title="Xem và cập nhật thông tin cá nhân"
                      className="flex items-center gap-1.5 sm:gap-2 py-1 px-1.5 sm:px-3 rounded-full border border-[#E6DFD3] bg-white hover:bg-[#F5EFE6] hover:border-[#A67C52] transition-all duration-200 no-underline shadow-xs"
                    >
                      <img
                        src={resolveAvatar(user?.avatar)}
                        alt={user?.fullName || "Avatar"}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#E6DFD3]"
                        onError={handleAvatarError}
                      />
                      <span className="text-xs font-semibold text-[#1C1B19] inline-block max-w-[110px] sm:max-w-[150px] truncate">
                        {user?.fullName ? user.fullName.replace(/\s*\([^)]*\)/g, '') : user?.email}
                      </span>
                      <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isLandlord
                          ? 'bg-[#F5EFE6] text-[#8C6239] border border-[#E6DFD3]'
                          : (isAdmin
                              ? 'bg-[#1C1B19] text-[#C59B6D]'
                              : 'bg-[#FAF7F2] text-[#6E4B26] border border-[#E6DFD3]')
                      }`}>
                        {isLandlord ? 'Chủ trọ' : isAdmin ? 'Quản trị' : 'Khách thuê'}
                      </span>
                    </Link>

                    {/* Favorites Icon */}
                    <Link
                      to="/favorites"
                      title="Phòng yêu thích"
                      className="w-8 h-8 rounded-full border border-[#E6DFD3] bg-white flex items-center justify-center text-[#6E6A63] hover:text-[#A67C52] hover:border-[#A67C52] hover:bg-[#F5EFE6] transition-all duration-200 no-underline shadow-xs"
                    >
                      <i className="fa-solid fa-heart text-xs"></i>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      title="Đăng xuất"
                      className="w-8 h-8 rounded-full border border-[#E6DFD3] bg-white flex items-center justify-center text-[#6E6A63] hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 no-underline shadow-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest state */}
                  <Link
                    to="/register?role=LANDLORD"
                    title="Đăng tin trọ"
                    className="btn-hotelier btn-hotelier-bronze text-xs sm:text-sm no-underline"
                  >
                    <span className="hidden xs:inline sm:inline">Đăng tin trọ</span>
                    <span className="btn-hotelier-icon">
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </span>
                  </Link>

                  <Link
                    to="/login"
                    className="rounded-full border border-[#E6DFD3] bg-white hover:border-[#A67C52] hover:text-[#1C1B19] text-[#6E6A63] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 no-underline shadow-xs"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full border border-[#1C1B19] bg-[#1C1B19] hover:bg-[#2A2825] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 no-underline shadow-xs"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative ml-auto w-72 max-w-[80%] bg-[#FAF7F2] h-full shadow-2xl p-6 flex flex-col justify-between z-10 border-l border-[#E6DFD3]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD3]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#A67C52] flex items-center justify-center text-white">
                    <i className="fa-solid fa-house-chimney text-xs"></i>
                  </span>
                  <span className="font-serif font-bold text-lg text-[#1C1B19]">TroNest</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E6DFD3] flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-bold text-[#1C1B19] hover:bg-[#F5EFE6]"
                >
                  Trang Chủ
                </Link>
                <Link
                  to="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-bold text-[#1C1B19] hover:bg-[#F5EFE6]"
                >
                  Tất Cả Phòng
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-bold text-[#1C1B19] hover:bg-[#F5EFE6]"
                >
                  Phòng Yêu Thích
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E6DFD3]">
              {isAuthenticated ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
                >
                  Đăng xuất
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-2xl bg-white border border-[#E6DFD3] text-xs font-bold text-[#1C1B19]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-2xl bg-[#1C1B19] text-white text-xs font-bold"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
