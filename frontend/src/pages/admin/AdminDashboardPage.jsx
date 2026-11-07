import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { 
  Users, 
  Home, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  Tags, 
  Eye, 
  Check, 
  X,
  ArrowRight 
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.getDashboard();
      if (res.code === 200 && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApproveLandlord = async (id) => {
    try {
      const res = await adminApi.approveLandlord(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã phê duyệt tài khoản chủ trọ!');
        fetchDashboard();
      }
    } catch {
      toast.error('Phê duyệt thất bại!');
    }
  };

  const handleApproveRoom = async (id) => {
    try {
      const res = await adminApi.approveRoom(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã phê duyệt bài đăng phòng!');
        fetchDashboard();
      }
    } catch {
      toast.error('Phê duyệt phòng thất bại!');
    }
  };

  if (loading) {
    return <div className="h-96 bg-white/60 rounded-3xl animate-pulse"></div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Tổng Thể Hệ Thống
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
          Bảng Điều Khiển Quản Trị Viên
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Tổng Phòng</p>
          <p className="text-2xl font-black text-slate-900 font-serif">{data?.totalRooms || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-amber-600">Phòng Chờ Duyệt</p>
          <p className="text-2xl font-black text-amber-600 font-serif">{data?.pendingRoomsCount || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-emerald-600">Phòng Đã Duyệt</p>
          <p className="text-2xl font-black text-emerald-600 font-serif">{data?.approvedRoomsCount || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Tổng Chủ Trọ</p>
          <p className="text-2xl font-black text-slate-900 font-serif">{data?.totalLandlords || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-amber-600">Chủ Trọ Chờ Duyệt</p>
          <p className="text-2xl font-black text-amber-600 font-serif">{data?.pendingLandlordsCount || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Khách Thuê</p>
          <p className="text-2xl font-black text-slate-900 font-serif">{data?.totalCustomers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Pending Rooms Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Bài Đăng Cần Phê Duyệt</span>
            </h3>
            <Link to="/admin/rooms?status=PENDING" className="text-xs font-bold text-emerald-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          {data?.pendingRooms?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.pendingRooms.map((room) => (
                <div key={room._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="truncate max-w-xs">
                    <p className="text-xs font-bold text-slate-900 truncate">{room.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Chủ trọ: {room.landlordId?.fullName} • {room.price ? `${(room.price / 1000000).toFixed(1)} tr` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`/rooms/detail/${room._id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="Xem phòng"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleApproveRoom(room._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Không có bài đăng nào cần duyệt.
            </div>
          )}
        </div>

        {/* Pending Landlords Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Chủ Trọ Mới Chờ Duyệt</span>
            </h3>
            <Link to="/admin/landlords?status=PENDING" className="text-xs font-bold text-emerald-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          {data?.pendingLandlords?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.pendingLandlords.map((ll) => (
                <div key={ll._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="truncate max-w-xs">
                    <p className="text-xs font-bold text-slate-900 truncate">{ll.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{ll.email} • {ll.phone || 'Chưa có SĐT'}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApproveLandlord(ll._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Phê Duyệt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Không có chủ trọ nào đang chờ duyệt.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

