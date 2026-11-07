import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { RoomCard } from '../../components/common/RoomCard';
import toast from 'react-hot-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft
} from 'lucide-react';

export const LandlordPublicDetailPage = () => {
  const { id } = useParams();
  const [landlord, setLandlord] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandlord = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/landlords/${id}`);
        if (res.data.code === 200 && res.data.landlord) {
          setLandlord(res.data.landlord);
          setRooms(res.data.rooms || []);
          setTotalRooms(res.data.totalRooms || 0);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể tải thông tin chủ trọ!');
      } finally {
        setLoading(false);
      }
    };

    fetchLandlord();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="h-48 bg-slate-200/60 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-slate-200/60 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (!landlord) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy thông tin chủ trọ</h2>
        <p className="text-sm text-slate-500">Tài khoản có thể đã ngừng hoạt động hoặc đường dẫn không đúng.</p>
        <Link to="/rooms" className="inline-block px-6 py-2.5 rounded-full bg-[#A67C52] text-white font-bold text-xs">
          Xem danh sách phòng khác
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <Link to="/rooms" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#A67C52] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tìm kiếm phòng</span>
        </Link>
      </div>

      {/* Landlord Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={landlord.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160"}
            alt={landlord.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[#A67C52]/40 shadow-md"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                {landlord.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Chủ trọ đã xác thực
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              {landlord.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>{landlord.phone}</span>
                </span>
              )}
              {landlord.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>{landlord.email}</span>
                </span>
              )}
              {landlord.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>{landlord.address}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 pt-1">
              Đang quản lý <strong>{totalRooms}</strong> bài đăng phòng trọ đã qua kiểm duyệt.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {landlord.phone && (
            <a
              href={`tel:${landlord.phone}`}
              className="px-6 py-2.5 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold shadow-md shadow-[#8C6239]/20 flex items-center justify-center gap-2 no-underline transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi Điện Ngay</span>
            </a>
          )}
          {landlord.phone && (
            <a
              href={`https://zalo.me/${landlord.phone}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-2xl bg-[#0068FF] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 no-underline"
            >
              <i className="fa-solid fa-comment-dots text-sm"></i>
              <span>Nhắn Tin Zalo</span>
            </a>
          )}
        </div>
      </div>

      {/* Landlord's Rooms Grid */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">Danh Sách Phòng</span>
          <h2 className="text-2xl font-bold font-serif text-slate-900 mt-1">Các Phòng Trọ Của Chủ Nhà Này</h2>
        </div>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E6DFD3] text-slate-400 text-xs">
            Chủ trọ hiện chưa có bài đăng phòng nào đang hoạt động.
          </div>
        )}
      </div>

    </div>
  );
};

