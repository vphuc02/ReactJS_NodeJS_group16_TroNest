import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCheck, 
  Tags, 
  ArrowLeft, 
  LogOut 
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
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
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all no-underline ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
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
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

    </div>
  );
};

