import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  User, 
  ArrowLeft, 
  LogOut,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const LandlordLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/landlord/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { to: '/landlord/rooms', label: 'Quản Lý Bài Đăng', icon: Home },
    { to: '/landlord/rooms/create', label: 'Đăng Tin Phòng Mới', icon: PlusCircle },
    { to: '/landlord/profile', label: 'Thông Tin Chủ Trọ', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE6]/40 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E6DFD3] flex flex-col shrink-0">
        
        {/* Brand */}
        <div className="p-6 border-b border-[#E6DFD3] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="w-9 h-9 rounded-xl bg-[#A67C52] text-white flex items-center justify-center shadow-xs">
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
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"}
            alt="Avatar"
            className="w-10 h-10 rounded-xl object-cover border border-[#E6DFD3]"
          />
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.status === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã duyệt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                  <Clock className="w-3 h-3" />
                  Chờ duyệt
                </span>
              )}
            </div>
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
                end={item.to === '/landlord/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all no-underline ${
                    isActive
                      ? 'bg-[#A67C52] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#A67C52]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
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
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

    </div>
  );
};

