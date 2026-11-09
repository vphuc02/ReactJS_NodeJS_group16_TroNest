import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { Search, Check, X, Trash2, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminRoomListPage = () => {
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
      const res = await adminApi.getRooms(params);
      if (res.code === 200 && res.data) {
        setRooms(res.data.rooms || []);
        setPaging(res.data.paging);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng admin:', err);
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
    if (searchInput.trim()) newParams.set('keyword', searchInput.trim());
    else newParams.delete('keyword');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusFilter = (st) => {
    const newParams = new URLSearchParams(searchParams);
    if (st) newParams.set('status', st);
    else newParams.delete('status');
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

  const handleApprove = async (id) => {
    try {
      const res = await adminApi.approveRoom(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã duyệt bài đăng!');
        fetchRooms();
      }
    } catch {
      toast.error('Duyệt bài thất bại!');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối bài đăng:', 'Thông tin không chính xác hoặc vi phạm chính sách');
    if (reason === null) return;
    try {
      const res = await adminApi.rejectRoom(id, reason);
      if (res.code === 200) {
        toast.success(res.message || 'Đã từ chối bài đăng!');
        fetchRooms();
      }
    } catch {
      toast.error('Từ chối thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn bài đăng này?')) return;
    try {
      const res = await adminApi.deleteRoom(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã xóa bài đăng!');
        setRooms((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      toast.error('Xóa bài thất bại!');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Thẩm Định Nội Dung</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif mt-0.5">Duyệt Bài Đăng Phòng Trọ</h1>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { label: 'Tất cả', val: '' },
            { label: 'Chờ duyệt', val: 'PENDING' },
            { label: 'Đã duyệt', val: 'APPROVED' },
            { label: 'Từ chối', val: 'REJECTED' },
            { label: 'Bản nháp', val: 'DRAFT' }
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => handleStatusFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                status === tab.val ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề, chủ trọ..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Phòng trọ</th>
                  <th className="py-3.5 px-6">Chủ trọ</th>
                  <th className="py-3.5 px-6">Giá thuê</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Phê duyệt / Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={room.thumbnail || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                        alt="Thumb"
                        className="w-12 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate max-w-xs">
                        <Link to={`/rooms/detail/${room._id}`} target="_blank" className="font-bold text-slate-900 hover:text-emerald-600 truncate block no-underline">
                          {room.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate">{room.address}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{room.landlordId?.fullName || 'Chủ trọ'}</p>
                      <p className="text-[11px] text-slate-400">{room.landlordId?.phone || room.landlordId?.email}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {room.price ? `${(room.price / 1000000).toFixed(1)} tr` : 'Thỏa thuận'}
                    </td>
                    <td className="py-4 px-6">
                      {room.status === 'APPROVED' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã duyệt</span>}
                      {room.status === 'PENDING' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>}
                      {room.status === 'REJECTED' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Từ chối</span>}
                      {room.status === 'DRAFT' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Bản nháp</span>}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        to={`/rooms/detail/${room._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center transition-colors"
                        title="Xem ngoài website"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      {room.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(room._id)}
                          className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          title="Duyệt bài"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {room.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleReject(room._id)}
                          className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                          title="Từ chối"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(room._id)}
                        className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        title="Xóa bài"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">Không có bài đăng nào.</div>
        )}

        {/* Pagination Bar */}
        {paging && paging.totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/60">
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
                if (p === 1 || p === paging.totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`min-w-8 h-8 px-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                        page === p
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="px-1 text-slate-400">...</span>;
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
