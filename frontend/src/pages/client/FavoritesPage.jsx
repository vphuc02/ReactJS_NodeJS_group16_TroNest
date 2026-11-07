import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/favoriteApi';
import { RoomCard } from '../../components/common/RoomCard';
import { Heart, Search } from 'lucide-react';

export const FavoritesPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await favoriteApi.getFavorites();
        if (res.code === 200 && res.data) {
          setRooms(res.data.rooms || []);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách yêu thích:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  const handleFavoriteToggle = (roomId, isFav) => {
    if (!isFav) {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#E6DFD3] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
          Không Gian Đã Lưu
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mt-1">
          Phòng Trọ Yêu Thích Của Bạn
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lưu lại để so sánh tiện nghi, chi phí và liên hệ chủ nhà bất cứ lúc nào.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E6DFD3] space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Bạn chưa lưu phòng trọ nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy khám phá các căn phòng và bấm biểu tượng trái tim để lưu lại vào danh sách này nhé.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#A67C52] text-white text-xs font-bold shadow-md hover:bg-[#8C6239] transition-all no-underline"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Khám Phá Phòng Ngay</span>
          </Link>
        </div>
      )}
    </div>
  );
};

