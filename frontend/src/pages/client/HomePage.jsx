import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { RoomCard } from '../../components/common/RoomCard';
import { BronzeAmenityStrip } from '../../components/home/BronzeAmenityStrip';
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export const HomePage = () => {
  const [data, setData] = useState({
    categories: [],
    featuredRooms: [],
    latestRooms: [],
    favoriteRoomIds: []
  });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await roomApi.getHomeData();
        if (res.code === 200 && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword.trim());
    if (category) params.append('category', category);
    if (province) params.append('province', province);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Editorial Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F5EFE6]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E6DFD3] text-[#A67C52] text-xs font-bold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>Tiêu Chuẩn Lưu Trú Mới 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-serif leading-[1.15] tracking-tight">
                Không Gian Sống Tinh Tế, <br />
                <span className="text-[#A67C52] italic font-normal">Nghệ Thuật Của Sự An Cư.</span>
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                Lấy cảm hứng từ tiêu chuẩn lưu trú khách sạn boutique, TroNest mang đến trải nghiệm tìm phòng trọ, căn hộ studio và nhà nguyên căn chuẩn xác, minh bạch chi phí và an tâm tuyệt đối.
              </p>

              {/* Quick Search Box */}
              <form onSubmit={handleSearch} className="bg-white p-3 sm:p-4 rounded-3xl border border-[#E6DFD3] shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Nhập khu vực, đường, tên trường học..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none transition-all"
                  />
                </div>

                <div className="sm:w-44">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50/70 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none transition-all"
                  >
                    <option value="">Tất cả loại phòng</option>
                    {data.categories.map((cat) => (
                      <option key={cat._id} value={cat.slug || cat._id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#A67C52] hover:bg-[#8C6239] text-white text-xs font-bold transition-all shadow-md shadow-[#A67C52]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm Phòng</span>
                </button>
              </form>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Ảnh thực tế</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Miễn phí trung gian</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Xác thực chủ nhà</span>
                </span>
              </div>
            </div>

            {/* Right Banner Showcase */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden aspect-4/5 shadow-lg border border-[#E6DFD3] group">
                  <img
                    src="/client/assets/images/hero-banners/banner-1.png"
                    alt="Phòng studio tinh tế"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-square shadow-lg border border-[#E6DFD3] group">
                  <img
                    src="/client/assets/images/hero-banners/banner-4.png"
                    alt="Căn hộ dịch vụ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden aspect-square shadow-lg border border-[#E6DFD3] group">
                  <img
                    src="/client/assets/images/hero-banners/banner-2.png"
                    alt="Nội thất hiện đại"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-4/5 shadow-lg border border-[#E6DFD3] group">
                  <img
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80"
                    alt="Phòng trọ cao cấp"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 2: Warm Bronze Amenity & Service Strip */}
      <BronzeAmenityStrip />

      {/* Section 3: Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Lựa Chọn Hàng Đầu
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
              Phòng Trọ & Studio Nổi Bật
            </h2>
          </div>
          <Link
            to="/rooms?featured=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A67C52] hover:text-[#8C6239] transition-colors"
          >
            <span>Xem tất cả phòng nổi bật</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : data.featuredRooms?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.featuredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                isFavorited={data.favoriteRoomIds?.includes(room._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E6DFD3] text-slate-500 text-sm">
            Hiện chưa có phòng nổi bật.
          </div>
        )}
      </section>

      {/* Section 4: Latest Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Cập Nhật Liên Tục
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
              Không Gian Mới Đăng Tuyển
            </h2>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A67C52] hover:text-[#8C6239] transition-colors"
          >
            <span>Khám phá toàn bộ phòng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : data.latestRooms?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.latestRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                isFavorited={data.favoriteRoomIds?.includes(room._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E6DFD3] text-slate-500 text-sm">
            Chưa có bài đăng nào mới.
          </div>
        )}
      </section>

      {/* Section 5: Why Book With Us (Charcoal Obsidian Theme) */}
      <section className="bg-[#1C1B19] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A67C52]">
              Giá Trị Khác Biệt
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
              Vì Sao Khách Thuê Lựa Chọn TroNest?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Chúng tôi loại bỏ nỗi lo tin ảo, chi phí phát sinh mờ ám và mang đến trải nghiệm thuê nhà minh bạch nhất thị trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-[#A67C52]/50 transition-colors">
              <span className="w-12 h-12 rounded-2xl bg-[#A67C52]/20 text-[#A67C52] flex items-center justify-center text-xl font-bold">
                01
              </span>
              <h3 className="text-xl font-bold font-serif">Kiểm Duyệt Khắt Khe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đội ngũ TroNest thẩm định thực tế từng căn phòng trước khi hiển thị lên hệ thống, đảm bảo đúng ảnh, đúng giá và đúng pháp lý.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-[#A67C52]/50 transition-colors">
              <span className="w-12 h-12 rounded-2xl bg-[#A67C52]/20 text-[#A67C52] flex items-center justify-center text-xl font-bold">
                02
              </span>
              <h3 className="text-xl font-bold font-serif">Trực Tiếp Với Chủ Nhà</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Không qua cò mồi trung gian, không phát sinh phụ phí vô lý. Số điện thoại và liên hệ của chủ trọ được cung cấp minh bạch 100%.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-[#A67C52]/50 transition-colors">
              <span className="w-12 h-12 rounded-2xl bg-[#A67C52]/20 text-[#A67C52] flex items-center justify-center text-xl font-bold">
                03
              </span>
              <h3 className="text-xl font-bold font-serif">Tiện Nghi Khách Sạn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Định hướng tiêu chuẩn Boutique với khóa vân tay an ninh, thang máy, camera 24/7 và nội thất hiện đại dọn vào ở ngay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Landlord Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#A67C52] via-[#8C6239] to-[#6E4B26] rounded-3xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Dành Cho Chủ Nhà & Nhà Đầu Tư
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
              Bạn Có Phòng Trọ, Căn Hộ Cần Tìm Khách Thuê Uy Tín?
            </h2>
            <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
              Tiếp cận hơn 10.000+ sinh viên và người đi làm văn minh mỗi tháng. Đăng tin nhanh chóng, quản lý chuyên nghiệp cùng TroNest.
            </p>
          </div>
          <Link
            to="/register?role=LANDLORD"
            className="px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-[#FAF7F2] font-bold text-xs shadow-lg transition-all shrink-0 no-underline cursor-pointer"
          >
            Đăng Ký Làm Chủ Trọ Ngay
          </Link>
        </div>
      </section>

    </div>
  );
};
