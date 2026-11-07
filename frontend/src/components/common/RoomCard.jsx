import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Maximize2, ShieldCheck, Eye } from 'lucide-react';
import { favoriteApi } from '../../api/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const RoomCard = ({ room, isFavorited: initialFavorited = false, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)} tr/tháng`;
    }
    return `${price.toLocaleString('vi-VN')} đ/tháng`;
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu phòng yêu thích!');
      return;
    }

    setFavLoading(true);
    try {
      if (isFav) {
        await favoriteApi.removeFavorite(room._id);
        setIsFav(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
        if (onFavoriteToggle) onFavoriteToggle(room._id, false);
      } else {
        await favoriteApi.addFavorite(room._id);
        setIsFav(true);
        toast.success('Đã thêm vào danh sách yêu thích!');
        if (onFavoriteToggle) onFavoriteToggle(room._id, true);
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích!');
    } finally {
      setFavLoading(false);
    }
  };

  const thumbnail = room.thumbnail || room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80';
  const locationString = [room.district, room.province].filter(Boolean).join(', ') || 'Chưa cập nhật vị trí';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#E6DFD3] hover:border-[#A67C52]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <Link to={`/rooms/detail/${room._id}`} className="block w-full h-full">
          <img
            src={thumbnail}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={favLoading}
          aria-label="Lưu phòng"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-md transition-all cursor-pointer z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
        </button>

        {/* Category & Verified Badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {room.categoryId && (
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#FAF7F2]/95 backdrop-blur-xs text-[#A67C52] border border-[#E6DFD3] shadow-xs">
              {room.categoryId.title || room.categoryId}
            </span>
          )}
          {room.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-500 text-white shadow-xs">
              Nổi bật
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#1C1B19]/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-none">
          <span className="text-sm font-extrabold text-[#FAF7F2] font-serif tracking-tight">
            {formatPrice(room.price)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Location & Area */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#A67C52] shrink-0" />
              <span className="truncate">{locationString}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700 shrink-0">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              {room.area} m²
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/rooms/detail/${room._id}`}
            className="block text-base font-bold text-slate-900 group-hover:text-[#A67C52] transition-colors line-clamp-2 leading-snug no-underline"
          >
            {room.title}
          </Link>
        </div>

        {/* Landlord & Views Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 truncate">
            <img
              src={room.landlordId?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"}
              alt="Chủ trọ"
              className="w-5 h-5 rounded-full object-cover border border-[#E6DFD3]"
            />
            <span className="truncate text-slate-600 font-medium text-[11px]">
              {room.landlordId?.fullName || "Chủ trọ xác thực"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            <Eye className="w-3.5 h-3.5" />
            <span>{room.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
