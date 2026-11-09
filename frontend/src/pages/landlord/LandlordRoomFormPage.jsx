import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
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
  Star
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

const POPULAR_PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Hải Phòng',
  'Cần Thơ',
  'Thừa Thiên Huế',
  'Quảng Ninh',
  'Khánh Hòa',
  'Bắc Ninh',
  'Lâm Đồng',
  'Nghệ An',
  'Thanh Hóa',
  'Khác...'
];

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

  // Location
  const [province, setProvince] = useState('Hà Nội');
  const [customProvince, setCustomProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');

  // Description & Features
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
            const loadedProvince = r.province || 'Hà Nội';
            if (POPULAR_PROVINCES.includes(loadedProvince)) {
              setProvince(loadedProvince);
            } else {
              setProvince('Khác...');
              setCustomProvince(loadedProvince);
            }
            setDistrict(r.district || '');
            setWard(r.ward || '');
            setAddress(r.address || '');

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
      } catch {
        toast.error('Không thể tải biểu mẫu bài đăng!');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

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
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài đăng!');
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
    if (!address.trim()) {
      toast.error('Vui lòng nhập số nhà, tên đường chi tiết!');
      return;
    }

    const effectiveProvince = province === 'Khác...' ? customProvince.trim() : province;
    if (!effectiveProvince) {
      toast.error('Vui lòng chọn hoặc nhập Tỉnh / Thành phố!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        categoryId,
        price: Number(price),
        deposit: deposit ? Number(deposit) : 0,
        area: Number(area),
        capacity: capacity ? Number(capacity) : 2,
        electricityPrice: electricityPrice.trim(),
        waterPrice: waterPrice.trim(),
        servicePrice: servicePrice.trim(),
        province: effectiveProvince,
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

  const effectiveProvince = province === 'Khác...' ? customProvince : province;
  const fullAddressPreview = [address, ward, district, effectiveProvince].filter(Boolean).join(', ');

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
            {submitting ? 'Đang lưu...' : 'Gửi Phê Duyệt'}
          </button>
        </div>
      </div>

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

        {/* Section 3: Location */}
        <div className="space-y-4 pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD3]">
            <MapPin className="w-4 h-4 text-[#A67C52]" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              3. Vị Trí Phòng Trọ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tỉnh / Thành phố <span className="text-rose-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              >
                {POPULAR_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {province === 'Khác...' && (
                <input
                  type="text"
                  value={customProvince}
                  onChange={(e) => setCustomProvince(e.target.value)}
                  placeholder="Nhập tên Tỉnh / Thành phố"
                  className="w-full mt-2 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white rounded-2xl border border-slate-300 focus:border-[#A67C52] outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quận / Huyện
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="VD: Cầu Giấy"
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phường / Xã
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="VD: Dịch Vọng Hậu"
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Địa chỉ chi tiết (Số nhà, tên ngõ, tên đường) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 18 Ngõ 86 Duy Tân"
              required
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 bg-[#FAF7F2] rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            />
          </div>

          {fullAddressPreview && (
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#A67C52] shrink-0" />
              <span>Địa chỉ hiển thị đầy đủ: <strong className="text-slate-800">{fullAddressPreview}</strong></span>
            </div>
          )}
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
              {submitting ? 'Đang lưu...' : 'Gửi Phê Duyệt'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
