import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  Eye, 
  ArrowRight,
  TrendingUp,
  FileEdit
} from 'lucide-react';

export const LandlordDashboardPage = () => {
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
        <div className="h-28 bg-white/60 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const isPending = data?.landlordStatus === 'PENDING';

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
            Tổng Quan Hoạt Động
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
            Bảng Điều Khiển Chủ Trọ
          </h1>
        </div>

        <Link
          to="/landlord/rooms/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold shadow-md shadow-[#8C6239]/25 hover:shadow-lg transition-all duration-200 no-underline cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>Đăng Tin Mới</span>
        </Link>
      </div>

      {/* Pending Account Notice */}
      {isPending && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-amber-800">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-900">Tài khoản của bạn đang trong trạng thái Chờ Duyệt (PENDING)</p>
            <p className="text-amber-700 leading-relaxed">
              Ban Quản trị TroNest đang tiến hành thẩm định thông tin chủ trọ để đảm bảo an toàn cho cộng đồng thuê nhà. Các bài đăng của bạn sẽ tự động được hiển thị công khai ngay sau khi tài khoản được duyệt!
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Tổng Bài Đăng</span>
            <Building className="w-4 h-4 text-[#A67C52]" />
          </div>
          <p className="text-3xl font-black font-serif text-slate-900">{data?.totalRooms || 0}</p>
          <span className="text-[11px] text-slate-500">Toàn bộ phòng trên hệ thống</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Đã Kiểm Duyệt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-serif text-emerald-600">{data?.approvedRooms || 0}</p>
          <span className="text-[11px] text-emerald-700">Đang hiển thị công khai</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Chờ Phê Duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black font-serif text-amber-600">{data?.pendingRooms || 0}</p>
          <span className="text-[11px] text-amber-700">Admin đang thẩm định</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Bản Nháp / Từ Chối</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black font-serif text-slate-700">
            {(data?.draftRooms || 0) + (data?.rejectedRooms || 0)}
          </p>
          <span className="text-[11px] text-slate-500">Cần bổ sung thông tin</span>
        </div>
      </div>

      {/* Recent Posted Rooms Table */}
      <div className="bg-white rounded-3xl border border-[#E6DFD3] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E6DFD3] flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif text-slate-900">
            Bài Đăng Cập Nhật Gần Đây
          </h3>
          <Link to="/landlord/rooms" className="text-xs font-bold text-[#A67C52] hover:underline flex items-center gap-1">
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentRooms?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DFD3]">
                <tr>
                  <th className="py-3.5 px-6">Phòng trọ</th>
                  <th className="py-3.5 px-6">Giá thuê</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6">Lượt xem</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={room.thumbnail || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                        alt="Thumb"
                        className="w-12 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{room.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{room.address}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {room.price ? `${(room.price / 1000000).toFixed(1)} tr/tháng` : 'Thỏa thuận'}
                    </td>
                    <td className="py-4 px-6">
                      {room.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã duyệt
                        </span>
                      )}
                      {room.status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Chờ duyệt
                        </span>
                      )}
                      {room.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Từ chối
                        </span>
                      )}
                      {room.status === 'DRAFT' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">
                      {room.views || 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/landlord/rooms/edit/${room._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F2] text-[#A67C52] font-bold text-[11px] no-underline"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Bạn chưa đăng tải bài viết nào. Hãy bấm "Đăng Tin Mới" để bắt đầu!
          </div>
        )}
      </div>

    </div>
  );
};

