import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer client-clean-129 relative overflow-hidden">
      <div className="container">
        
        {/* Editorial Top Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 mb-10 border-b border-[#D6CEC2]/20">
          <div className="max-w-xl">
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#C59B6D] font-bold mb-2">
              TRONEST HOSPITALITY LIVING
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white m-0 leading-snug">
              Khám phá không gian lưu trú tinh tế, minh bạch và chuẩn mực trên toàn quốc.
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/rooms" className="btn-hotelier btn-hotelier-bronze no-underline">
              <span>Tìm Phòng Ngay</span>
              <span className="btn-hotelier-icon">
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </span>
            </Link>
          </div>
        </div>

        {/* 4 Column Wrap */}
        <div className="inner-wrap client-clean-130">
          
          {/* Col 1 */}
          <div className="inner-col">
            <div className="inner-logo client-clean-131 font-serif">
              <i className="fa-solid fa-house-circle-check client-clean-132"></i>
              <span>TroNest</span>
            </div>
            <p className="client-clean-133">
              TroNest là nền tảng kết nối trực tiếp giữa Chủ trọ uy tín và Khách thuê phòng trọ, sinh viên, người đi làm trên toàn quốc theo phong cách tiện nghi, an tâm và chuẩn mực.
            </p>
            <div className="client-clean-134">
              <a href="#" className="client-clean-135 hover:bg-[#A67C52]" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="client-clean-135 hover:bg-[#A67C52]" aria-label="TikTok">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="#" className="client-clean-135 hover:bg-[#A67C52]" aria-label="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="inner-col">
            <h4 className="client-clean-136 font-serif text-lg tracking-wide">Khu vực nổi bật</h4>
            <ul className="client-clean-137">
              {['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'].map((city) => (
                <li key={city}>
                  <Link to={`/rooms?province=${encodeURIComponent(city)}`} className="client-clean-138">
                    Phòng trọ {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div className="inner-col">
            <h4 className="client-clean-136 font-serif text-lg tracking-wide">Loại phòng trọ</h4>
            <ul className="client-clean-137">
              <li><Link to="/rooms?category=phong-tro-khep-kin" className="client-clean-138">Phòng khép kín</Link></li>
              <li><Link to="/rooms?category=can-ho-mini-studio" className="client-clean-138">Căn hộ Mini / Studio</Link></li>
              <li><Link to="/rooms?category=chung-cu-mini" className="client-clean-138">Chung cư mini</Link></li>
              <li><Link to="/rooms?category=ky-tuc-xa-sleepbox" className="client-clean-138">Ký túc xá / Sleepbox</Link></li>
              <li><Link to="/rooms?category=nha-nguyen-can" className="client-clean-138">Nhà nguyên căn</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="inner-col">
            <h4 className="client-clean-136 font-serif text-lg tracking-wide">Hỗ trợ khách hàng</h4>
            <p className="client-clean-139">
              <i className="fa-solid fa-phone client-clean-140"></i>
              <span>Hotline: 0987.654.321</span>
            </p>
            <p className="client-clean-139">
              <i className="fa-solid fa-envelope client-clean-140"></i>
              <span>Email: support@tronest.com</span>
            </p>
            <p className="client-clean-139">
              <i className="fa-solid fa-shield-halved client-clean-140"></i>
              <span>Cam kết bảo vệ quyền lợi người thuê</span>
            </p>
          </div>

        </div>

        <hr className="client-clean-141" />

        <div className="inner-bottom client-clean-142 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 TroNest — Hệ sinh thái phòng trọ & lưu trú an tâm toàn quốc.</span>
          <span className="text-xs text-[#9A9389]">Thiết kế cảm hứng Hotelier Luxury Hospitality.</span>
        </div>

      </div>
    </footer>
  );
};
