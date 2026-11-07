import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { RoomCard } from '../../components/common/RoomCard';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  {
    _id: 'cat-1',
    title: 'Phòng trọ khép kín',
    slug: 'phong-tro-khep-kin',
    icon: 'fa-solid fa-door-closed',
    description: 'Phòng trọ có vệ sinh riêng biệt, tiện nghi đầy đủ, giờ giấc tự do.'
  },
  {
    _id: 'cat-2',
    title: 'Căn hộ mini / Studio',
    slug: 'can-ho-mini-studio',
    icon: 'fa-solid fa-building-user',
    description: 'Phòng dạng studio đầy đủ nội thất cao cấp: bếp, ban công, máy giặt.'
  },
  {
    _id: 'cat-3',
    title: 'Chung cư mini',
    slug: 'chung-cu-mini',
    icon: 'fa-solid fa-building',
    description: 'Căn hộ chung cư mini 1–2 phòng ngủ, thang máy, bảo vệ 24/7.'
  },
  {
    _id: 'cat-4',
    title: 'Ký túc xá / Sleepbox',
    slug: 'ky-tuc-xa-sleepbox',
    icon: 'fa-solid fa-bed',
    description: 'Giường tầng cao cấp hoặc hộp ngủ riêng tư, đầy đủ máy lạnh, giá siêu tiết kiệm cho sinh viên.'
  },
  {
    _id: 'cat-5',
    title: 'Nhà nguyên căn',
    slug: 'nha-nguyen-can',
    icon: 'fa-solid fa-house-chimney',
    description: 'Nhà riêng nhiều tầng, thích hợp cho nhóm bạn hoặc hộ gia đình ở lâu dài.'
  }
];

const DEFAULT_FEATURED_ROOMS = [
  {
    _id: 'room-featured-1',
    title: 'Sleepbox cao cấp riêng tư, đầy đủ máy lạnh tại Bạch Mai',
    slug: 'sleepbox-cao-cap-bach-mai-hai-ba-trung',
    price: 1600000,
    area: 12,
    address: 'Số 310 Bạch Mai, Hai Bà Trưng, Hà Nội',
    thumbnail: '/client/assets/images/hero-banners/banner-4.png',
    images: [
      '/client/assets/images/hero-banners/banner-4.png',
      '/client/assets/images/product-2.jpg'
    ],
    categoryId: { title: 'Ký túc xá / Sleepbox', slug: 'ky-tuc-xa-sleepbox' },
    landlordId: { fullName: 'Nguyễn Văn Việt', status: 'APPROVED' },
    amenities: ['Điều hòa', 'Nóng lạnh'],
    isFeatured: true,
    status: 'APPROVED',
    views: 420
  },
  {
    _id: 'room-featured-2',
    title: 'Phòng trọ khép kín full nội thất gần ĐH Quốc Gia Cầu Giấy',
    slug: 'phong-tro-khep-kin-full-noi-that-cau-giay',
    price: 3500000,
    area: 25,
    address: 'Số 18, Ngõ 175 Xuân Thủy, Cầu Giấy, Hà Nội',
    thumbnail: '/client/assets/images/hero-banners/banner-1.png',
    images: [
      '/client/assets/images/hero-banners/banner-1.png',
      '/client/assets/images/product-1.jpg',
      '/client/assets/images/product-3.jpg'
    ],
    categoryId: { title: 'Phòng trọ khép kín', slug: 'phong-tro-khep-kin' },
    landlordId: { fullName: 'Nguyễn Văn Việt', status: 'APPROVED' },
    amenities: ['Điều hòa', 'Nóng lạnh'],
    isFeatured: true,
    status: 'APPROVED',
    views: 245
  },
  {
    _id: 'room-featured-3',
    title: 'Studio ban công cực chill ngõ 102 Trường Chinh - Đống Đa',
    slug: 'studio-ban-cong-truong-chinh-dong-da',
    price: 5200000,
    area: 32,
    address: 'Số 25, Ngách 102/15 Trường Chinh, Đống Đa, Hà Nội',
    thumbnail: '/client/assets/images/hero-banners/banner-2.png',
    images: [
      '/client/assets/images/hero-banners/banner-2.png',
      '/client/assets/images/product-2.jpg',
      '/client/assets/images/product-1.jpg'
    ],
    categoryId: { title: 'Căn hộ mini / Studio', slug: 'can-ho-mini-studio' },
    landlordId: { fullName: 'Nguyễn Văn Việt', status: 'APPROVED' },
    amenities: ['Điều hòa', 'Nóng lạnh'],
    isFeatured: true,
    status: 'APPROVED',
    views: 310
  }
];

