import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { RoomCard } from '../../components/common/RoomCard';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, MapPin } from 'lucide-react';

export const RoomListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteRoomIds, setFavoriteRoomIds] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter local state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [province, setProvince] = useState(searchParams.get('province') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const res = await roomApi.getRooms(params);
        if (res.code === 200 && res.data) {
          setRooms(res.data.rooms || []);
          setCategories(res.data.categories || []);
          setFavoriteRoomIds(res.data.favoriteRoomIds || []);
          setTotalRooms(res.data.totalRooms || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách phòng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (keyword) newParams.set('keyword', keyword.trim());
    if (category) newParams.set('category', category);
    if (province) newParams.set('province', province);
    if (priceRange) newParams.set('priceRange', priceRange);
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilter = () => {
    setKeyword('');
    setCategory('');
    setProvince('');
    setPriceRange('');
    setSort('newest');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#E6DFD3] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
          Tìm Kiếm Không Gian Sống
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mt-1">
          Danh Sách Phòng Trọ & Căn Hộ
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tìm thấy <strong>{totalRooms}</strong> phòng trọ đã được xác thực an toàn.
        </p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleApplyFilter} className="bg-white p-5 rounded-3xl border border-[#E6DFD3] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Từ khóa, tên đường..."
              className="w-full pl-10 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            />
          </div>

          {/* Category Select */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            >
              <option value="">Tất cả loại phòng</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug || c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            >
              <option value="">Mọi mức giá</option>
              <option value="under-2m">Dưới 2 triệu</option>
              <option value="2m-4m">Từ 2 - 4 triệu</option>
              <option value="4m-7m">Từ 4 - 7 triệu</option>
              <option value="above-7m">Trên 7 triệu</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="views-desc">Xem nhiều nhất</option>
            </select>
          </div>

        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClearFilter}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-2xl bg-[#A67C52] hover:bg-[#8C6239] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </form>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              isFavorited={favoriteRoomIds.includes(room._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E6DFD3] space-y-3">
          <p className="text-base font-bold text-slate-800">Không tìm thấy phòng trọ nào phù hợp</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vui lòng thử thay đổi khoảng giá, khu vực hoặc xóa bớt tiêu chí lọc để xem thêm nhiều kết quả.
          </p>
          <button
            onClick={handleClearFilter}
            className="mt-2 px-5 py-2 rounded-full bg-[#FAF7F2] border border-[#E6DFD3] text-xs font-bold text-[#A67C52] hover:bg-[#F5EFE6]"
          >
            Xem tất cả phòng
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3.5 py-1.5 rounded-xl border border-[#E6DFD3] bg-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5EFE6]"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                p === currentPage
                  ? 'bg-[#A67C52] text-white shadow-xs'
                  : 'bg-white border border-[#E6DFD3] text-slate-700 hover:bg-[#F5EFE6]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3.5 py-1.5 rounded-xl border border-[#E6DFD3] bg-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5EFE6]"
          >
            Sau
          </button>
        </div>
      )}

    </div>
  );
};
