import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const RoomCard = ({ room, isFavorited: initialFavorited = false, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    setIsFav(initialFavorited);
  }, [initialFavorited]);

  if (!room) return null;

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

  const thumbnail = room.thumbnail || room.images?.[0] || '/client/assets/images/product-1.jpg';
  const imgCount = room.images?.length || (room.thumbnail ? 1 : 1);
  const catTitle = room.categoryId?.title || room.categoryId || 'Phòng trọ';
  const displayAddress = room.address || [room.ward, room.district, room.province].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ';
  const landlordName = room.landlordId?.fullName ? room.landlordId.fullName.replace(/\s*\([^)]*\)/g, '') : 'Chủ trọ xác thực';
  const landlordAvatar = room.landlordId?.avatar || '/admin/assets/images/avatar.jpg';
  const amenity1 = room.amenities?.[0] || 'WC khép kín';
  const amenity2 = room.amenities?.[1] || (room.capacity ? `${room.capacity} người` : 'Tự do giờ');

  return (
    <div className="product-item room-card-modern group relative flex flex-col overflow-hidden rounded-2xl border border-[#E6DFD3] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_38px_rgba(28,27,25,0.09)] hover:border-[#D4C2AA] cursor-pointer">
      
      {/* 1. Phần ảnh & Badge (Tỉ lệ 4:3 chuẩn) */}
      <div className="inner-image relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFE6] shrink-0">
        <Link to={`/rooms/detail/${room._id}`} className="block w-full h-full">
          <img
            src={thumbnail}
            alt={room.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/client/assets/images/product-1.jpg';
            }}
          />
        </Link>

        {/* Badge loại hình & Xác thực */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 pointer-events-none">
          {room.distanceM !== undefined && room.distanceM !== null && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
              <i className="fa-solid fa-location-arrow text-[10px]"></i>
              <span>{room.distanceM < 1000 ? `${Math.round(room.distanceM)}m` : `${(room.distanceM / 1000).toFixed(1)}km`}</span>
            </span>
          )}
          <span className="rounded-full bg-[#1C1B19]/75 px-2.5 py-1 text-[11px] font-medium text-[#FAF7F2] backdrop-blur-md border border-white/15">
            {catTitle}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#A67C52]/95 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md shadow-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Xác thực</span>
          </span>
        </div>

        {/* Nút lưu yêu thích (Heart) */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favLoading}
          className={`btn-fav absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#6E6A63] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 border-0 cursor-pointer pointer-events-auto ${
            isFav ? 'active text-red-500' : ''
          }`}
          title="Lưu vào danh sách yêu thích"
          aria-label="Lưu phòng"
        >
          <svg
            className={`h-4 w-4 transition-colors ${isFav ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Số lượng ảnh */}
        <span className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 rounded-full bg-[#1C1B19]/65 px-2.5 py-0.5 text-[11px] font-normal text-[#FAF7F2] backdrop-blur-sm pointer-events-none">
          <i className="fa-regular fa-images text-[10px] text-[#C59B6D]"></i>
          <span>{imgCount}</span>
        </span>
      </div>

      {/* 2. Phần nội dung chi tiết */}
      <div className="inner-content flex flex-1 flex-col p-4 z-[3]">
        {/* Giá tiền */}
        <div className="mb-1.5 flex items-baseline gap-1">
          <span className="price-main text-xl font-extrabold tracking-tight text-[#8C6239]">
            {(room.price || 0).toLocaleString('vi-VN')} đ
          </span>
          <span className="text-xs font-medium text-[#6E6A63]">/tháng</span>
          {room.isFeatured && (
            <span className="ml-auto text-[10px] uppercase font-bold text-[#8C6239] bg-[#F5EFE6] border border-[#E6DFD3] px-2.5 py-0.5 rounded-full">
              Nổi bật
            </span>
          )}
        </div>

        {/* Tiêu đề phòng */}
        <h3 className="inner-title line-clamp-2 font-serif text-[17px] font-semibold leading-snug text-[#1C1B19] transition-colors group-hover:text-[#A67C52] m-0">
          <Link to={`/rooms/detail/${room._id}`} className="text-[#1C1B19] group-hover:text-[#A67C52] no-underline">
            {room.title}
          </Link>
        </h3>

        {/* Địa chỉ rút gọn */}
        <p className="inner-address mt-1.5 flex items-center gap-1 text-xs text-[#6E6A63] mb-0">
          <svg className="h-3.5 w-3.5 shrink-0 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate" title={displayAddress}>{displayAddress}</span>
        </p>

        {/* Thông số kỹ thuật & tiện ích */}
        <div className="my-3 flex items-center gap-2.5 border-y border-[#F3EFE6] py-2.5 text-xs text-[#6E6A63]">
          <span className="font-semibold text-[#1C1B19]">{room.area} m²</span>
          <span className="text-[#D4C2AA]">•</span>
          <span>{amenity1}</span>
          <span className="text-[#D4C2AA]">•</span>
          <span>{amenity2}</span>
        </div>

        {/* 3. Footer card: Người đăng + Nút Chi tiết */}
        <div className="inner-footer mt-auto flex items-center justify-between pt-1">
          <div className="relative z-10 flex items-center gap-2">
            {landlordAvatar && !landlordAvatar.includes('avatar.jpg') ? (
              <img
                src={landlordAvatar}
                alt={landlordName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/admin/assets/images/avatar.jpg';
                }}
                className="h-7 w-7 rounded-full object-cover border border-[#E6DFD3]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1B19] text-xs font-semibold text-white border border-[#E6DFD3]">
                <i className="fa-solid fa-sparkles text-[10px] text-amber-400"></i>
              </div>
            )}
            <span className="text-xs font-medium text-[#6E6A63] truncate max-w-[120px]">
              {landlordName}
            </span>
            <svg className="w-3.5 h-3.5 text-[#A67C52] shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Chủ trọ đã xác thực">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          <Link
            to={`/rooms/detail/${room._id}`}
            className="flex items-center gap-1.5 rounded-full bg-[#F5EFE6] group-hover:bg-[#A67C52] text-[#8C6239] group-hover:text-white pl-3 pr-1.5 py-1 text-xs font-bold transition-all border border-[#E6DFD3] group-hover:border-[#A67C52] cursor-pointer shadow-2xs no-underline"
          >
            <span>Chi tiết</span>
            <span className="w-5 h-5 rounded-full bg-white/90 text-[#1C1B19] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

    </div>
  );
};
