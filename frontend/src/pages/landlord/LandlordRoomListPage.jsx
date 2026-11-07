import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
import toast from 'react-hot-toast';
import {
  PlusCircle,
  Search,
  FileEdit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const LandlordRoomListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  const fetchRooms = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchParams]);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng phòng trọ này không?')) return;
    try {
      const res = await landlordApi.deleteRoom(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã xóa bài đăng thành công!');
        setRooms((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      toast.error('Không thể xóa bài đăng!');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
            Kênh Quản Lý
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
            Danh Sách Bài Đăng Phòng Trọ
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

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6DFD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { label: 'Tất cả', val: '' },
            { label: 'Đã duyệt', val: 'APPROVED' },
            { label: 'Chờ duyệt', val: 'PENDING' },
            { label: 'Bản nháp', val: 'DRAFT' },
            { label: 'Từ chối', val: 'REJECTED' }
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => handleStatusFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${status === tab.val
                  ? 'bg-[#A67C52] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-[#F5EFE6]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
          />
        </form>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl border border-[#E6DFD3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DFD3]">
                <tr>
                  <th className="py-3.5 px-6">Phòng trọ</th>
                  <th className="py-3.5 px-6">Giá thuê</th>
                  <th className="py-3.5 px-6">Diện tích</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6">Lượt xem</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
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
                        <Link
                          to={`/rooms/detail/${room._id}`}
                          className="font-bold text-slate-900 hover:text-[#A67C52] truncate block no-underline"
                        >
                          {room.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate">{room.address}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {room.price ? `${(room.price / 1000000).toFixed(1)} tr/tháng` : 'Thỏa thuận'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">
                      {room.area} m²
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
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <Link
                        to={`/landlord/rooms/edit/${room._id}`}
                        className="inline-flex items-center gap-1 p-2 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F2] text-[#A67C52] font-bold text-[11px] no-underline"
                        title="Chỉnh sửa"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(room._id)}
                        className="inline-flex items-center gap-1 p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] cursor-pointer"
                        title="Xóa phòng"
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
          <div className="text-center py-16 text-slate-400 text-xs">
            Không tìm thấy bài đăng nào theo tiêu chí đã chọn.
          </div>
        )}
      </div>

    </div>
  );
};

