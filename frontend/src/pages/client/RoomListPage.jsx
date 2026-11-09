import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { RoomCard } from '../../components/common/RoomCard';

export const RoomListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteRoomIds, setFavoriteRoomIds] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Local filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [province, setProvince] = useState(searchParams.get('province') || '');
  const [ward, setWard] = useState(searchParams.get('ward') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [areaRange, setAreaRange] = useState(searchParams.get('areaRange') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const currentPage = Number(searchParams.get('page')) || 1;

  // Geo options
  const [provincesList, setProvincesList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  // Fetch provinces list
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const list = await roomApi.getProvinces();
        if (Array.isArray(list)) {
          setProvincesList(list);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách tỉnh/thành:', err);
      }
    };
    fetchProvinces();
  }, []);

  // When province changes or is initialized from query, fetch wards
  useEffect(() => {
    if (!province || provincesList.length === 0) {
      setWardsList([]);
      return;
    }
    const match = provincesList.find(
      (p) => p.name === province || p.name.includes(province) || province.includes(p.name)
    );
    if (match && match.code) {
      roomApi.getWards(match.code)
        .then((list) => {
          if (Array.isArray(list)) setWardsList(list);
        })
        .catch((err) => console.error('Lỗi tải phường/xã:', err));
    }
  }, [province, provincesList]);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || '');
    setProvince(searchParams.get('province') || '');
    setWard(searchParams.get('ward') || '');
    setPriceRange(searchParams.get('priceRange') || '');
    setAreaRange(searchParams.get('areaRange') || '');
    setSort(searchParams.get('sort') || 'newest');

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
    if (ward) newParams.set('ward', ward);
    if (priceRange) newParams.set('priceRange', priceRange);
    if (areaRange) newParams.set('areaRange', areaRange);
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilter = () => {
    setKeyword('');
    setCategory('');
    setProvince('');
    setWard('');
    setWardsList([]);
    setPriceRange('');
    setAreaRange('');
    setSort('newest');
    setSearchParams({});
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 pt-2 sm:pt-3">
      <div className="container">
        
        {/* Title Bar */}
        <div className="client-clean-094 mb-6 sm:mb-8">
          <h1 className="client-clean-095 text-3xl sm:text-4xl font-serif font-bold text-[#1C1B19]">
            Danh Sách Phòng Trọ Cho Thuê
          </h1>
          <p className="client-clean-096 text-sm text-[#6E6A63] mt-1">
            Tìm thấy <b className="client-clean-059 text-[#8C6239]">{totalRooms}</b> căn phòng đã được phê duyệt phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Layout Room List: Filter Sidebar + Content */}
        <div className="layout-room-list client-clean-097 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filter */}
          <aside className="filter-sidebar client-clean-098 w-full lg:w-80 shrink-0 bg-white p-6 rounded-2xl border border-[#E6DFD3] shadow-xs">
            <div className="client-clean-099 flex items-center justify-between pb-4 mb-4 border-b border-[#E6DFD3]">
              <h3 className="client-clean-100 font-serif font-bold text-lg text-[#1C1B19] flex items-center gap-2 m-0">
                <i className="fa-solid fa-filter client-clean-059 text-[#A67C52]"></i>
                <span>Bộ lọc tìm kiếm</span>
              </h3>
              <button
                type="button"
                onClick={handleResetFilter}
                className="client-clean-101 text-xs font-semibold text-[#A67C52] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Đặt lại
              </button>
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-4">
              {/* Keyword */}
              <div className="form-group client-clean-102">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Từ khóa
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tên đường, địa chỉ..."
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                />
              </div>

              {/* Tỉnh / Thành phố */}
              <div className="form-group client-clean-102">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Tỉnh / Thành phố
                </label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setWard('');
                  }}
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                >
                  <option value="">-- Toàn quốc --</option>
                  {provincesList.length > 0 ? (
                    provincesList.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Thành phố Hà Nội">Hà Nội</option>
                      <option value="Thành phố Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Thành phố Đà Nẵng">Đà Nẵng</option>
                    </>
                  )}
                </select>
              </div>

              {/* Phường / Xã */}
              <div className="form-group client-clean-102">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Phường / Xã
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={!province || wardsList.length === 0}
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {province ? (wardsList.length === 0 ? 'Đang tải phường/xã...' : '-- Chọn phường / xã --') : '-- Chọn tỉnh trước --'}
                  </option>
                  {wardsList.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loại phòng */}
              <div className="form-group client-clean-102">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Loại phòng
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                >
                  <option value="">-- Tất cả loại phòng --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug || c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mức giá */}
              <div className="form-group client-clean-102">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Mức giá thuê
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                >
                  <option value="">-- Mọi mức giá --</option>
                  <option value="<2m">Dưới 2 triệu</option>
                  <option value="2-4m">2 triệu - 4 triệu</option>
                  <option value="4-7m">4 triệu - 7 triệu</option>
                  <option value=">7m">Trên 7 triệu</option>
                </select>
              </div>

              {/* Diện tích */}
              <div className="form-group client-clean-094 mb-4">
                <label className="client-clean-103 block text-xs font-bold text-[#1C1B19] mb-1.5">
                  Diện tích (m²)
                </label>
                <select
                  value={areaRange}
                  onChange={(e) => setAreaRange(e.target.value)}
                  className="client-clean-104 w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] text-xs font-medium text-[#1C1B19] outline-none focus:border-[#A67C52] focus:bg-white transition-all"
                >
                  <option value="">-- Mọi diện tích --</option>
                  <option value="<20">Dưới 20 m²</option>
                  <option value="20-30">20 - 30 m²</option>
                  <option value="30-50">30 - 50 m²</option>
                  <option value=">50">Trên 50 m²</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-hotelier btn-hotelier-dark w-full justify-between cursor-pointer"
              >
                <span>Áp dụng bộ lọc</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-filter text-[11px]"></i>
                </span>
              </button>
            </form>
          </aside>

          {/* Rooms Content */}
          <section className="room-content flex-1 w-full space-y-6">
            
            {/* Sort Bar */}
            <div className="sort-bar client-clean-106 flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#E6DFD3]">
              <span className="client-clean-107 text-xs font-bold text-[#6E6A63]">Sắp xếp theo:</span>
              <div className="client-clean-108 flex flex-wrap gap-2">
                {[
                  { key: 'newest', label: 'Mới nhất' },
                  { key: 'price-asc', label: 'Giá thấp đến cao' },
                  { key: 'price-desc', label: 'Giá cao đến thấp' },
                  { key: 'area-desc', label: 'Diện tích lớn' },
                  { key: 'views-desc', label: 'Xem nhiều nhất' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSortChange(item.key)}
                    className={`room-sort-link px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      sort === item.key
                        ? 'is-active bg-[#1C1B19] text-white border-[#1C1B19]'
                        : 'bg-[#FAF7F2] text-[#6E6A63] border-[#E6DFD3] hover:text-[#1C1B19] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Grid */}
            {loading ? (
              <div className="rooms-grid client-clean-109 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-[#E6DFD3]/40 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="rooms-grid client-clean-109 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    isFavorited={favoriteRoomIds.includes(room._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E6DFD3] space-y-3">
                <i className="fa-solid fa-house-chimney-crack text-4xl text-[#A67C52]/50"></i>
                <p className="text-base font-bold text-[#1C1B19]">Không tìm thấy phòng trọ nào phù hợp</p>
                <p className="text-xs text-[#6E6A63] max-w-sm mx-auto">
                  Vui lòng thử thay đổi khoảng giá, khu vực hoặc đặt lại tiêu chí lọc để xem thêm kết quả.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="btn-hotelier btn-hotelier-outline cursor-pointer"
                >
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-[#A67C52] text-white shadow-xs'
                        : 'bg-white border border-[#E6DFD3] text-[#6E6A63] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

          </section>

        </div>

      </div>
    </div>
  );
};
