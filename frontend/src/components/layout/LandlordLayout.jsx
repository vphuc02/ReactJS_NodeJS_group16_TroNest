import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatar, handleAvatarError } from '../../utils/avatar';
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  User, 
  ArrowLeft, 
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const LandlordLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/landlord/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { to: '/landlord/rooms', label: 'Quản Lý Bài Đăng', icon: Home },
    { to: '/landlord/rooms/create', label: 'Đăng Tin Phòng Mới', icon: PlusCircle },
    { to: '/landlord/profile', label: 'Hồ Sơ & Liên Hệ', icon: User }
  ];

  const isLinkActive = (to) => {
    const current = location.pathname;

    if (to === '/landlord/dashboard') {
      return current === '/landlord' || current === '/landlord/' || current === '/landlord/dashboard';
    }

    if (to === '/landlord/rooms/create') {
      return current === '/landlord/rooms/create';
    }

    if (to === '/landlord/rooms') {
      return (
        current === '/landlord/rooms' ||
        current === '/landlord/rooms/' ||
        current.startsWith('/landlord/rooms/edit')
      );
    }

    if (to === '/landlord/profile') {
      return current === '/landlord/profile' || current.startsWith('/landlord/profile/');
    }

    return current === to;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row text-slate-800">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6DFD3] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link to="/landlord/dashboard" className="flex items-center gap-2.5 no-underline">
          <span className="w-8 h-8 rounded-xl bg-[#A67C52] text-white flex items-center justify-center shadow-xs">
            <i className="fa-solid fa-house-circle-check text-sm"></i>
          </span>
          <div>
            <span className="block text-base font-black font-serif text-slate-900 leading-none">TroNest</span>
            <span className="block text-[9px] font-bold text-[#A67C52] tracking-wider uppercase mt-0.5">Kênh Chủ Trọ</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-600 hover:text-[#A67C52] hover:bg-[#FAF7F2] transition-colors"
            title="Về Trang Khách Thuê"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-[#FAF7F2] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#A67C52]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-4/5 max-w-xs h-full bg-white flex flex-col shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD3]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#A67C52] text-white flex items-center justify-center">
                  <i className="fa-solid fa-house-circle-check text-sm"></i>
                </span>
                <div>
                  <span className="block text-base font-black font-serif text-slate-900">TroNest</span>
                  <span className="block text-[9px] font-bold text-[#A67C52] tracking-wider uppercase">Kênh Chủ Trọ</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Card */}
            <div className="p-3.5 my-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center gap-3">
              <img
                src={resolveAvatar(user?.avatar)}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover border border-[#E6DFD3]"
                onError={handleAvatarError}
              />
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Chủ trọ'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {user?.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                    </span>
                  ) : user?.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                      <Clock className="w-3 h-3" /> Chờ duyệt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                      <AlertCircle className="w-3 h-3" /> Chưa sẵn sàng
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="space-y-1.5 flex-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all no-underline ${
                      active
                        ? 'bg-[#A67C52] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#A67C52]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Links */}
            <div className="pt-4 border-t border-[#E6DFD3] space-y-1 mt-4">
              <Link
                to="/"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-[#FAF7F2] hover:text-slate-900 no-underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Về Trang Khách Thuê</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 no-underline transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E6DFD3] flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        
        {/* Brand */}
        <div className="p-5 border-b border-[#E6DFD3] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <span className="w-9 h-9 rounded-xl bg-[#A67C52] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-house-circle-check text-base"></i>
            </span>
            <div>
              <span className="block text-xl font-black font-serif text-slate-900 leading-none">TroNest</span>
              <span className="block text-[10px] font-bold text-[#A67C52] tracking-wider mt-0.5 uppercase">Kênh Chủ Trọ</span>
            </div>
          </Link>
        </div>

        {/* User Badge */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center gap-3">
          <img
            src={resolveAvatar(user?.avatar)}
            alt="Avatar"
            className="w-10 h-10 rounded-xl object-cover border border-[#E6DFD3] shrink-0"
            onError={handleAvatarError}
          />
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Chủ trọ'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.status === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã duyệt
                </span>
              ) : user?.status === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                  <AlertCircle className="w-3 h-3" />
                  Bị từ chối
                </span>
              ) : user?.status === 'PENDING' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                  <Clock className="w-3 h-3" />
                  Chờ duyệt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  <AlertCircle className="w-3 h-3" />
                  Ngừng hoạt động
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all no-underline ${
                  active
                    ? 'bg-[#A67C52] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#A67C52]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E6DFD3] space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-[#FAF7F2] hover:text-slate-900 no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Khách Thuê</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 no-underline transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-10 max-w-7xl mx-auto w-full min-w-0">
        <Outlet />
      </main>

    </div>
  );
};
