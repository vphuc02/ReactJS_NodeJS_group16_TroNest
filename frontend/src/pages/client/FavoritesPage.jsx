import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/favoriteApi';
import { RoomCard } from '../../components/common/RoomCard';

export const FavoritesPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getFavorites();
      if (res.code === 200 && res.data) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (roomId, isFavorited) => {
    if (!isFavorited) {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    }
  };

  return (
    <main className="client-clean-001 pb-20">
      <div className="container">
        
        {/* Title Bar */}
        <div className="client-clean-094 mb-8">
          <h1 className="client-clean-116 text-3xl sm:text-4xl font-serif font-bold text-[#1C1B19] flex items-center gap-3">
            <i className="fa-solid fa-heart client-clean-013 text-rose-500"></i>
            <span>Phòng Trọ Đã Lưu Yêu Thích</span>
          </h1>
          <p className="client-clean-117 text-sm text-[#6E6A63] mt-1">
            Bạn đang lưu trữ <b className="client-clean-059 text-[#8C6239]">{rooms.length}</b> căn phòng yêu thích để so sánh và liên hệ
          </p>
        </div>

        {loading ? (
          <div className="rooms-grid client-clean-082 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-[#E6DFD3]/40 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="rooms-grid client-clean-082 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="client-clean-118 text-center py-20 bg-white rounded-3xl border border-[#E6DFD3] p-8 max-w-lg mx-auto shadow-xs">
            <i className="fa-regular fa-heart client-clean-119 text-5xl text-[#A67C52]/40 mb-3 block"></i>
            <h3 className="client-clean-120 font-serif font-bold text-xl text-[#1C1B19] mb-2">
              Chưa có phòng trọ nào trong danh sách yêu thích
            </h3>
            <p className="client-clean-121 text-xs text-[#6E6A63] leading-relaxed mb-6">
              Khi bạn thấy một căn phòng ưng ý, hãy nhấn vào biểu tượng trái tim để lưu lại và theo dõi bất cứ lúc nào!
            </p>
            <Link
              to="/rooms"
              className="client-clean-122 btn-hotelier btn-hotelier-bronze inline-flex no-underline"
            >
              <span>Khám phá phòng trọ ngay</span>
              <span className="btn-hotelier-icon">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
};
