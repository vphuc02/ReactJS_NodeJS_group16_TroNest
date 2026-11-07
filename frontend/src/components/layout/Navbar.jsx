import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Search, 
  Building, 
  Heart, 
  User, 
  LogOut, 
  PlusCircle, 
  ShieldCheck, 
  LayoutDashboard,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isLandlord, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E6DFD3] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group no-underline">
            <span className="w-10 h-10 rounded-2xl bg-[#A67C52] text-white flex items-center justify-center shadow-md shadow-[#A67C52]/20 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-house-circle-check text-lg"></i>
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-serif leading-none">
                TroNest
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A67C52] mt-0.5">
                Boutique Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5EFE6]/80 p-1.5 rounded-full border border-[#E6DFD3]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#A67C52] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`
              }
            >
              Trang Chủ
            </NavLink>
            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#A67C52] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`
              }
            >
              Tất Cả Phòng
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#A67C52] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`
              }
            >
              Yêu Thích
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={isLandlord ? "/landlord/rooms/create" : "/register?role=LANDLORD"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đăng tin trọ</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-[#E6DFD3] bg-white hover:bg-[#F5EFE6]/50 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user?.fullName || user?.email}
                  </span>
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user?.fullName || "Avatar"}
                    className="w-8 h-8 rounded-full object-cover border border-[#E6DFD3]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Đăng nhập với tư cách</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#A67C52] border border-[#E6DFD3]">
                        {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'LANDLORD' ? 'Chủ trọ' : 'Khách thuê'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#FAF7F2] hover:text-[#A67C52] transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Hồ sơ cá nhân
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#FAF7F2] hover:text-[#A67C52] transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      Phòng đã lưu
                    </Link>

                    {isLandlord && (
                      <Link
                        to="/landlord/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#FAF7F2] hover:text-[#A67C52] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#A67C52]" />
                        Kênh Quản Lý Chủ Trọ
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#FAF7F2] hover:text-[#A67C52] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Cổng Quản Trị Hệ Thống
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-[#F5EFE6] transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-[#F5EFE6]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6DFD3] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#F5EFE6]"
          >
            Trang Chủ
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#F5EFE6]"
          >
            Tất Cả Phòng
          </Link>
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#F5EFE6]"
          >
            Phòng Yêu Thích
          </Link>
          {isAuthenticated ? (
            <div className="pt-3 border-t border-[#E6DFD3] space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#F5EFE6]"
              >
                Hồ sơ ({user?.fullName})
              </Link>
              {isLandlord && (
                <Link
                  to="/landlord/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-[#A67C52] hover:bg-[#F5EFE6]"
                >
                  Kênh Chủ Trọ
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-emerald-600 hover:bg-[#F5EFE6]"
                >
                  Trang Quản Trị
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#E6DFD3] flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-slate-900 text-sm font-bold text-white"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

