import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
import { roomApi } from '../../api/roomApi';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  Upload, 
  X, 
  ArrowLeft,
  Sparkles,
  MapPin,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Zap,
  Droplets,
  Shield,
  Users,
  Star,
  AlertCircle
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Wifi tốc độ cao',
  'Điều hòa nhiệt độ',
  'Bình nóng lạnh',
  'Máy giặt chung/riêng',
  'Gác lửng cao cấp',
  'Tủ lạnh',
  'Bếp nấu ăn',
  'Giường nệm',
  'Tủ quần áo',
  'Khóa vân tay an ninh',
  'Camera 24/7',
  'Chỗ để xe miễn phí',
  'Thang máy',
  'Giờ giấc tự do',
  'Ban công / Cửa sổ thoáng',
  'Vệ sinh khép kín'
];

const FALLBACK_PROVINCES = [
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '79', name: 'Thành phố Hồ Chí Minh' },
  { code: '48', name: 'Thành phố Đà Nẵng' }
];

const normalizeUnitName = (name = '') =>
  String(name)
    .replace(/^(Thành phố|TP\.|Tỉnh|Phường|Xã|Thị trấn|Đặc khu)\s+/i, '')
    .trim()
    .toLowerCase();

const stripProvincePrefix = (name = '') =>
  String(name).replace(/^(Thành phố|Tỉnh)\s+/i, '').trim();

function formatVndPreview(val) {
  const num = Number(val);
  if (!num || isNaN(num) || num <= 0) return '';
  const formatted = num.toLocaleString('vi-VN') + ' VNĐ';
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(num % 100000 === 0 ? 1 : 2).replace(/\.0$/, '');
    return `≈ ${formatted} (${millions} triệu/tháng)`;
  }
  return `≈ ${formatted}`;
}

