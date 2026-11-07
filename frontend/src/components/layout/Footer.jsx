import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1C1B19] text-[#FAF7F2] pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Cột 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#A67C52] text-white flex items-center justify-center">
                <i className="fa-solid fa-house-circle-check text-base"></i>
              </span>
              <span className="text-2xl font-bold font-serif tracking-tight text-white">
                TroNest
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng tìm kiếm và đăng tin phòng trọ, căn hộ studio chuẩn khách sạn boutique. Minh bạch chi phí, xác thực 100% hình ảnh thực tế.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#A67C52] text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
                <i className="fa-brands fa-facebook-f"></i>
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#A67C52] text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
                <i className="fa-brands fa-tiktok"></i>
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#A67C52] text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
                <i className="fa-brands fa-youtube"></i>
              </span>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/rooms" className="hover:text-white transition-colors">
                  Tất cả phòng trọ
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=studio" className="hover:text-white transition-colors">
                  Studio & Căn hộ mini
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=gac-lung" className="hover:text-white transition-colors">
                  Phòng có gác lửng cao cấp
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors">
                  Danh sách yêu thích
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dành cho đối tác */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Dành Cho Chủ Trọ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/register?role=LANDLORD" className="hover:text-white transition-colors">
                  Đăng ký tài khoản Chủ Trọ
                </Link>
              </li>
              <li>
                <Link to="/landlord/rooms/create" className="hover:text-white transition-colors">
                  Đăng tin cho thuê mới
                </Link>
              </li>
              <li>
                <Link to="/landlord/dashboard" className="hover:text-white transition-colors">
                  Kênh quản trị bài đăng
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Quy chuẩn kiểm duyệt phòng</span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Hỗ Trợ 24/7
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A67C52] shrink-0" />
                <span>Hotline: 0912 345 678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A67C52] shrink-0" />
                <span>tronest515@gmail.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A67C52] shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Hệ thống bảo vệ quyền lợi người thuê</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TroNest. Bản quyền thuộc về Nhóm 16 OJT.</p>
          <p className="flex items-center gap-1">
            Thiết kế với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> và ReactJS + Express
          </p>
        </div>
      </div>
    </footer>
  );
};

