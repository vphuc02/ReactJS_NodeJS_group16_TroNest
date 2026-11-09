import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
import toast from 'react-hot-toast';
import {
  PlusCircle,
  Search,
  FileEdit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Building,
  RefreshCw
} from 'lucide-react';

export const LandlordRoomListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const keyword = searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [searchInput, setSearchInput] = useState(keyword);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const res = await landlordApi.getRooms(params);
      if (res.code === 200 && res.data) {
        setRooms(res.data.rooms || []);
        setPaging(res.data.paging);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng:', err);
      toast.error('Không thể tải danh sách bài đăng!');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('keyword', searchInput.trim());
    } else {
      newParams.delete('keyword');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusFilter = (st) => {
    const newParams = new URLSearchParams(searchParams);
    if (st) {
      newParams.set('status', st);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (!paging || newPage < 1 || newPage > paging.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, roomTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài đăng "${roomTitle}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      const res = await landlordApi.deleteRoom(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã xóa bài đăng thành công!');
        fetchRooms();
      } else {
        toast.error(res.message || 'Không thể xóa bài đăng!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài đăng!');
    }
  };

  return (
    <div className="space-y-5">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A67C52]">
            Kênh Quản Lý Phòng
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif mt-0.5">
            Danh Sách Bài Đăng Phòng Trọ
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

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6DFD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { label: 'Tất cả bài đăng', val: '' },
            { label: 'Đã duyệt', val: 'APPROVED' },
            { label: 'Chờ duyệt', val: 'PENDING' },
            { label: 'Bản nháp', val: 'DRAFT' },
            { label: 'Từ chối', val: 'REJECTED' }
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => handleStatusFilter(tab.val)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                status === tab.val
                  ? 'bg-[#A67C52] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE9DF] hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ..."
            className="w-full pl-9 pr-8 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-transparent focus:bg-white focus:border-[#A67C52] focus:ring-1 focus:ring-[#A67C52] outline-none transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('keyword');
                newParams.set('page', '1');
                setSearchParams(newParams);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl border border-[#E6DFD3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DFD3]">
                <tr>
                  <th className="py-3.5 px-5 sm:px-6">Phòng trọ</th>
                  <th className="py-3.5 px-4 sm:px-6">Giá thuê & Tiền cọc</th>
                  <th className="py-3.5 px-4 sm:px-6">Diện tích</th>
                  <th className="py-3.5 px-4 sm:px-6">Trạng thái</th>
                  <th className="py-3.5 px-4 sm:px-6">Lượt xem</th>
                  <th className="py-3.5 px-5 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => {
                  const isApproved = room.status === 'APPROVED';
                  const isPending = room.status === 'PENDING';
                  const isRejected = room.status === 'REJECTED';
                  const isDraft = room.status === 'DRAFT';

                  return (
                    <tr key={room._id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                      {/* Room Info */}
                      <td className="py-4 px-5 sm:px-6 max-w-sm">
                        <div className="flex items-start gap-3">
                          <img
                            src={room.thumbnail || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                            alt="Thumb"
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200 mt-0.5"
                          />
                          <div className="space-y-1 min-w-0">
                            <Link
                              to={`/landlord/rooms/edit/${room._id}`}
                              className="font-bold text-slate-900 hover:text-[#A67C52] block line-clamp-1 no-underline text-xs"
                            >
                              {room.title}
                            </Link>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{room.address}</p>
                            
                            {/* Rejection Notice Banner if Rejected */}
                            {isRejected && (
                              <div className="mt-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] space-y-0.5">
                                <p className="font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                  Lý do từ chối:
                                </p>
                                <p className="text-slate-600 text-[10px] leading-relaxed">
                                  {room.rejectReason || 'Nội dung chưa đạt tiêu chuẩn. Vui lòng chỉnh sửa và gửi duyệt lại.'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          {room.price ? `${(room.price / 1000000).toFixed(1)} tr/tháng` : 'Thỏa thuận'}
                        </p>
                        {room.deposit > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Cọc: {(room.deposit / 1000000).toFixed(1)} tr
                          </p>
                        )}
                      </td>

                      {/* Area */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{room.area} m²</span>
                        {room.capacity > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Tối đa {room.capacity} người</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" /> Cần sửa
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Bản nháp
                          </span>
                        )}
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 sm:px-6 text-slate-500 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {room.views || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap space-x-1.5">
                        {isApproved && (
                          <Link
                            to={`/rooms/detail/${room._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F2] text-slate-700 font-bold text-[11px] no-underline shadow-2xs"
                            title="Xem trên trang công khai"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Xem web</span>
                          </Link>
                        )}

                        <Link
                          to={`/landlord/rooms/edit/${room._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#A67C52]/30 bg-white hover:bg-[#FAF7F2] text-[#A67C52] font-bold text-[11px] no-underline shadow-2xs"
                          title="Chỉnh sửa bài đăng"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(room._id, room.title)}
                          className="inline-flex items-center gap-1 p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                          title="Xóa bài đăng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
            <p className="text-slate-700 font-semibold text-sm">Không tìm thấy bài đăng nào</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Không có bài đăng nào khớp với điều kiện tìm kiếm hoặc bộ lọc trạng thái của bạn.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold mr-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
              <Link
                to="/landlord/rooms/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold no-underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Đăng phòng mới</span>
              </Link>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {paging && paging.totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-[#E6DFD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#FAF7F2]/60">
            <span className="text-slate-500 text-[11px]">
              Hiển thị <strong className="text-slate-800">{rooms.length}</strong> trên tổng số{' '}
              <strong className="text-slate-800">{paging.total || 0}</strong> bài đăng
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: paging.totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === paging.totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`min-w-8 h-8 px-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                        page === p
                          ? 'bg-[#A67C52] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                disabled={page >= paging.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