export const LandlordRoomFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [area, setArea] = useState('');
  const [capacity, setCapacity] = useState('2');
  
  // Utilities
  const [electricityPrice, setElectricityPrice] = useState('3.800 đ/kWh');
  const [waterPrice, setWaterPrice] = useState('30.000 đ/m³');
  const [servicePrice, setServicePrice] = useState('100.000 đ/phòng');

  // Location (2-level Administrative Units: Province -> Ward)
  const [provincesList, setProvincesList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');

  // Room status & Reject reason (for Edit mode)
  const [roomStatus, setRoomStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Description & Features
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const list = await roomApi.getProvinces();
        if (Array.isArray(list) && list.length > 0) {
          setProvincesList(list);
        } else {
          setProvincesList(FALLBACK_PROVINCES);
        }
      } catch {
        setProvincesList(FALLBACK_PROVINCES);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        if (isEdit) {
          const res = await landlordApi.getEditData(id);
          if (res.code === 200 && res.data) {
            const r = res.data.room;
            setCategories(res.data.categories || []);
            setTitle(r.title || '');
            setCategoryId(r.categoryId?._id || r.categoryId || '');
            setPrice(r.price || '');
            setDeposit(r.deposit || '');
            setArea(r.area || '');
            setCapacity(r.capacity ? String(r.capacity) : '2');
            
            // Utilities
            setElectricityPrice(r.electricityPrice || '3.800 đ/kWh');
            setWaterPrice(r.waterPrice || '30.000 đ/m³');
            setServicePrice(r.servicePrice || '100.000 đ/phòng');

            // Location
            setProvince(stripProvincePrefix(r.province || 'Hà Nội'));
            setDistrict(r.district || '');
            setWard(r.ward || '');
            setAddress(r.address || '');

            // Status & Reject reason
            setRoomStatus(r.status || '');
            setRejectReason(r.rejectReason || '');

            setDescription(r.description || '');
            setSelectedAmenities(r.amenities || []);
            setImages(r.images || (r.thumbnail ? [r.thumbnail] : []));
          }
        } else {
          const res = await landlordApi.getCreateData();
          if (res.code === 200 && res.data) {
            setCategories(res.data.categories || []);
            if (res.data.categories?.length > 0) {
              setCategoryId(res.data.categories[0]._id);
            }
          }
        }
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || 'Không thể tải biểu mẫu bài đăng!';
        toast.error(msg);
        if (status === 403) {
          navigate('/landlord/dashboard');
        } else if (status === 404) {
          navigate('/landlord/rooms');
        }
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit, navigate]);

  // Load Wards whenever province or provincesList changes
  useEffect(() => {
    if (!province || provincesList.length === 0) {
      setWardsList([]);
      return;
    }

    const normTarget = normalizeUnitName(province);
    const matchedProvince = provincesList.find(
      (p) => normalizeUnitName(p.name) === normTarget || p.name === province
    );

    if (!matchedProvince?.code) {
      setWardsList([]);
      return;
    }

    let isCancelled = false;
    setWardsLoading(true);

    roomApi
      .getWards(matchedProvince.code)
      .then((list) => {
        if (isCancelled) return;
        const sorted = Array.isArray(list)
          ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
          : [];
        setWardsList(sorted);

        setWard((currentWard) => {
          if (currentWard) {
            const matchedWard = sorted.find(
              (w) =>
                w.name.toLowerCase() === currentWard.toLowerCase() ||
                normalizeUnitName(w.name) === normalizeUnitName(currentWard)
            );
            if (matchedWard) return matchedWard.name;
            return currentWard;
          }
          return sorted.length > 0 ? sorted[0].name : '';
        });
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Lỗi tải danh sách phường/xã:', err);
          setWardsList([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setWardsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [province, provincesList]);

  const handleToggleAmenity = (item) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities((prev) => prev.filter((a) => a !== item));
    } else {
      setSelectedAmenities((prev) => [...prev, item]);
    }
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 6) {
      toast.error('Tối đa 6 hình ảnh cho mỗi bài đăng!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));

      const res = await landlordApi.uploadImages(formData);
      const uploadedList = res.images || res.urls || [];
      if (res.code === 200 && uploadedList.length > 0) {
        setImages((prev) => [...prev, ...uploadedList].slice(0, 6));
        toast.success(`Đã tải lên ${uploadedList.length} hình ảnh!`);
      } else {
        toast.error('Tải ảnh thất bại!');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên máy chủ!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
    toast.success('Đã đặt làm ảnh bìa chính!');
  };

  const handleSubmit = async (actionStatus = 'PENDING') => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Vui lòng nhập tiêu đề bài đăng!');
      return;
    }
    if (trimmedTitle.length < 5) {
      toast.error('Tiêu đề bài đăng phải từ 5 ký tự trở lên!');
      return;
    }
    if (trimmedTitle.length > 200) {
      toast.error('Tiêu đề bài đăng không được vượt quá 200 ký tự!');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn loại phòng trọ!');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Vui lòng nhập giá cho thuê hợp lệ!');
      return;
    }
    if (!area || Number(area) <= 0) {
      toast.error('Vui lòng nhập diện tích phòng hợp lệ!');
      return;
    }
    if (!province.trim()) {
      toast.error('Vui lòng chọn Tỉnh / Thành phố!');
      return;
    }
    if (!ward.trim()) {
      toast.error('Vui lòng chọn Phường / Xã!');
      return;
    }
    if (!address.trim()) {
      toast.error('Vui lòng nhập số nhà, tên đường chi tiết!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        categoryId,
        price: Number(price),
        deposit: deposit ? Number(deposit) : 0,
        area: Number(area),
        capacity: capacity ? Number(capacity) : 2,
        electricityPrice: electricityPrice.trim(),
        waterPrice: waterPrice.trim(),
        servicePrice: servicePrice.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        address: address.trim(),
        description: description.trim(),
        amenities: selectedAmenities,
        images,
        thumbnail: images[0] || '',
        actionStatus
      };

      if (isEdit) {
        const res = await landlordApi.updateRoom(id, payload);
        if (res.code === 200) {
          toast.success(res.message || 'Cập nhật bài đăng thành công!');
          navigate('/landlord/rooms');
        } else {
          toast.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        const res = await landlordApi.createRoom(payload);
        if (res.code === 200) {
          toast.success(res.message || 'Đăng tin phòng trọ thành công!');
          navigate('/landlord/rooms');
        } else {
          toast.error(res.message || 'Đăng tin thất bại!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài đăng!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-96 bg-white/60 rounded-3xl animate-pulse"></div>;
  }

  const fullAddressPreview = [address.trim(), ward, province].filter(Boolean).join(' - ');

  return (
    <div className="space-y-5 max-w-4xl pb-10">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6DFD3]">
        <div>
          <Link 
            to="/landlord/rooms" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#A67C52] mb-1 no-underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách phòng</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            {isEdit ? 'Chỉnh Sửa Bài Đăng' : 'Đăng Tin Phòng Trọ Mới'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-[#FAF7F2] cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
          >
            Lưu Nháp
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('PENDING')}
            className="px-5 py-2 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold shadow-md shadow-[#8C6239]/20 hover:shadow-lg cursor-pointer disabled:opacity-50 transition-all"
          >
            {submitting ? 'Đang lưu...' : isEdit && roomStatus === 'REJECTED' ? 'Gửi Duyệt Lại' : 'Gửi Phê Duyệt'}
          </button>
        </div>
      </div>

      {/* Rejection Notice Banner when editing a REJECTED room */}
      {isEdit && roomStatus === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-rose-800">Bài đăng này đã bị Admin từ chối phê duyệt</p>
            <p className="text-rose-700 leading-relaxed">
              <strong>Lý do từ chối:</strong> {rejectReason || 'Nội dung chưa đạt tiêu chuẩn kiểm duyệt. Vui lòng cập nhật lại thông tin và bấm "Gửi Duyệt Lại".'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-7">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <Sparkles className="w-4 h-4 text-[#A67C52]" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              1. Thông Tin Cơ Bản
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Phòng Studio Full Nội Thất Gần ĐH Ngoại Thương, Có Ban Công & Khóa Vân Tay"
              required
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] focus:ring-1 focus:ring-[#A67C52] outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gợi ý: Đặt tiêu đề nêu bật ưu điểm như vị trí gần trường/chợ, nội thất hoặc ban công để thu hút hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Loại phòng trọ <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Diện tích (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="VD: 28"
                min="1"
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số người ở tối đa
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="VD: 2"
                  min="1"
                  max="10"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Pricing & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Giá cho thuê (VNĐ/tháng) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 4500000"
                  step="50000"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {price && (
                <p className="text-[11px] font-bold text-[#A67C52] mt-1 pl-1">
                  {formatVndPreview(price)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tiền đặt cọc (VNĐ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="VD: 4500000 (Để 0 nếu không yêu cầu)"
                  step="50000"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {deposit && (
                <p className="text-[11px] font-bold text-slate-600 mt-1 pl-1">
                  {formatVndPreview(deposit)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Utilities Pricing */}
        <div className="space-y-4 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <Zap className="w-4 h-4 text-[#A67C52]" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              2. Chi Phí Dịch Vụ & Điện Nước
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Giá điện
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(e.target.value)}
                  placeholder="VD: 3.800 đ/kWh hoặc Giá nhà nước"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <Zap className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Giá nước
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                  placeholder="VD: 30.000 đ/m³ hoặc 100.000 đ/người"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <Droplets className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phí dịch vụ / Vệ sinh / Wifi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="VD: 100.000 đ/phòng hoặc Miễn phí"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
                />
                <Shield className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Location (2-level Administrative Units: Province -> Ward) */}
        <div className="space-y-4 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <MapPin className="w-4 h-4 text-[#A67C52]" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                3. Khu Vực & Địa Chỉ Phòng Trọ
              </h3>
              <p className="text-[11px] text-slate-400">
                Chọn chính xác địa chỉ hành chính để người thuê dễ dàng tìm kiếm phòng trọ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tỉnh / Thành phố <span className="text-rose-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict('');
                  setWard('');
                }}
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              >
                {provincesList.map((p) => {
                  const shortVal = stripProvincePrefix(p.name);
                  return (
                    <option key={p.code} value={shortVal}>
                      {p.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phường / Xã <span className="text-rose-500">*</span>
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                disabled={wardsLoading || wardsList.length === 0}
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none disabled:opacity-60"
              >
                {wardsLoading ? (
                  <option value="">-- Đang tải danh sách phường/xã... --</option>
                ) : wardsList.length === 0 ? (
                  <option value={ward || ''}>{ward || '-- Vui lòng chọn Tỉnh/Thành phố trước --'}</option>
                ) : (
                  <>
                    {ward && !wardsList.some((w) => w.name === ward) && (
                      <option value={ward}>{ward}</option>
                    )}
                    {wardsList.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Số nhà, tên ngõ/ngách, tên đường <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 italic">
                Không cần gõ lại tên phường/xã, tỉnh/thành phố
              </span>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 18, Ngõ 175 đường Xuân Thủy"
              required
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-[#A67C52] shrink-0" />
            <span>
              Địa chỉ đầy đủ:{' '}
              <strong className="text-slate-800">
                {fullAddressPreview || 'Chưa xác định'}
              </strong>
            </span>
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="space-y-3 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <CheckCircle2 className="w-4 h-4 text-[#A67C52]" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              4. Tiện Nghi & Dịch Vụ
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {COMMON_AMENITIES.map((am) => {
              const checked = selectedAmenities.includes(am);
              return (
                <button
                  type="button"
                  key={am}
                  onClick={() => handleToggleAmenity(am)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                    checked
                      ? 'bg-amber-50 border-[#A67C52] text-[#8C6239] shadow-2xs'
                      : 'bg-[#FAF7F2] border-transparent text-slate-600 hover:bg-[#EFE9DF]'
                  }`}
                >
                  <span className="truncate pr-1">{am}</span>
                  {checked && <CheckCircle2 className="w-4 h-4 text-[#A67C52] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Image Upload */}
        <div className="space-y-3 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6DFD3]">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#A67C52]" />
              <h3 className="text-base font-bold text-slate-900 font-serif">
                5. Hình Ảnh Phòng Trọ ({images.length}/6 ảnh)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Ảnh đầu tiên sẽ làm ảnh bìa chính</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs"
              >
                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                
                {/* Cover badge on first image */}
                {idx === 0 ? (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-[#A67C52] text-white text-[9px] font-bold shadow-xs flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" /> Bìa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCoverImage(idx)}
                    className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg bg-black/60 hover:bg-[#A67C52] text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Đặt làm ảnh bìa"
                  >
                    Làm bìa
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                  title="Xóa ảnh"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-[#E6DFD3] hover:border-[#A67C52] bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 text-center px-1">
                  {uploading ? 'Đang tải...' : 'Thêm ảnh'}
                </span>
                <span className="text-[9px] text-slate-400">Tối đa 6 ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleUploadImages}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 6: Description */}
        <div className="space-y-3 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <FileText className="w-4 h-4 text-[#A67C52]" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              6. Mô Tả Chi Tiết Phòng Trọ
            </h3>
          </div>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết về tình trạng phòng, các tiện ích xung quanh (chợ, bến xe, siêu thị), quy định chung (giờ giấc, bạn bè tới chơi, thú cưng)..."
            className="w-full p-4 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] focus:ring-1 focus:ring-[#A67C52] outline-none leading-relaxed transition-all"
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-5 border-t border-[#E6DFD3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/landlord/rooms"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hủy & Quay lại</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('DRAFT')}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-[#FAF7F2] cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
            >
              Lưu Bản Nháp
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('PENDING')}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-[#8C6239] hover:bg-[#6E4B26] text-white text-xs font-bold shadow-md shadow-[#8C6239]/20 hover:shadow-lg cursor-pointer disabled:opacity-50 transition-all"
            >
              {submitting ? 'Đang lưu...' : isEdit && roomStatus === 'REJECTED' ? 'Gửi Duyệt Lại' : 'Gửi Phê Duyệt'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