export const HomePage = () => {
  const [data, setData] = useState({
    categories: DEFAULT_CATEGORIES,
    featuredRooms: DEFAULT_FEATURED_ROOMS,
    latestRooms: [],
    favoriteRoomIds: []
  });
  const [loading, setLoading] = useState(false);

  // Search filter states
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Dynamic Provinces & Wards lists from /api/geo
  const [provincesList, setProvincesList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  // Geolocation state
  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyLabel, setNearbyLabel] = useState('');
  const [showNearby, setShowNearby] = useState(false);

  const swiperInstanceRef = useRef(null);
  const navigate = useNavigate();

  // 1. Fetch initial home data & provinces list
  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await roomApi.getHomeData();
        if (res.code === 200 && res.data) {
          setData((prev) => ({
            ...prev,
            categories: (res.data.categories && res.data.categories.length > 0) ? res.data.categories : prev.categories,
            featuredRooms: (res.data.featuredRooms && res.data.featuredRooms.length > 0) ? res.data.featuredRooms : prev.featuredRooms,
            latestRooms: res.data.latestRooms || prev.latestRooms,
            favoriteRoomIds: res.data.favoriteRoomIds || prev.favoriteRoomIds
          }));
          setTimeout(() => {
            if (window.AOS) window.AOS.refresh();
          }, 150);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProvinces = async () => {
      try {
        const list = await roomApi.getProvinces();
        if (Array.isArray(list)) {
          setProvincesList(list);
        }
      } catch {
        // Fallback default provinces if geo api is unreachable
        setProvincesList([
          { code: '01', name: 'Thành phố Hà Nội' },
          { code: '79', name: 'Thành phố Hồ Chí Minh' },
          { code: '48', name: 'Thành phố Đà Nẵng' }
        ]);
      }
    };

    fetchHome();
    fetchProvinces();
  }, []);

  // 2. Initialize AOS (with mirror: true & once: false for repeatable scroll animations) and Swiper
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 800,
        once: false,       // Cho phép lặp lại hoạt ảnh khi cuộn lên / xuống
        mirror: true,      // Hoạt ảnh mượt mà khi cuộn ngược lên
        offset: 50
      });
      window.AOS.refresh();
    }

    const initSwiper = () => {
      if (window.Swiper && !swiperInstanceRef.current) {
        swiperInstanceRef.current = new window.Swiper('.hero-banner-swiper', {
          loop: true,
          speed: 800,
          effect: 'fade',
          fadeEffect: { crossFade: true },
          autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
          pagination: { el: '.hero-swiper-pagination', clickable: true },
          navigation: { nextEl: '.hero-swiper-next', prevEl: '.hero-swiper-prev' }
        });
      }
    };

    const timer = setTimeout(initSwiper, 150);

    return () => {
      clearTimeout(timer);
      if (swiperInstanceRef.current && typeof swiperInstanceRef.current.destroy === 'function') {
        swiperInstanceRef.current.destroy();
        swiperInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Handle Cascading Province -> Wards
  const handleProvinceChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const provName = e.target.value;
    const provCode = selectedOption ? selectedOption.dataset.code : '';

    setProvince(provName);
    setWard('');
    setWardsList([]);

    if (provCode) {
      try {
        const list = await roomApi.getWards(provCode);
        if (Array.isArray(list)) {
          setWardsList(list);
        }
      } catch (err) {
        console.error('Lỗi tải phường/xã:', err);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword.trim());
    if (province) params.append('province', province);
    if (ward) params.append('ward', ward);
    if (priceRange) params.append('priceRange', priceRange);
    navigate(`/rooms?${params.toString()}`);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS!');
      return;
    }

    setNearbyLoading(true);
    setShowNearby(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await roomApi.getNearbyRooms({
            lat: latitude,
            lng: longitude,
            limit: 6,
            radius: 5000
          });

          if (res.code === 200) {
            setNearbyRooms(res.rooms || []);
            setNearbyLabel(res.geo?.displayName || res.province || 'Vị trí hiện tại của bạn');
            toast.success(`Tìm thấy ${res.rooms?.length || 0} phòng gần vị trí của bạn!`);
            setTimeout(() => {
              const el = document.getElementById('nearby-rooms-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            toast.error(res.message || 'Không tìm thấy phòng trọ gần đây.');
          }
        } catch {
          toast.error('Lỗi kết nối khi tìm phòng quanh bạn!');
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyLoading(false);
        toast.error('Vui lòng bật quyền truy cập vị trí trên trình duyệt để tìm phòng trọ gần bạn!');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const catBgImages = [
    '/client/assets/images/hero-banners/banner-1.png',
    '/client/assets/images/hero-banners/banner-2.png',
    '/client/assets/images/hero-banners/banner-3.png',
    '/client/assets/images/hero-banners/banner-4.png'
  ];

  return (
    <div className="home-page-container">
      
      {/* 1. HERO BANNER & SEARCH SECTION (Hotelier Luxury Hospitality Swiper) */}
      <section className="hero-banner-section">
        <div className="swiper hero-banner-swiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div className="hero-slide-item">
                <img src="/client/assets/images/hero-banners/banner-1.png" alt="Phòng trọ gác lửng thông minh TroNest" />
              </div>
            </div>
            <div className="swiper-slide">
              <div className="hero-slide-item">
                <img src="/client/assets/images/hero-banners/banner-2.png" alt="Căn hộ studio sang trọng tiện nghi" />
              </div>
            </div>
            <div className="swiper-slide">
              <div className="hero-slide-item">
                <img src="/client/assets/images/hero-banners/banner-3.png" alt="Phòng trọ gác lửng phong cách hiện đại" />
              </div>
            </div>
            <div className="swiper-slide">
              <div className="hero-slide-item">
                <img src="/client/assets/images/hero-banners/banner-4.png" alt="Căn hộ mini duplex trần cao sang trọng" />
              </div>
            </div>
          </div>

          {/* Swiper Controls */}
          <div className="swiper-button-prev hero-swiper-btn hero-swiper-prev"></div>
          <div className="swiper-button-next hero-swiper-btn hero-swiper-next"></div>
          <div className="swiper-pagination hero-swiper-pagination"></div>

          {/* Editorial Luxury Overlay ("Find Your Perfect Stay.") */}
          <div className="hero-editorial-overlay">
            <div className="container hero-editorial-container">
              <div className="hero-editorial-left" data-aos="fade-up">
                <span className="hero-editorial-badge">
                  <i className="fa-solid fa-gem"></i>
                  KHÔNG GIAN SỐNG & LƯU TRÚ TINH TẾ
                </span>
                <h2 className="hero-editorial-title">
                  Find Your<br />Perfect Stay.
                </h2>
                <p className="hero-editorial-subtitle">
                  Trải nghiệm chuẩn mực tìm kiếm phòng trọ, studio và căn hộ dịch vụ đã xác thực với không gian kiến trúc ấm cúng, minh bạch và an tâm tuyệt đối.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze no-underline">
                    <span>Khám Phá Ngay</span>
                    <span className="btn-hotelier-icon">
                      <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="hero-editorial-right" data-aos="fade-left" data-aos-delay="150">
                <div className="hero-floating-card">
                  <div className="hero-floating-card-top">
                    <span className="hero-floating-tag">TroNest Signature</span>
                    <span className="hero-floating-rating">
                      <i className="fa-solid fa-star"></i> 4.9
                    </span>
                  </div>
                  <div className="hero-floating-img-wrap">
                    <img src="/client/assets/images/hero-banners/banner-4.png" alt="Studio Tuyển Chọn" />
                  </div>
                  <div className="hero-floating-card-body">
                    <div>
                      <div className="hero-floating-card-title">Studio & Căn Hộ Dịch Vụ</div>
                      <div className="hero-floating-card-meta">Kiểm duyệt thực tế • Đầy đủ nội thất</div>
                    </div>
                    <Link to="/rooms" className="hero-floating-card-btn" aria-label="Xem danh sách phòng">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh Tìm Kiếm Phòng Trọ Booking Bar */}
        <div className="hero-search-wrapper">
          <div className="container">
            <form onSubmit={handleSearch} className="home-search-form" data-aos="fade-up" data-aos-delay="100">
              <div className="search-fields-grid">
                
                {/* Khu vực / Địa chỉ */}
                <div className="search-field-col col-keyword">
                  <label className="search-field-label" htmlFor="home-keyword">Khu vực / Địa chỉ</label>
                  <div className="search-input-wrapper">
                    <input
                      id="home-keyword"
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Nhập tên đường, địa chỉ, trường học..."
                      className="search-input-control"
                    />
                  </div>
                </div>

                {/* Tỉnh / Thành phố */}
                <div className="search-field-col col-province">
                  <label className="search-field-label" htmlFor="home-province">Tỉnh / Thành phố</label>
                  <div className="search-input-wrapper">
                    <select
                      id="home-province"
                      value={province}
                      onChange={handleProvinceChange}
                      className="search-select-control"
                    >
                      <option value="">Toàn quốc</option>
                      {provincesList.map((p) => (
                        <option key={p.code} value={p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '')} data-code={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phường / Xã */}
                <div className="search-field-col col-ward">
                  <label className="search-field-label" htmlFor="home-ward">Phường / Xã</label>
                  <div className="search-input-wrapper">
                    <select
                      id="home-ward"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      disabled={!province || wardsList.length === 0}
                      className="search-select-control"
                    >
                      <option value="">
                        {!province ? 'Chọn tỉnh trước' : wardsList.length === 0 ? 'Đang tải...' : `Tất cả phường/xã (${wardsList.length})`}
                      </option>
                      {wardsList.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Khoảng giá */}
                <div className="search-field-col col-price">
                  <label className="search-field-label" htmlFor="home-price">Khoảng giá thuê</label>
                  <div className="search-input-wrapper">
                    <select
                      id="home-price"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="search-select-control"
                    >
                      <option value="">Mọi mức giá</option>
                      <option value="<2m">Dưới 2 triệu</option>
                      <option value="2-4m">Từ 2 - 4 triệu</option>
                      <option value="4-7m">Từ 4 - 7 triệu</option>
                      <option value=">7m">Trên 7 triệu</option>
                    </select>
                  </div>
                </div>

                {/* Nút Gần tôi (GPS) */}
                <div className="search-field-col col-nearby">
                  <button
                    type="button"
                    onClick={handleFindNearby}
                    disabled={nearbyLoading}
                    className="btn-nearby-trigger cursor-pointer"
                    title="Tìm phòng trọ gần vị trí của bạn"
                  >
                    <i className="fa-solid fa-location-crosshairs"></i>
                    <span>{nearbyLoading ? 'Đang dò GPS...' : 'Gần tôi'}</span>
                  </button>
                </div>

                {/* Nút Submit Tìm Kiếm */}
                <div className="search-field-col col-submit">
                  <button type="submit" className="btn-hotelier btn-hotelier-bronze btn-search-submit cursor-pointer">
                    <span>Tìm Phòng</span>
                    <span className="btn-hotelier-icon">
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                  </button>
                </div>

              </div>
            </form>

            {/* Quick Suggestions Tags */}
            <div className="search-quick-tags" data-aos="fade-up" data-aos-delay="150">
              <span className="quick-tags-title">
                <i className="fa-solid fa-sparkles"></i> Gợi ý phổ biến:
              </span>
              <Link to="/rooms?priceRange=<2m" className="quick-tag-item">Dưới 2 triệu</Link>
              <Link to="/rooms?priceRange=2-4m" className="quick-tag-item">Từ 2 - 4 triệu</Link>
              <Link to="/rooms?category=can-ho-mini-studio" className="quick-tag-item">Studio tiện nghi</Link>
              <Link to="/rooms?category=chung-cu-mini" className="quick-tag-item">Chung cư mini</Link>
              <Link to="/rooms?province=Hà Nội" className="quick-tag-item">Hà Nội</Link>
              <Link to="/rooms?province=Hồ Chí Minh" className="quick-tag-item">TP. Hồ Chí Minh</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: ABOUT TRONEST (Editorial Split Section with 3 Arched Pillars) */}
      <section className="hotelier-about-section">
        <div className="container">
          <div className="hotelier-about-grid">
            <div className="hotelier-about-content" data-aos="fade-right">
              <span className="hotelier-eyebrow">VỀ TRONEST • HOSPITALITY LIVING</span>
              <h2 className="hotelier-section-title">
                About TroNest —<br />
                Nghệ Thuật Của Sự An Cư.
              </h2>
              <p className="hotelier-about-desc">
                Lấy cảm hứng từ tiêu chuẩn lưu trú khách sạn boutique cao cấp, TroNest mang đến trải nghiệm tìm kiếm phòng trọ, căn hộ studio và nhà nguyên căn minh bạch, chuẩn xác. Mỗi không gian trên hệ thống đều được chọn lọc kỹ lưỡng, xác thực chủ nhà và niêm yết chi phí rõ ràng.
              </p>
              <div className="hotelier-about-actions">
                <Link to="/rooms" className="btn-hotelier btn-hotelier-outline no-underline">
                  <span>Tìm Hiểu Thêm</span>
                  <span className="btn-hotelier-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </Link>
              </div>
            </div>

            <div className="hotelier-about-pillars" data-aos="fade-left" data-aos-delay="100">
              <div className="hotelier-pillar-card">
                <img src="/client/assets/images/hero-banners/banner-1.png" alt="Không gian phòng trọ gác lửng tinh tế" loading="lazy" />
              </div>
              <div className="hotelier-pillar-card pillar-offset">
                <img src="/client/assets/images/hero-banners/banner-2.png" alt="Nội thất studio ấm cúng hiện đại" loading="lazy" />
              </div>
              <div className="hotelier-pillar-card">
                <img src="/client/assets/images/hero-banners/banner-4.png" alt="Kiến trúc căn hộ dịch vụ cao cấp" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: WARM BRONZE AMENITY & SERVICE STRIP */}
      <section className="hotelier-bronze-strip">
        <div className="container">
          <div className="hotelier-strip-grid">
            <div className="hotelier-strip-item">
              <span className="hotelier-strip-icon">
                <i className="fa-solid fa-map-location-dot"></i>
              </span>
              <div className="hotelier-strip-content">
                <strong>Vị Trí Đắc Địa</strong>
                <span>Kết nối trường học & trung tâm</span>
              </div>
            </div>
            <div className="hotelier-strip-item">
              <span className="hotelier-strip-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </span>
              <div className="hotelier-strip-content">
                <strong>Phòng Xác Thực 100%</strong>
                <span>Kiểm duyệt thực tế minh bạch</span>
              </div>
            </div>
            <div className="hotelier-strip-item">
              <span className="hotelier-strip-icon">
                <i className="fa-solid fa-couch"></i>
              </span>
              <div className="hotelier-strip-content">
                <strong>Nội Thất Tinh Tế</strong>
                <span>Tiện nghi sẵn sàng dọn vào ở</span>
              </div>
            </div>
            <div className="hotelier-strip-item">
              <span className="hotelier-strip-icon">
                <i className="fa-solid fa-lock"></i>
              </span>
              <div className="hotelier-strip-content">
                <strong>An Ninh & Riêng Tư</strong>
                <span>Khóa vân tay, camera 24/7</span>
              </div>
            </div>
            <div className="hotelier-strip-item">
              <span className="hotelier-strip-icon">
                <i className="fa-solid fa-headset"></i>
              </span>
              <div className="hotelier-strip-content">
                <strong>Hỗ Trợ Tận Tâm 24/7</strong>
                <span>Kết nối trực tiếp chủ nhà uy tín</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: NEARBY ROOMS (Hiện khi người dùng bấm Gần Tôi) */}
      {showNearby && (
        <section id="nearby-rooms-section" className="nearby-rooms-section">
          <div className="container">
            <div className="nearby-rooms-header">
              <div className="nearby-rooms-title-group">
                <span className="nearby-badge">
                  <i className="fa-solid fa-location-crosshairs"></i> Gần bạn
                </span>
                <h2 className="nearby-title">Phòng trọ gần vị trí của bạn</h2>
                <p className="nearby-subtitle">{nearbyLabel || 'Đang xác định vị trí...'}</p>
              </div>
              <Link to="/rooms" className="btn-view-all-nearby btn-hotelier btn-hotelier-outline no-underline">
                <span>Xem tất cả</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </Link>
            </div>

            {nearbyLoading ? (
              <div className="nearby-loading">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="nearby-skeleton h-64 rounded-2xl bg-[#E6DFD3]/40 animate-pulse"></div>
                ))}
              </div>
            ) : nearbyRooms.length > 0 ? (
              <div className="rooms-grid">
                {nearbyRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    isFavorited={data.favoriteRoomIds?.includes(room._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#E6DFD3] text-[#6E6A63] text-sm">
                Không tìm thấy phòng trọ nào trong bán kính 5km quanh vị trí hiện tại.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. SECTION: WHY BOOK WITH US (Dark Obsidian Box from Screenshot) */}
      <section className="hotelier-why-section">
        <div className="container">
          <div className="hotelier-why-grid">
            
            {/* Left Visual Box */}
            <div className="hotelier-why-visual" data-aos="fade-right">
              <div className="hotelier-why-img-box">
                <img src="/client/assets/images/hero-banners/banner-3.png" alt="Kiến trúc lưu trú hiện đại TroNest" loading="lazy" />
                <div className="hotelier-why-floating-badge">
                  <span className="why-badge-score">4.9 ★</span>
                  <div>
                    <strong>Uy Tín Hàng Đầu</strong>
                    <span>Hơn 10.000+ khách thuê tin chọn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="hotelier-why-content" data-aos="fade-left" data-aos-delay="100">
              <span className="hotelier-eyebrow text-[#C59B6D]">WHY BOOK WITH US • VÌ SAO CHỌN TRONEST</span>
              <h2 className="hotelier-why-title">
                Chuẩn Mực Mới Trong Hành Trình Tìm Phòng Trọ
              </h2>
              <p className="hotelier-why-desc">
                Chúng tôi loại bỏ hoàn toàn nỗi lo tin ảo, phí ẩn hay trung gian thiếu minh bạch bằng quy trình kiểm duyệt khắt khe và nền tảng kết nối trực tiếp với chủ trọ đã xác thực.
              </p>

              <div className="hotelier-why-features">
                <div className="hotelier-why-feature-card">
                  <span className="why-feature-num">01</span>
                  <h3>Minh Bạch Giá Thuê</h3>
                  <p>Niêm yết rõ ràng giá phòng, điện, nước và dịch vụ ngay từ đầu, cam kết không phát sinh chi phí ẩn.</p>
                </div>
                <div className="hotelier-why-feature-card">
                  <span className="why-feature-num">02</span>
                  <h3>Chủ Nhà Xác Thực</h3>
                  <p>Toàn bộ chủ trọ và bài đăng đều được Ban quản trị TroNest kiểm duyệt danh tính và hình ảnh thực tế.</p>
                </div>
                <div className="hotelier-why-feature-card">
                  <span className="why-feature-num">03</span>
                  <h3>Tìm Kiếm Thông Minh</h3>
                  <p>Bộ lọc chính xác theo khu vực, ngân sách, diện tích và định vị GPS giúp tìm phòng gần bạn chỉ trong vài giây.</p>
                </div>
                <div className="hotelier-why-feature-card">
                  <span className="why-feature-num">04</span>
                  <h3>Hỗ Trợ Nhanh Chóng</h3>
                  <p>Liên hệ trực tiếp qua điện thoại hoặc Zalo với chủ nhà không qua môi giới, đặt lịch xem phòng tức thì.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze no-underline">
                  <span>Xem Tất Cả Phòng</span>
                  <span className="btn-hotelier-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SECTION: CATEGORIES VERTICAL SHOWCASE */}
      {data.categories?.length > 0 && (
        <section className="client-clean-070 hotelier-categories-section">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10" data-aos="fade-up">
              <span className="hotelier-eyebrow">YOUR STAY, OUR SERVICE</span>
              <h2 className="client-clean-071 mb-3">
                Khám Phá Theo Loại Hình Lưu Trú
              </h2>
              <p className="text-sm sm:text-base text-[#6E6A63] m-0">
                Đa dạng lựa chọn từ phòng đơn khép kín, căn hộ studio hiện đại đến nhà nguyên căn rộng rãi đáp ứng trọn vẹn nhu cầu sinh hoạt của bạn.
              </p>
            </div>

            <div className="categories-grid hotelier-categories-grid client-clean-072 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-aos="fade-up" data-aos-delay="100">
              {data.categories.map((cat, idx) => (
                <Link
                  key={cat._id || idx}
                  to={`/rooms?category=${cat.slug || cat._id}`}
                  className="client-clean-073 hotelier-cat-card"
                >
                  <img
                    className="hotelier-cat-bg"
                    src={catBgImages[idx % catBgImages.length]}
                    alt={cat.title}
                    loading="lazy"
                  />
                  <div className="hotelier-cat-overlay"></div>
                  <div className="client-clean-074 hotelier-cat-icon">
                    <i className={cat.icon || "fa-solid fa-house-chimney"}></i>
                  </div>
                  <div className="hotelier-cat-info">
                    <span className="hotelier-cat-count">Khám phá không gian</span>
                    <h3 className="client-clean-075">{cat.title}</h3>
                    <p className="client-clean-076">{cat.description || 'Xem danh sách phòng tuyển chọn'}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10" data-aos="fade-up">
              <Link to="/rooms" className="btn-hotelier btn-hotelier-outline no-underline">
                <span>Khám Phá Tất Cả Loại Hình</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION: FEATURED ROOMS */}
      {data.featuredRooms?.length > 0 && (
        <section className="client-clean-077 hotelier-featured-section" data-aos="fade-up">
          <div className="hotelier-bronze-banner">
            <div className="container" data-aos="fade-up">
              <div className="text-center max-w-2xl mx-auto">
                <span className="hotelier-eyebrow text-[#FAF7F2]/85">CHOOSE YOUR SPACE • TUYỂN CHỌN ĐẶC BIỆT</span>
                <h2 className="hotelier-bronze-banner-title">Không Gian Lưu Trú Nổi Bật Nhất</h2>
                <p className="hotelier-bronze-banner-sub">
                  Những căn phòng có vị trí thuận tiện, thiết kế thẩm mỹ và được cộng đồng người thuê đánh giá cao nhất tuần qua.
                </p>
              </div>
            </div>
          </div>

          <div className="container hotelier-featured-container" data-aos="fade-up" data-aos-delay="100">
            <div className="rooms-grid client-clean-082">
              {data.featuredRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  isFavorited={data.favoriteRoomIds?.includes(room._id)}
                />
              ))}
            </div>

            <div className="text-center mt-10" data-aos="fade-up">
              <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze no-underline">
                <span>Xem Tất Cả Phòng Nổi Bật ({data.featuredRooms.length}+)</span>
                <span className="btn-hotelier-icon">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. SECTION: TESTIMONIALS */}
      <section className="hotelier-testimonials-section" data-aos="fade-up">
        <div className="container">
          <div className="hotelier-testi-header" data-aos="fade-up">
            <div>
              <span className="hotelier-eyebrow text-[#C59B6D]">WHAT PEOPLE SAY ABOUT US</span>
              <h2 className="hotelier-testi-title">Khách Thuê & Chủ Trọ Nói Gì Về TroNest</h2>
            </div>
            <div className="hotelier-testi-rating-box">
              <span className="testi-stars">★★★★★</span>
              <span className="testi-score">4.9 / 5.0 Đánh giá hài lòng</span>
            </div>
          </div>

          <div className="hotelier-testi-grid">
            <div className="hotelier-testi-card">
              <div className="testi-quote-mark">“</div>
              <div className="testi-stars-sm">★★★★★</div>
              <p className="testi-text">
                "Mình tìm được căn studio gần trường chỉ sau 1 buổi chiều trên TroNest. Hình ảnh trên web giống hệt thực tế, giá điện nước ghi rõ ràng nên cực kỳ yên tâm."
              </p>
              <div className="testi-author">
                <div className="testi-avatar">M</div>
                <div>
                  <strong>Minh Anh</strong>
                  <span>Sinh viên Đại học Quốc gia</span>
                </div>
              </div>
            </div>

            <div className="hotelier-testi-card">
              <div className="testi-quote-mark">“</div>
              <div className="testi-stars-sm">★★★★★</div>
              <p className="testi-text">
                "Giao diện sang trọng, dễ lọc theo khu vực và mức giá. Mình thích nhất tính năng liên hệ trực tiếp Zalo với chủ nhà đã xác thực mà không phải qua môi giới."
              </p>
              <div className="testi-author">
                <div className="testi-avatar">H</div>
                <div>
                  <strong>Hoàng Nam</strong>
                  <span>Chuyên viên Thiết kế Nội thất</span>
                </div>
              </div>
            </div>

            <div className="hotelier-testi-card">
              <div className="testi-quote-mark">“</div>
              <div className="testi-stars-sm">★★★★★</div>
              <p className="testi-text">
                "Từ khi đăng phòng lên TroNest, tòa căn hộ mini của tôi luôn lấp đầy nhanh chóng. Khách thuê văn minh, lịch sự và quy trình duyệt tin rất chuyên nghiệp."
              </p>
              <div className="testi-author">
                <div className="testi-avatar">T</div>
                <div>
                  <strong>Cô Thanh Hương</strong>
                  <span>Chủ hệ thống Căn hộ Studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION: BOTTOM CTA BANNER */}
      <section className="hotelier-cta-section">
        <div className="container">
          <div className="hotelier-cta-banner">
            <div className="hotelier-cta-content">
              <span className="hotelier-eyebrow text-[#C59B6D]">BẮT ĐẦU HÀNH TRÌNH AN CƯ</span>
              <h2 className="hotelier-cta-title">Bạn Đang Tìm Phòng Hay Muốn Đăng Tin Cho Thuê?</h2>
              <p className="hotelier-cta-desc">
                Tham gia cộng đồng lưu trú văn minh TroNest ngay hôm nay để tìm không gian sống hoàn hảo hoặc tiếp cận hàng ngàn khách thuê uy tín.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze no-underline">
                  <span>Tìm Phòng Ngay</span>
                  <span className="btn-hotelier-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </Link>
                <Link to="/landlord/rooms/create" className="btn-hotelier btn-hotelier-outline no-underline">
                  <span>Đăng Tin Cho Thuê</span>
                  <span className="btn-hotelier-icon">
                    <i className="fa-solid fa-plus"></i>
                  </span>
                </Link>
              </div>
            </div>
            <div className="hotelier-cta-image">
              <img src="/client/assets/images/hero-banners/banner-4.png" alt="TroNest Luxury Living" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
