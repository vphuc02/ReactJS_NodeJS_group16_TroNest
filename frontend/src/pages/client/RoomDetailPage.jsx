import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { favoriteApi } from '../../api/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import { RoomCard } from '../../components/common/RoomCard';
import { resolveAvatar, handleAvatarError, handleRoomImageError } from '../../utils/avatar';
import toast from 'react-hot-toast';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals & UI States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Copy states
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Report Form States
  const [reportReason, setReportReason] = useState('Phòng đã được cho thuê / Hết phòng');
  const [reportDetail, setReportDetail] = useState('');

  // Fetch Room Detail
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await roomApi.getRoomDetail(id);
        if (res.code === 200 && res.data) {
          const r = res.data.room;
          setRoom(r);
          setRelatedRooms(res.data.relatedRooms || []);
          setIsFavorited(Boolean(res.data.isFavorited));
          setActiveImageIndex(0);
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết phòng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Deduplicate and prepare image list
  const allImages = useMemo(() => {
    if (!room) return [];
    const list = [];
    if (room.thumbnail) list.push(room.thumbnail);
    if (Array.isArray(room.images)) {
      room.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/client/assets/images/product-1.jpg'];
  }, [room]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu phòng yêu thích!');
      return;
    }

    try {
      if (isFavorited) {
        await favoriteApi.removeFavorite(room._id);
        setIsFavorited(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await favoriteApi.addFavorite(room._id);
        setIsFavorited(true);
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
    } catch {
      toast.error('Không thể cập nhật danh sách yêu thích!');
    }
  };

  // Copy helpers
  const handleCopyAddress = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success('Đã sao chép địa chỉ phòng!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success('Đã sao chép số điện thoại!');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Đã sao chép liên kết phòng vào bộ nhớ tạm!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle report submission
  const handleSubmitReport = (e) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    toast.success('Cảm ơn bạn đã báo cáo! Ban quản trị TroNest sẽ kiểm tra và xác minh tin đăng.');
    setReportDetail('');
  };

  // Map amenities to icons and styles
  const getAmenityConfig = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('điều hòa') || lower.includes('máy lạnh')) {
      return { icon: 'fa-solid fa-snowflake', color: 'text-sky-500 bg-sky-50 border-sky-200' };
    }
    if (lower.includes('nóng lạnh') || lower.includes('bình nóng') || lower.includes('nước nóng')) {
      return { icon: 'fa-solid fa-shower', color: 'text-amber-500 bg-amber-50 border-amber-200' };
    }
    if (lower.includes('tủ lạnh')) {
      return { icon: 'fa-solid fa-cube', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' };
    }
    if (lower.includes('máy giặt')) {
      return { icon: 'fa-solid fa-soap', color: 'text-blue-500 bg-blue-50 border-blue-200' };
    }
    if (lower.includes('giường') || lower.includes('nệm') || lower.includes('đệm')) {
      return { icon: 'fa-solid fa-bed', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' };
    }
    if (lower.includes('tủ quần áo') || lower.includes('tủ áo')) {
      return { icon: 'fa-solid fa-door-closed', color: 'text-stone-600 bg-stone-50 border-stone-200' };
    }
    if (lower.includes('bếp') || lower.includes('nấu ăn') || lower.includes('hút mùi')) {
      return { icon: 'fa-solid fa-kitchen-set', color: 'text-orange-500 bg-orange-50 border-orange-200' };
    }
    if (lower.includes('ban công') || lower.includes('cửa sổ')) {
      return { icon: 'fa-solid fa-sun', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (lower.includes('thang máy')) {
      return { icon: 'fa-solid fa-elevator', color: 'text-teal-600 bg-teal-50 border-teal-200' };
    }
    if (lower.includes('vân tay') || lower.includes('thẻ từ') || lower.includes('khóa điện tử')) {
      return { icon: 'fa-solid fa-fingerprint', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    }
    if (lower.includes('an ninh') || lower.includes('camera') || lower.includes('bảo vệ')) {
      return { icon: 'fa-solid fa-shield-halved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (lower.includes('giờ') || lower.includes('tự do')) {
      return { icon: 'fa-regular fa-clock', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (lower.includes('không chung chủ') || lower.includes('riêng chủ')) {
      return { icon: 'fa-solid fa-key', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (lower.includes('xe') || lower.includes('để xe')) {
      return { icon: 'fa-solid fa-motorcycle', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
    if (lower.includes('wifi') || lower.includes('mạng') || lower.includes('internet')) {
      return { icon: 'fa-solid fa-wifi', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
    if (lower.includes('vệ sinh') || lower.includes('wc') || lower.includes('khép kín')) {
      return { icon: 'fa-solid fa-bath', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
    }
    return { icon: 'fa-solid fa-circle-check', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  // Skeleton loading view
  if (loading) {
    return (
      <div className="w-[96%] max-w-[1400px] mx-auto px-2 sm:px-4 pt-2 pb-12 space-y-4">
        <div className="h-6 w-72 bg-[#E6DFD3]/60 rounded-full animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="h-80 sm:h-96 w-full bg-[#E6DFD3]/50 rounded-3xl animate-pulse"></div>
            <div className="h-36 sm:h-44 w-full bg-[#E6DFD3]/40 rounded-3xl animate-pulse"></div>
            <div className="h-56 sm:h-64 w-full bg-[#E6DFD3]/40 rounded-3xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="h-72 sm:h-80 w-full bg-[#E6DFD3]/50 rounded-3xl animate-pulse"></div>
            <div className="h-36 sm:h-40 w-full bg-[#E6DFD3]/40 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found view
  if (!room) {
    return (
      <div className="w-[96%] max-w-[800px] mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-[#F5EFE6] text-[#A67C52] flex items-center justify-center mx-auto text-3xl shadow-xs">
          <i className="fa-solid fa-house-chimney-crack"></i>
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#1C1B19]">Không tìm thấy phòng trọ</h2>
        <p className="text-sm text-[#6E6A63] max-w-md mx-auto leading-relaxed">
          Phòng trọ này có thể đã được chủ trọ cho thuê, bị gỡ bài hoặc đường dẫn chưa chính xác.
        </p>
        <div className="pt-2">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold transition-all shadow-md no-underline"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Khám phá các phòng trọ khác</span>
          </Link>
        </div>
      </div>
    );
  }

  const landlordName = room.landlordId?.fullName
    ? room.landlordId.fullName.replace(/\s*\([^)]*\)/g, '')
    : 'Chủ trọ TroNest';
  const landlordAvatar = resolveAvatar(room.landlordId?.avatar);
  const fullAddress = [room.address, room.ward, room.district, room.province].filter(Boolean).join(', ');
  const roomCode = `#TN-${(room._id || '').slice(-6).toUpperCase()}`;
  const pricePerM2 = room.price && room.area ? Math.round(room.price / room.area) : null;

  return (
    <div className="pb-16 pt-2 sm:pt-3">
      <div className="w-[96%] max-w-[1400px] mx-auto px-2 sm:px-4">
        
        {/* Top Header & Breadcrumbs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-0.5 sm:py-1 border-b border-[#E6DFD3] mb-2 sm:mb-3 text-xs text-[#6E6A63]">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link to="/" className="text-[#6E6A63] hover:text-[#A67C52] no-underline flex items-center gap-1.5 transition-colors">
              <i className="fa-solid fa-house text-[11px]"></i>
              <span>Trang chủ</span>
            </Link>
            <span className="text-[#C5BCAD]">/</span>
            <Link to="/rooms" className="text-[#6E6A63] hover:text-[#A67C52] no-underline transition-colors">
              Phòng trọ
            </Link>
            {room.categoryId && (
              <>
                <span className="text-[#C5BCAD]">/</span>
                <Link
                  to={`/rooms?category=${room.categoryId.slug || room.categoryId._id}`}
                  className="text-[#6E6A63] hover:text-[#A67C52] no-underline transition-colors"
                >
                  {room.categoryId.title}
                </Link>
              </>
            )}
            {room.district && (
              <>
                <span className="text-[#C5BCAD]">/</span>
                <Link
                  to={`/rooms?district=${encodeURIComponent(room.district)}`}
                  className="text-[#6E6A63] hover:text-[#A67C52] no-underline transition-colors"
                >
                  {room.district}
                </Link>
              </>
            )}
            <span className="text-[#C5BCAD]">/</span>
            <span className="text-[#1C1B19] font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {roomCode}
            </span>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 rounded-full border border-[#E6DFD3] bg-white hover:bg-[#F5EFE6] text-[#1C1B19] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Quay lại trang trước"
            >
              <i className="fa-solid fa-arrow-left text-[11px]"></i>
              <span className="hidden sm:inline">Quay lại</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="px-3 py-1.5 rounded-full border border-[#E6DFD3] bg-white hover:bg-[#F5EFE6] text-[#1C1B19] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Chia sẻ tin đăng này"
            >
              <i className={`fa-solid ${copiedLink ? 'fa-check text-emerald-600' : 'fa-share-nodes text-[#A67C52]'}`}></i>
              <span className="hidden sm:inline">{copiedLink ? 'Đã sao chép link' : 'Chia sẻ'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isFavorited
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-[#E6DFD3] text-[#1C1B19] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
              }`}
              title={isFavorited ? 'Bỏ lưu phòng yêu thích' : 'Lưu phòng yêu thích'}
            >
              <i className={`fa-solid fa-heart ${isFavorited ? 'text-rose-500 scale-110' : 'text-slate-400'}`}></i>
              <span className="hidden sm:inline">{isFavorited ? 'Đã lưu' : 'Lưu tin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-8 h-8 rounded-full border border-[#E6DFD3] bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Báo cáo tin đăng có sai sót hoặc vi phạm"
            >
              <i className="fa-regular fa-flag text-xs"></i>
            </button>
          </div>
        </div>

        {/* Main Grid Layout: Left Column (Gallery + Details), Right Column (Landlord Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Metadata Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-3.5">
              
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#8C6239] border border-[#E6DFD3]">
                  <i className="fa-solid fa-tag text-[10px]"></i>
                  {room.categoryId?.title || 'Phòng trọ'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <i className="fa-solid fa-shield-check text-emerald-600"></i>
                  Đã kiểm duyệt 100%
                </span>

                {room.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <i className="fa-solid fa-star text-amber-500 text-[11px]"></i>
                    Tin nổi bật
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang mở cho thuê
                </span>
              </div>

              {/* Room Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-serif font-bold text-[#1C1B19] leading-snug tracking-tight m-0">
                {room.title}
              </h1>

              {/* Address row with Copy button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#6E6A63] border-t border-[#F5EFE6]">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-[#A67C52] text-sm shrink-0"></i>
                  <span className="font-medium text-[#2A2825]">{fullAddress}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAddress(fullAddress)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DFD3] text-[#8C6239] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Sao chép địa chỉ"
                >
                  <i className={`fa-regular ${copiedAddress ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                  <span>{copiedAddress ? 'Đã sao chép' : 'Sao chép địa chỉ'}</span>
                </button>
              </div>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#9A9389] pt-1">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-hashtag text-[#A67C52]"></i>
                  <span>Mã tin: <strong className="text-[#1C1B19]">{roomCode}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-clock text-[#A67C52]"></i>
                  <span>Đăng ngày: {new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-eye text-[#A67C52]"></i>
                  <span>{room.views || 0} lượt xem</span>
                </span>
              </div>

            </div>

            {/* Gallery Images with Interactive Lightbox & Carousel */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-3">
              
              {/* Main Image Container */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#F5EFE6] group shadow-inner">
                <img
                  src={allImages[activeImageIndex]}
                  alt={room.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                  onError={handleRoomImageError}
                />

                {/* Gradient overlay for badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

                {/* Top Badge: Image Counter */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                    <i className="fa-regular fa-images text-[11px]"></i>
                    <span>{activeImageIndex + 1} / {allImages.length} ảnh</span>
                  </span>
                </div>

                {/* Top Right: Fullscreen Lightbox Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-[#8C6239] flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-xs"
                  title="Xem ảnh phóng to toàn màn hình"
                >
                  <i className="fa-solid fa-expand text-xs"></i>
                </button>

                {/* Prev / Next Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1C1B19] flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer border border-[#E6DFD3]"
                      title="Ảnh trước"
                    >
                      <i className="fa-solid fa-chevron-left text-xs"></i>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1C1B19] flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer border border-[#E6DFD3]"
                      title="Ảnh tiếp theo"
                    >
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </>
                )}

                {/* Bottom hint banner */}
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1C1B19] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md backdrop-blur-md transition-all"
                >
                  <i className="fa-solid fa-magnifying-glass-plus text-[#A67C52]"></i>
                  <span>Nhấn để phóng to ảnh</span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 sm:w-24 h-16 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer p-0 bg-[#F5EFE6] ${
                        activeImageIndex === idx
                          ? 'border-[#8C6239] ring-2 ring-[#8C6239]/20 scale-102 opacity-100'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Ảnh thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleRoomImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Specifications Box */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs">
              <h2 className="text-lg font-serif font-bold text-[#1C1B19] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-[#A67C52]"></i>
                <span>Thông tin phòng cốt lõi</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Giá thuê */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                    <i className="fa-solid fa-coins text-[#8C6239]"></i>
                    <span>Giá thuê</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#8C6239]">
                    {(room.price || 0).toLocaleString('vi-VN')} <span className="text-xs font-sans font-normal text-[#6E6A63]">đ/tháng</span>
                  </div>
                  {pricePerM2 && (
                    <div className="text-[11px] text-[#9A9389]">
                      ~{pricePerM2.toLocaleString('vi-VN')} đ/m²
                    </div>
                  )}
                </div>

                {/* Diện tích */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                    <i className="fa-solid fa-vector-square text-[#A67C52]"></i>
                    <span>Diện tích</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#1C1B19]">
                    {room.area} <span className="text-xs font-sans font-normal text-[#6E6A63]">m²</span>
                  </div>
                  <div className="text-[11px] text-[#9A9389]">
                    Rộng rãi & thoáng mát
                  </div>
                </div>

                {/* Tiền cọc */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                    <i className="fa-solid fa-vault text-[#A67C52]"></i>
                    <span>Tiền đặt cọc</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#1C1B19] truncate">
                    {room.deposit ? `${room.deposit.toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                  </div>
                  <div className="text-[11px] text-[#9A9389]">
                    {room.deposit ? 'Bảo đảm hợp đồng' : 'Trao đổi cùng chủ trọ'}
                  </div>
                </div>

                {/* Sức chứa */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                    <i className="fa-solid fa-users text-[#A67C52]"></i>
                    <span>Sức chứa</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#1C1B19]">
                    {room.capacity || 2} <span className="text-xs font-normal text-[#6E6A63]">người</span>
                  </div>
                  <div className="text-[11px] text-[#9A9389]">
                    Tối đa {room.capacity || 2} người ở
                  </div>
                </div>

              </div>
            </div>

            {/* Chi Phí Dịch Vụ Minh Bạch */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-[#1C1B19] m-0 flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-[#A67C52]"></i>
                  <span>Biểu phí dịch vụ minh bạch</span>
                </h2>
                <span className="text-xs text-[#6E6A63]">Quy định rõ trong hợp đồng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-base">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div>
                    <span className="block text-xs text-[#6E6A63]">Tiền điện</span>
                    <strong className="text-sm font-bold text-[#1C1B19]">
                      {room.electricityPrice || '3.500 đ/kWh'}
                    </strong>
                    <span className="block text-[11px] text-[#9A9389]">Công tơ điện riêng</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-base">
                    <i className="fa-solid fa-droplet"></i>
                  </div>
                  <div>
                    <span className="block text-xs text-[#6E6A63]">Tiền nước</span>
                    <strong className="text-sm font-bold text-[#1C1B19]">
                      {room.waterPrice || '100.000 đ/người/tháng'}
                    </strong>
                    <span className="block text-[11px] text-[#9A9389]">Nước sạch sinh hoạt</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-base">
                    <i className="fa-solid fa-wifi"></i>
                  </div>
                  <div>
                    <span className="block text-xs text-[#6E6A63]">Dịch vụ khác & Wifi</span>
                    <strong className="text-sm font-bold text-[#1C1B19]">
                      {room.servicePrice || 'Miễn phí / Thỏa thuận'}
                    </strong>
                    <span className="block text-[11px] text-[#9A9389]">Vệ sinh, rác & thang máy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiện Ích & Cơ Sở Vật Chất */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-[#1C1B19] m-0 flex items-center gap-2">
                  <i className="fa-solid fa-couch text-[#A67C52]"></i>
                  <span>Tiện ích & Cơ sở vật chất</span>
                </h2>
                <span className="text-xs text-[#6E6A63]">
                  {room.amenities?.length || 0} tiện ích sẵn có
                </span>
              </div>

              {room.amenities && room.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities.map((item, idx) => {
                    const cfg = getAmenityConfig(item);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all hover:shadow-2xs ${cfg.color}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 text-sm">
                          <i className={cfg.icon}></i>
                        </div>
                        <span className="text-xs font-bold text-[#1C1B19] truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs text-[#6E6A63] text-center">
                  Chủ nhà chưa cập nhật danh sách tiện ích cụ thể. Vui lòng liên hệ trực tiếp để biết thêm chi tiết.
                </div>
              )}
            </div>

            {/* Mô Tả Chi Tiết */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-4">
              <h2 className="text-lg font-serif font-bold text-[#1C1B19] m-0 flex items-center gap-2">
                <i className="fa-solid fa-align-left text-[#A67C52]"></i>
                <span>Mô tả chi tiết phòng trọ</span>
              </h2>

              <div className="relative">
                <div
                  className={`text-sm text-[#3D3A35] leading-relaxed whitespace-pre-line ${
                    !isDescExpanded && room.description?.length > 400
                      ? 'max-h-56 overflow-hidden'
                      : ''
                  }`}
                >
                  {room.description || 'Chưa có thông tin mô tả chi tiết từ chủ nhà.'}
                </div>

                {!isDescExpanded && room.description?.length > 400 && (
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center">
                    <button
                      type="button"
                      onClick={() => setIsDescExpanded(true)}
                      className="px-4 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DFD3] text-[#8C6239] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Xem toàn bộ mô tả</span>
                      <i className="fa-solid fa-chevron-down text-[11px]"></i>
                    </button>
                  </div>
                )}
              </div>

              {isDescExpanded && room.description?.length > 400 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(false)}
                    className="px-4 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DFD3] text-[#8C6239] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Thu gọn mô tả</span>
                    <i className="fa-solid fa-chevron-up text-[11px]"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Bản Đồ Vị Trí & Tiện Ích Lân Cận */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-serif font-bold text-[#1C1B19] m-0 flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-[#A67C52]"></i>
                  <span>Vị trí trên bản đồ & Chỉ đường</span>
                </h2>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold flex items-center gap-1.5 no-underline transition-colors shadow-xs"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
                  <span>Mở Google Maps</span>
                </a>
              </div>

              <div className="text-xs text-[#6E6A63] flex items-center gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DFD3]">
                <i className="fa-solid fa-location-dot text-[#A67C52] text-sm shrink-0"></i>
                <span className="font-semibold text-[#1C1B19]">{fullAddress}</span>
              </div>

              {/* Embedded Google Maps */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#E6DFD3] bg-[#F5EFE6]">
                <iframe
                  title="Bản đồ vị trí phòng trọ TroNest"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>

              {/* Tiện ích khu vực lân cận */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-center space-y-1">
                  <i className="fa-solid fa-graduation-cap text-[#A67C52] text-lg"></i>
                  <span className="block text-[11px] font-bold text-[#1C1B19]">Trường học & ĐH</span>
                  <span className="block text-[10px] text-[#9A9389]">Bán kính 1–3 km</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-center space-y-1">
                  <i className="fa-solid fa-bus text-[#A67C52] text-lg"></i>
                  <span className="block text-[11px] font-bold text-[#1C1B19]">Điểm xe Buýt</span>
                  <span className="block text-[10px] text-[#9A9389]">Cách 200–500m</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-center space-y-1">
                  <i className="fa-solid fa-basket-shopping text-[#A67C52] text-lg"></i>
                  <span className="block text-[11px] font-bold text-[#1C1B19]">Chợ & WinMart</span>
                  <span className="block text-[10px] text-[#9A9389]">Gần cổng ngõ</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-center space-y-1">
                  <i className="fa-solid fa-hospital text-[#A67C52] text-lg"></i>
                  <span className="block text-[11px] font-bold text-[#1C1B19]">Bệnh viện & Trạm xá</span>
                  <span className="block text-[10px] text-[#9A9389]">Tiện di chuyển</span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: 4 Columns (Sticky Landlord Sidebar) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[68px]">
            
            {/* Landlord Contact Profile Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DFD3] shadow-xs text-center space-y-5">
              
              {/* Landlord Avatar with verification shield */}
              <div className="relative inline-block mx-auto">
                <img
                  src={landlordAvatar}
                  alt={landlordName}
                  className="w-24 h-24 rounded-full object-cover border-3 border-[#A67C52]/30 shadow-md mx-auto"
                  onError={handleAvatarError}
                />
                <span
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white"
                  title="Chủ trọ đã được TroNest xác minh danh tính"
                >
                  <i className="fa-solid fa-check"></i>
                </span>
              </div>

              {/* Landlord Name & Badge */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1B19] m-0">
                  {room.landlordId?._id ? (
                    <Link
                      to={`/landlords/${room.landlordId._id}`}
                      className="text-inherit hover:text-[#8C6239] no-underline transition-colors"
                      title="Xem toàn bộ phòng và hồ sơ của chủ trọ"
                    >
                      {landlordName}
                    </Link>
                  ) : (
                    landlordName
                  )}
                </h3>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <i className="fa-solid fa-shield-check text-emerald-600"></i>
                  Chủ trọ xác thực (Đã duyệt)
                </span>
              </div>

              {/* View Landlord Profile Link */}
              {room.landlordId?._id && (
                <Link
                  to={`/landlords/${room.landlordId._id}`}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] hover:bg-[#F5EFE6] text-[#8C6239] text-xs font-bold flex items-center justify-center gap-2 no-underline transition-all shadow-2xs"
                  title="Xem hồ sơ và toàn bộ bài đăng của chủ trọ này"
                >
                  <i className="fa-solid fa-user-tie"></i>
                  <span>Xem hồ sơ & bài đăng chủ trọ</span>
                </Link>
              )}

              {/* Contact Actions */}
              <div className="space-y-3 pt-1">
                {room.landlordId?.phone ? (
                  <>
                    {/* Call Button */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${room.landlordId.phone}`}
                        className="flex-1 py-3 px-4 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold flex items-center justify-center gap-2 no-underline shadow-md transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-phone text-sm"></i>
                        <span>{room.landlordId.phone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(room.landlordId.phone)}
                        className="w-11 h-11 rounded-2xl border border-[#E6DFD3] bg-[#FAF7F2] hover:bg-[#F5EFE6] text-[#8C6239] flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
                        title="Sao chép số điện thoại"
                      >
                        <i className={`fa-regular ${copiedPhone ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                      </button>
                    </div>

                    {/* Zalo Button */}
                    <a
                      href={`https://zalo.me/${room.landlordId.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-2 no-underline shadow-md transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-comment-dots text-sm"></i>
                      <span>Nhắn tin Zalo trực tiếp</span>
                    </a>

                    {/* Facebook Button */}
                    {room.landlordId?.facebook && (
                      <a
                        href={room.landlordId.facebook.startsWith('http') ? room.landlordId.facebook : `https://${room.landlordId.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2 no-underline shadow-md transition-all cursor-pointer"
                      >
                        <i className="fa-brands fa-facebook text-sm"></i>
                        <span>Liên hệ qua Facebook</span>
                      </a>
                    )}
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 text-xs text-amber-800">
                    Chủ nhà chưa cập nhật số điện thoại. Bạn có thể gửi phản hồi để TroNest hỗ trợ liên hệ.
                  </div>
                )}
              </div>

              {/* Extra Landlord Details */}
              <div className="pt-4 border-t border-[#E6DFD3] space-y-2 text-xs text-left text-[#6E6A63]">
                {room.landlordId?.email && (
                  <div className="flex items-center gap-2.5 truncate">
                    <i className="fa-regular fa-envelope text-[#A67C52] shrink-0 text-sm"></i>
                    <span className="truncate">{room.landlordId.email}</span>
                  </div>
                )}
                {room.landlordId?.address && (
                  <div className="flex items-center gap-2.5 truncate">
                    <i className="fa-solid fa-location-dot text-[#A67C52] shrink-0 text-sm"></i>
                    <span className="truncate">{room.landlordId.address}</span>
                  </div>
                )}
                {room.landlordId?.facebook && (
                  <div className="flex items-center gap-2.5 truncate">
                    <i className="fa-brands fa-facebook text-[#1877F2] shrink-0 text-sm"></i>
                    <a
                      href={room.landlordId.facebook.startsWith('http') ? room.landlordId.facebook : `https://${room.landlordId.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] hover:underline truncate no-underline font-medium"
                    >
                      Trang cá nhân Facebook
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <i className="fa-regular fa-circle-check text-emerald-600 shrink-0 text-sm"></i>
                  <span>Tỉ lệ phản hồi khách thuê: <strong>100%</strong></span>
                </div>
              </div>

            </div>

            {/* TroNest Safety & Rental Advice Box */}
            <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/80 text-xs text-amber-950 space-y-3 shadow-xs">
              <div className="font-bold flex items-center gap-2 text-amber-900 text-sm">
                <i className="fa-solid fa-shield-halved text-amber-600 text-base"></i>
                <span>Cam kết an tâm từ TroNest</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-amber-800 leading-relaxed">
                <li><strong>100% Tin thật:</strong> Mọi bài đăng đều qua kiểm duyệt thông tin & hình ảnh.</li>
                <li><strong>Không phí môi giới:</strong> Người thuê kết nối trực tiếp với chủ trọ hoàn toàn miễn phí.</li>
                <li><strong>Xem phòng trực tiếp:</strong> Tuyệt đối không chuyển tiền cọc khi chưa ký hợp đồng rõ ràng.</li>
              </ul>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800">
                <span>Cần trợ giúp? Hotline:</span>
                <strong className="text-amber-950">1900 8888 (24/7)</strong>
              </div>
            </div>

          </aside>

        </div>

        {/* RELATED ROOMS SECTION */}
        {relatedRooms.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#E6DFD3]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#A67C52] tracking-wider uppercase block mb-1">
                  Gợi ý lý tưởng
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] m-0">
                  Phòng trọ tương tự trong khu vực
                </h2>
              </div>
              <Link
                to={room.district ? `/rooms?district=${encodeURIComponent(room.district)}` : '/rooms'}
                className="text-xs font-bold text-[#8C6239] hover:text-[#6E4B26] no-underline flex items-center gap-1.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <i className="fa-solid fa-arrow-right text-[11px]"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {relatedRooms.map((related) => (
                <RoomCard
                  key={related._id}
                  room={related}
                  isFavorited={false}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Hiển thị cố định dưới cùng màn hình trên điện thoại) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DFD3] px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] text-[#6E6A63]">Giá thuê</span>
          <div className="text-lg font-serif font-extrabold text-[#8C6239] leading-tight">
            {(room.price || 0).toLocaleString('vi-VN')} <span className="text-[10px] font-sans font-normal text-[#6E6A63]">đ/th</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {room.landlordId?.phone ? (
            <>
              <a
                href={`https://zalo.me/${room.landlordId.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-[#0068FF] text-white text-xs font-bold flex items-center gap-1.5 no-underline shadow-xs"
              >
                <i className="fa-solid fa-comment-dots"></i>
                <span>Zalo</span>
              </a>

              <a
                href={`tel:${room.landlordId.phone}`}
                className="px-4 py-2.5 rounded-xl bg-[#8C6239] text-white text-xs font-bold flex items-center gap-1.5 no-underline shadow-md"
              >
                <i className="fa-solid fa-phone"></i>
                <span>Gọi ngay</span>
              </a>
            </>
          ) : (
            <a
              href="tel:19008888"
              className="px-4 py-2.5 rounded-xl bg-[#8C6239] text-white text-xs font-bold flex items-center gap-1.5 no-underline shadow-md"
            >
              <i className="fa-solid fa-phone"></i>
              <span>Hỗ trợ TroNest</span>
            </a>
          )}
        </div>
      </div>

      {/* LIGHTBOX FULLSCREEN IMAGE VIEWER MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold flex items-center gap-2">
              <i className="fa-regular fa-images text-[#A67C52]"></i>
              <span>Ảnh {activeImageIndex + 1} / {allImages.length}</span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-white/70 text-xs hidden sm:inline truncate max-w-md">{room.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 hidden sm:inline">Dùng phím mũi tên ← → hoặc ESC</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                title="Đóng xem ảnh (ESC)"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          {/* Main Large Image with Prev/Next buttons */}
          <div
            className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[activeImageIndex]}
              alt={room.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
              onError={handleRoomImageError}
            />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-xl transition-all cursor-pointer"
                  title="Ảnh trước (Mũi tên trái)"
                >
                  <i className="fa-solid fa-chevron-left text-base"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % allImages.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-xl transition-all cursor-pointer"
                  title="Ảnh tiếp theo (Mũi tên phải)"
                >
                  <i className="fa-solid fa-chevron-right text-base"></i>
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div
            className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer p-0 ${
                  activeImageIndex === idx
                    ? 'border-[#A67C52] scale-110 opacity-100 ring-2 ring-[#A67C52]/50'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" onError={handleRoomImageError} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REPORT LISTING MODAL */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E6DFD3] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <h3 className="text-base font-serif font-bold text-[#1C1B19] m-0">Báo cáo tin đăng phòng</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-7 h-7 rounded-full border border-[#E6DFD3] bg-[#FAF7F2] text-[#6E6A63] hover:text-[#1C1B19] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <p className="text-[#6E6A63]">
                Nếu bạn nhận thấy tin đăng này có thông tin sai lệch, đã hết phòng hoặc có dấu hiệu gian lận, hãy báo cho TroNest.
              </p>

              <div className="space-y-2">
                <label className="block font-bold text-[#1C1B19]">Lý do báo cáo:</label>
                {[
                  'Phòng đã được cho thuê / Hết phòng',
                  'Giá thuê hoặc phí thực tế cao hơn trong bài',
                  'Địa chỉ không đúng hoặc không tìm thấy phòng',
                  'Số điện thoại chủ trọ không liên lạc được',
                  'Dấu hiệu lừa đảo / Tin giả mạo'
                ].map((reason, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer text-[#1C1B19]">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="accent-[#8C6239]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block font-bold text-[#1C1B19] mb-1">Mô tả cụ thể (nếu có):</label>
                <textarea
                  rows="3"
                  placeholder="Ghi rõ chi tiết bạn gặp phải khi liên hệ hoặc đến xem phòng..."
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DFD3] bg-white text-[#1C1B19] focus:outline-none focus:border-[#8C6239] text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6DFD3] bg-white text-[#6E6A63] font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
