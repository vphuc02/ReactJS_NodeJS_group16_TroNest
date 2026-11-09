import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck,
  LayoutDashboard, 
  Home, 
  Users, 
  UserCheck, 
  Tags, 
  ArrowLeft, 
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { to: '/admin/rooms', label: 'Duyệt Bài Đăng Phòng', icon: Home },
    { to: '/admin/landlords', label: 'Thẩm Định Chủ Trọ', icon: UserCheck },
    { to: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
    { to: '/admin/categories', label: 'Danh Mục Loại Phòng', icon: Tags }
  ];

  const isLinkActive = (to) => {
    const current = location.pathname;

    if (to === '/admin/dashboard') {
      return current === '/admin' || current === '/admin/' || current === '/admin/dashboard';
    }

    if (to === '/admin/rooms') {
      return current.startsWith('/admin/rooms');
    }

    if (to === '/admin/landlords') {
      return current.startsWith('/admin/landlords');
    }

    if (to === '/admin/users') {
      return current.startsWith('/admin/users');
    }

    if (to === '/admin/categories') {
      return current.startsWith('/admin/categories');
    }

    return current === to;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row text-slate-800">
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md text-white">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 no-underline">
          <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <span className="block text-base font-black font-serif text-white leading-none">TroNest</span>
            <span className="block text-[9px] font-bold text-emerald-400 tracking-wider mt-0.5 uppercase">Admin Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Về Trang Khách Thuê"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-4/5 max-w-xs h-full bg-slate-900 text-white flex flex-col shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <span className="block text-base font-black font-serif text-white">TroNest</span>
                  <span className="block text-[9px] font-bold text-emerald-400 tracking-wider uppercase">Admin Portal</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Card */}
            <div className="p-3.5 my-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                AD
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 font-semibold">Toàn quyền hệ thống</p>
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
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Links */}
            <div className="pt-4 border-t border-slate-800 space-y-1 mt-4">
              <Link
                to="/"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white no-underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Về Trang Khách Thuê</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 no-underline transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="block text-xl font-black font-serif text-white leading-none">TroNest</span>
              <span className="block text-[10px] font-bold text-emerald-400 tracking-wider mt-0.5 uppercase">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Admin Info */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            AD
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
            <p className="text-[10px] text-emerald-400 truncate mt-0.5 font-semibold">Toàn quyền hệ thống</p>
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Khách Thuê</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 no-underline transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-10 max-w-7xl mx-auto w-full min-w-0">
        <Outlet />
      </main>

    </div>
  );
};
