import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { favoriteApi } from '../../api/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import { RoomCard } from '../../components/common/RoomCard';
import toast from 'react-hot-toast';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

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
          setActiveImage(r.thumbnail || r.images?.[0] || '/client/assets/images/product-1.jpg');
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

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#A67C52] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-[#6E6A63]">Đang tải thông tin phòng trọ...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-20 text-center space-y-4">
        <i className="fa-solid fa-house-chimney-crack text-5xl text-[#A67C52]"></i>
        <h2 className="text-2xl font-serif font-bold text-[#1C1B19]">Không tìm thấy phòng trọ</h2>
        <p className="text-sm text-[#6E6A63]">Phòng trọ này có thể đã bị gỡ hoặc không còn tồn tại trên hệ thống.</p>
        <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze inline-flex no-underline">
          <span>Xem các phòng khác</span>
        </Link>
      </div>
    );
  }

  const landlordName = room.landlordId?.fullName ? room.landlordId.fullName.replace(/\s*\([^)]*\)/g, '') : 'Chủ trọ TroNest';
  const landlordAvatar = room.landlordId?.avatar || '/admin/assets/images/avatar.jpg';

  return (
    <main className="client-clean-001 pb-20">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav className="client-clean-002 flex items-center gap-2 text-xs text-[#6E6A63] py-4 border-b border-[#E6DFD3] mb-6">
          <Link to="/" className="client-clean-003 text-[#6E6A63] hover:text-[#A67C52] no-underline">Trang chủ</Link>
          <span>/</span>
          <Link to="/rooms" className="client-clean-003 text-[#6E6A63] hover:text-[#A67C52] no-underline">Phòng trọ</Link>
          <span>/</span>
          {room.categoryId && (
            <>
              <Link to={`/rooms?category=${room.categoryId.slug || room.categoryId._id}`} className="client-clean-003 text-[#6E6A63] hover:text-[#A67C52] no-underline">
                {room.categoryId.title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="client-clean-004 text-[#1C1B19] font-semibold">{room.district}</span>
        </nav>

        {/* Room Detail Layout */}
        <div className="room-detail-layout client-clean-005 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Details Column */}
          <div className="room-main client-clean-006 flex-1 w-full space-y-6">
            
            {/* Title & Meta Bar */}
            <div className="client-clean-007 flex items-start justify-between gap-4 p-6 bg-white rounded-2xl border border-[#E6DFD3]">
              <div className="space-y-2">
                <span className="badge badge-green client-clean-008 inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#A67C52] border border-[#E6DFD3]">
                  {room.categoryId?.title || 'Phòng trọ'}
                </span>
                <h1 className="client-clean-009 text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] leading-snug m-0">
                  {room.title}
                </h1>
                <div className="client-clean-010 flex flex-wrap items-center gap-4 text-xs text-[#6E6A63] pt-1">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-location-dot client-clean-011 text-[#A67C52]"></i>
                    <span>{room.address}, {room.ward ? `${room.ward}, ` : ''}{room.district}, {room.province}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-eye client-clean-012 text-[#9A9389]"></i>
                    <span>{room.views || 0} lượt xem</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-clock client-clean-012 text-[#9A9389]"></i>
                    <span>{new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
                  </span>
                </div>
              </div>

              {/* Heart Button */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`btn-fav room-detail-fav w-11 h-11 rounded-full border border-[#E6DFD3] flex items-center justify-center text-lg transition-all cursor-pointer shadow-xs ${
                  isFavorited ? 'active bg-rose-50 text-rose-500 border-rose-300' : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                }`}
                title="Lưu phòng yêu thích"
              >
                <i className={`fa-solid fa-heart ${isFavorited ? 'client-clean-013 text-rose-500' : ''}`}></i>
              </button>
            </div>

            {/* Gallery Images */}
            <div className="room-gallery client-clean-014 bg-white p-4 rounded-2xl border border-[#E6DFD3] space-y-3">
              <div className="main-image client-clean-015 aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#F5EFE6]">
                <img
                  src={activeImage}
                  alt={room.title}
                  className="client-clean-016 w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/client/assets/images/product-1.jpg';
                  }}
                />
              </div>

              {room.images?.length > 1 && (
                <div className="thumb-list client-clean-017 flex items-center gap-2 overflow-x-auto pb-1">
                  {room.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setActiveImage(img)}
                      className={`client-clean-018 w-20 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                        activeImage === img ? 'border-[#A67C52] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Highlights Specs Box */}
            <div className="highlight-specs client-clean-019 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD3]">
              <div>
                <span className="client-clean-020 block text-xs text-[#6E6A63]">Giá thuê</span>
                <b className="client-clean-021 text-xl font-bold text-[#8C6239]">
                  {(room.price || 0).toLocaleString('vi-VN')} đ/tháng
                </b>
              </div>
              <div>
                <span className="client-clean-020 block text-xs text-[#6E6A63]">Diện tích</span>
                <b className="client-clean-022 text-xl font-bold text-[#1C1B19]">
                  {room.area} m²
                </b>
              </div>
              <div>
                <span className="client-clean-020 block text-xs text-[#6E6A63]">Tiền đặt cọc</span>
                <b className="client-clean-022 text-base font-bold text-[#1C1B19]">
                  {room.deposit ? `${room.deposit.toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                </b>
              </div>
              <div>
                <span className="client-clean-020 block text-xs text-[#6E6A63]">Sức chứa</span>
                <b className="client-clean-022 text-base font-bold text-[#1C1B19]">
                  {room.capacity || 2} người
                </b>
              </div>
            </div>

            {/* Chi Phí Dịch Vụ */}
            <div className="service-fees client-clean-023 bg-white p-5 rounded-2xl border border-[#E6DFD3]">
              <h3 className="client-clean-024 font-serif font-bold text-base text-[#1C1B19] flex items-center gap-2 mb-3">
                <i className="fa-solid fa-bolt client-clean-025 text-[#A67C52]"></i>
                <span>Chi phí dịch vụ tham khảo</span>
              </h3>
              <div className="client-clean-026 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD3]">
                  <span className="client-clean-003 text-[#6E6A63]">Tiền điện: </span>
                  <b className="client-clean-027 text-[#1C1B19] font-bold">{room.electricityPrice || '3.500 đ/kWh'}</b>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD3]">
                  <span className="client-clean-003 text-[#6E6A63]">Tiền nước: </span>
                  <b className="client-clean-027 text-[#1C1B19] font-bold">{room.waterPrice || '100.000 đ/người'}</b>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD3]">
                  <span className="client-clean-003 text-[#6E6A63]">Dịch vụ khác: </span>
                  <b className="client-clean-027 text-[#1C1B19] font-bold">{room.servicePrice || 'Miễn phí'}</b>
                </div>
              </div>
            </div>

            {/* Tiện Ích */}
            {room.amenities?.length > 0 && (
              <div className="room-amenities client-clean-014 bg-white p-5 rounded-2xl border border-[#E6DFD3]">
                <h3 className="client-clean-028 font-serif font-bold text-lg text-[#1C1B19] mb-4">
                  Tiện ích & Cơ sở vật chất
                </h3>
                <div className="amenities-grid client-clean-029 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities.map((item, idx) => (
                    <div key={idx} className="client-clean-030 flex items-center gap-2 text-xs font-medium text-[#1C1B19]">
                      <i className="fa-solid fa-circle-check client-clean-031 text-emerald-600"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mô Tả Chi Tiết */}
            <div className="room-description client-clean-032 bg-white p-6 rounded-2xl border border-[#E6DFD3]">
              <h3 className="client-clean-033 font-serif font-bold text-lg text-[#1C1B19] mb-3">
                Mô tả chi tiết
              </h3>
              <div className="client-clean-034 text-sm text-[#3D3A35] leading-relaxed whitespace-pre-line">
                {room.description || 'Chưa có thông tin mô tả chi tiết từ chủ nhà.'}
              </div>
            </div>

          </div>

          {/* Sidebar Landlord Contact Column */}
          <aside className="landlord-sidebar client-clean-035 w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Landlord Contact Card */}
            <div className="landlord-card client-clean-036 bg-white p-6 rounded-2xl border border-[#E6DFD3] text-center shadow-xs">
              <div className="client-clean-037 relative inline-block mb-3">
                <img
                  src={landlordAvatar}
                  alt={landlordName}
                  className="client-clean-038 w-20 h-20 rounded-full object-cover border-2 border-[#E6DFD3] mx-auto"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/admin/assets/images/avatar.jpg';
                  }}
                />
                <span className="client-clean-039 absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs" title="Chủ trọ đã được duyệt xác thực">
                  <i className="fa-solid fa-check"></i>
                </span>
              </div>

              <h3 className="client-clean-040 font-serif text-xl font-bold text-[#1C1B19] m-0">
                {room.landlordId?._id ? (
                  <Link to={`/landlords/${room.landlordId._id}`} className="text-inherit hover:text-[#A67C52] no-underline">
                    {landlordName}
                  </Link>
                ) : (
                  landlordName
                )}
              </h3>

              <span className="badge badge-green client-clean-041 inline-block mt-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Chủ trọ uy tín (Đã duyệt)
              </span>

              {room.landlordId?._id && (
                <Link
                  to={`/landlords/${room.landlordId._id}`}
                  className="w-full mt-3 mb-2 py-2 px-3 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] hover:bg-[#F5EFE6] text-[#8C6239] text-xs font-bold flex items-center justify-center gap-2 no-underline transition-all shadow-2xs"
                  title="Xem hồ sơ và toàn bộ bài đăng của chủ trọ"
                >
                  <i className="fa-solid fa-user-tie"></i>
                  <span>Xem thông tin chi tiết chủ trọ</span>
                </Link>
              )}

              {room.landlordId?.phone ? (
                <div className="space-y-2 mt-4">
                  <div className="client-clean-042">
                    <a
                      href={`tel:${room.landlordId.phone}`}
                      className="client-clean-043 w-full py-2.5 rounded-xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold flex items-center justify-center gap-2 no-underline shadow-xs transition-colors"
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>{room.landlordId.phone}</span>
                    </a>
                  </div>

                  <div className="client-clean-044">
                    <a
                      href={`https://zalo.me/${room.landlordId.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="client-clean-045 w-full py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 no-underline"
                    >
                      <i className="fa-solid fa-comment-dots text-sky-600"></i>
                      <span>Nhắn tin Zalo</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="client-clean-046 text-xs text-[#6E6A63] mt-3">Liên hệ hỗ trợ TroNest</p>
              )}

              <hr className="client-clean-047 my-4 border-[#E6DFD3]" />

              <div className="client-clean-048 space-y-2 text-xs text-left text-[#6E6A63]">
                {room.landlordId?.email && (
                  <div className="flex items-center gap-2 truncate">
                    <i className="fa-regular fa-envelope client-clean-049 text-[#A67C52] shrink-0"></i>
                    <span className="truncate">{room.landlordId.email}</span>
                  </div>
                )}
                {room.landlordId?.address && (
                  <div className="flex items-center gap-2 truncate">
                    <i className="fa-solid fa-location-dot client-clean-049 text-[#A67C52] shrink-0"></i>
                    <span className="truncate">{room.landlordId.address}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Safe Rental Advice */}
            <div className="advice-box client-clean-050 bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70 text-xs text-amber-900 space-y-2.5">
              <div className="client-clean-051 font-bold flex items-center gap-2 text-amber-950">
                <i className="fa-solid fa-shield-halved text-amber-600"></i>
                <span>Lưu ý an toàn khi thuê phòng</span>
              </div>
              <ul className="client-clean-052 list-disc pl-4 space-y-1 text-amber-800">
                <li>Không chuyển tiền cọc khi chưa xem phòng trực tiếp.</li>
                <li>Kiểm tra kỹ hợp đồng thuê và các khoản phí dịch vụ phát sinh.</li>
                <li>Báo cáo với Ban quản trị TroNest nếu phát hiện tin giả.</li>
              </ul>
            </div>

          </aside>

        </div>

        {/* Related Rooms */}
        {relatedRooms.length > 0 && (
          <section className="client-clean-053 mt-16 pt-10 border-t border-[#E6DFD3]">
            <h2 className="client-clean-054 text-2xl font-serif font-bold text-[#1C1B19] mb-6">
              Phòng trọ tương tự trong khu vực
            </h2>
            <div className="rooms-grid client-clean-055 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </main>
  );
};
