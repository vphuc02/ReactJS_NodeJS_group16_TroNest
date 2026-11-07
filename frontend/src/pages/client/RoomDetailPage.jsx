import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { favoriteApi } from '../../api/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import { RoomCard } from '../../components/common/RoomCard';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Maximize2, 
  Heart, 
  Phone, 
  Share2, 
  ShieldCheck, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await roomApi.getRoomDetail(id);
        if (res.code === 200 && res.data) {
          setRoom(res.data.room);
          setIsFavorited(Boolean(res.data.isFavorited));
          setRelatedRooms(res.data.relatedRooms || []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể tải chi tiết phòng!');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

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
      toast.error('Không thể cập nhật yêu thích!');
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)} triệu/tháng`;
    }
    return `${price.toLocaleString('vi-VN')} đ/tháng`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-96 bg-slate-200/60 rounded-3xl animate-pulse mb-8"></div>
        <div className="h-48 bg-slate-200/60 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Phòng trọ này không tồn tại</h2>
        <p className="text-sm text-slate-500">Bài đăng có thể đã bị xóa hoặc chưa được kiểm duyệt.</p>
        <Link to="/rooms" className="inline-block px-6 py-2.5 rounded-full bg-[#A67C52] text-white font-bold text-xs">
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const allImages = room.images?.length > 0 ? room.images : [room.thumbnail || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];
  const fullAddress = [room.address, room.ward, room.district, room.province].filter(Boolean).join(', ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button & Meta */}
      <div className="flex items-center justify-between">
        <Link to="/rooms" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#A67C52] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách phòng</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-[#E6DFD3] text-slate-700 hover:bg-[#F5EFE6]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorited ? 'Đã Lưu Yêu Thích' : 'Lưu Tin'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photos & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="rounded-3xl overflow-hidden aspect-16/10 bg-slate-100 border border-[#E6DFD3] shadow-md">
              <img
                src={allImages[activeImage]}
                alt={room.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails list */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImage === idx ? 'border-[#A67C52] scale-102 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Title & Primary Specs */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {room.categoryId && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#A67C52] border border-[#E6DFD3]">
                    {room.categoryId.title}
                  </span>
                )}
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã Kiểm Duyệt
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-snug">
                {room.title}
              </h1>

              <p className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-[#A67C52] shrink-0" />
                <span>{fullAddress}</span>
              </p>
            </div>

            {/* Price & Area Highlight Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3]">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Giá Thuê</p>
                <p className="text-lg font-black text-[#8C6239] font-serif">{formatPrice(room.price)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Diện Tích</p>
                <p className="text-lg font-black text-slate-800 font-serif">{room.area} m²</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Đặt Cọc</p>
                <p className="text-lg font-black text-slate-800 font-serif">{room.deposit ? `${room.deposit.toLocaleString()} đ` : '1 tháng'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Lượt Xem</p>
                <p className="text-lg font-black text-slate-800 font-serif">{room.views || 0}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-slate-900 font-serif">Mô Tả Chi Tiết</h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {room.description || 'Chưa có thông tin mô tả chi tiết từ chủ nhà.'}
              </div>
            </div>

            {/* Amenities Grid */}
            {room.amenities?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-serif">Tiện Nghi & Dịch Vụ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Landlord Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-[#E6DFD3] shadow-md space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={room.landlordId?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt="Chủ trọ"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E6DFD3]"
              />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {room.landlordId?.fullName || "Chủ trọ TroNest"}
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Chủ trọ đã xác thực
                </span>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="space-y-3">
              <a
                href={`tel:${room.landlordId?.phone || '0912345678'}`}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-linear-to-r from-[#A67C52] to-[#8C6239] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#A67C52]/20 no-underline cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi Điện: {room.landlordId?.phone || '0912 345 678'}</span>
              </a>

              <a
                href={`https://zalo.me/${room.landlordId?.phone || '0912345678'}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-sm no-underline cursor-pointer"
              >
                <i className="fa-solid fa-comment-dots text-base"></i>
                <span>Nhắn Tin Qua Zalo</span>
              </a>
            </div>

            {/* Safety tips */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] text-[11px] text-slate-500 space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#A67C52]" />
                Lưu ý an toàn khi thuê phòng:
              </p>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li>Luôn đến xem phòng trực tiếp trước khi đặt cọc.</li>
                <li>Yêu cầu ký hợp đồng thuê có điều khoản rõ ràng.</li>
                <li>Không chuyển tiền cọc khi chưa kiểm tra hợp pháp căn nhà.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Related Rooms Section */}
      {relatedRooms.length > 0 && (
        <section className="pt-10 border-t border-[#E6DFD3] space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">Gợi Ý Tương Tự</span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">Phòng Cùng Khu Vực Hoặc Loại Hình</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedRooms.map((rel) => (
              <RoomCard key={rel._id} room={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

