import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { landlordApi } from '../../api/landlordApi';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight,
  FileEdit,
  Eye,
  UserCheck,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const LandlordDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await landlordApi.getDashboard();
        if (res.code === 200 && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Lỗi tải dashboard chủ trọ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white/60 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-white/60 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  const landlordStatus = data?.landlordStatus || user?.status;
  const isPending = landlordStatus === 'PENDING';
  const isRejected = landlordStatus === 'REJECTED';
  const isApproved = landlordStatus === 'APPROVED';
  const isInactive = landlordStatus === 'INACTIVE';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A67C52]">
              Kênh Quản Trị Chủ Trọ
            </span>
            {isApproved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Đối tác xác thực
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif mt-0.5">
            Bảng Điều Khiển Chủ Trọ
          </h1>
        </div>

        <Link
          to="/landlord/rooms/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold shadow-md shadow-[#8C6239]/20 hover:shadow-lg transition-all no-underline shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>Đăng Tin Mới</span>
        </Link>
      </div>

      {/* Landlord Account Status Notification (Only show when not approved) */}
      {isPending && (
        <div className="p-4 rounded-2xl border bg-amber-50/90 border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Hồ sơ Chủ trọ đang chờ Admin phê duyệt (PENDING)</p>
            <p className="leading-relaxed text-amber-800">
              Admin đang xem xét thông tin xác minh của bạn. Sau khi tài khoản được duyệt, bạn có thể tạo và đăng tải các bài đăng phòng trọ lên hệ thống.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl border bg-rose-50/90 border-rose-200 text-rose-900 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 flex-1">
            <p className="font-bold text-sm">Hồ sơ Chủ trọ chưa được phê duyệt (REJECTED)</p>
            <p className="leading-relaxed text-rose-800">
              Lý do: {data?.rejectReason || user?.rejectReason || 'Thông tin cung cấp chưa đầy đủ hoặc không hợp lệ.'}
            </p>
            <div className="pt-2">
              <Link
                to="/landlord/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs no-underline hover:bg-rose-700"
              >
                <span>Cập nhật hồ sơ & gửi lại</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {isInactive && (
        <div className="p-4 rounded-2xl border bg-slate-50 border-slate-300 text-slate-800 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Tài khoản Chủ trọ đang tạm khóa (INACTIVE)</p>
            <p className="leading-relaxed text-slate-600">
              Tài khoản của bạn hiện đang tạm ngừng hoạt động. Vui lòng liên hệ ban quản trị TroNest để được hỗ trợ mở khóa.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-2 hover:border-[#A67C52]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Tổng Bài Đăng</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#A67C52] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-serif text-slate-900">{data?.totalRooms || 0}</p>
          <p className="text-[11px] text-slate-500">Toàn bộ phòng trọ đã tạo</p>
        </div>

        {/* Approved */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-semibold">Đang Hiển Thị</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-serif text-emerald-600">{data?.approvedRooms || 0}</p>
          <p className="text-[11px] text-emerald-700">Khách thuê có thể tìm kiếm</p>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span className="font-semibold">Chờ Kiểm Duyệt</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-serif text-amber-600">{data?.pendingRooms || 0}</p>
          <p className="text-[11px] text-amber-700">Đang được Admin thẩm định</p>
        </div>

        {/* Draft or Rejected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Bản Nháp / Cần Sửa</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-serif text-slate-700">
            {(data?.draftRooms || 0) + (data?.rejectedRooms || 0)}
          </p>
          <p className="text-[11px] text-slate-500">Chưa được công khai</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/landlord/rooms/create"
          className="p-5 rounded-3xl bg-gradient-to-br from-[#8C6239] to-[#6E4B26] text-white flex items-center justify-between shadow-sm hover:shadow-md transition-all group no-underline"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <p className="font-bold text-sm text-white">Đăng Phòng Mới</p>
            <p className="text-[11px] text-white/80">Thêm hình ảnh, địa chỉ và giá thuê</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
        </Link>

        <Link
          to="/landlord/rooms"
          className="p-5 rounded-3xl bg-white border border-[#E6DFD3] text-slate-800 flex items-center justify-between shadow-xs hover:border-[#A67C52] transition-all group no-underline"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F2] text-[#A67C52] flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm text-slate-900">Quản Lý Tin Đăng</p>
            <p className="text-[11px] text-slate-500">Xem và sửa bài viết đã đăng</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#A67C52] transition-all" />
        </Link>

        <Link
          to="/landlord/profile"
          className="p-5 rounded-3xl bg-white border border-[#E6DFD3] text-slate-800 flex items-center justify-between shadow-xs hover:border-[#A67C52] transition-all group no-underline"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F2] text-[#A67C52] flex items-center justify-center mb-2">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm text-slate-900">Hồ Sơ & Liên Hệ</p>
            <p className="text-[11px] text-slate-500">Cập nhật SĐT, Zalo và link Facebook</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#A67C52] transition-all" />
        </Link>
      </div>

      {/* Recent Posted Rooms Table */}
      <div className="bg-white rounded-3xl border border-[#E6DFD3] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E6DFD3] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Bài Đăng Gần Đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật mới nhất về các bài đăng phòng trọ của bạn
            </p>
          </div>
          <Link 
            to="/landlord/rooms" 
            className="text-xs font-bold text-[#A67C52] hover:text-[#8C6239] flex items-center gap-1 no-underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentRooms?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DFD3]">
                <tr>
                  <th className="py-3.5 px-5 sm:px-6">Phòng trọ</th>
                  <th className="py-3.5 px-4 sm:px-6">Giá thuê</th>
                  <th className="py-3.5 px-4 sm:px-6">Trạng thái</th>
                  <th className="py-3.5 px-4 sm:px-6">Lượt xem</th>
                  <th className="py-3.5 px-5 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentRooms.map((room) => {
                  const isRoomApproved = room.status === 'APPROVED';
                  const isRoomPending = room.status === 'PENDING';
                  const isRoomRejected = room.status === 'REJECTED';

                  return (
                    <tr key={room._id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                      <td className="py-4 px-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.thumbnail || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                            alt="Thumb"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="truncate max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{room.title}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{room.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                        {room.price ? `${(room.price / 1000000).toFixed(1)} tr/tháng` : 'Thỏa thuận'}
                      </td>
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {isRoomApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                          </span>
                        )}
                        {isRoomPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        )}
                        {isRoomRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" /> Từ chối
                          </span>
                        )}
                        {room.status === 'DRAFT' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-slate-500 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {room.views || 0}
                        </span>
                      </td>
                      <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap space-x-1.5">
                        {isRoomApproved && (
                          <Link
                            to={`/rooms/detail/${room._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F2] text-slate-700 font-bold text-[11px] no-underline"
                            title="Xem trên trang khách thuê"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xem web</span>
                          </Link>
                        )}
                        <Link
                          to={`/landlord/rooms/edit/${room._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#A67C52]/30 bg-white hover:bg-[#FAF7F2] text-[#A67C52] font-bold text-[11px] no-underline shadow-2xs"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4 text-slate-400 text-xs space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-semibold">Bạn chưa có bài đăng phòng trọ nào.</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Hãy bấm vào nút "Đăng Tin Mới" phía trên để giới thiệu căn phòng của bạn tới hàng nghìn khách thuê!
            </p>
            <Link
              to="/landlord/rooms/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6239] text-white text-xs font-bold no-underline hover:bg-[#6E4B26]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Tin Ngay</span>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};
