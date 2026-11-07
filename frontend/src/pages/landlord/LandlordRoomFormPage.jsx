import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { landlordApi } from '../../api/landlordApi';
import toast from 'react-hot-toast';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Maximize2, 
  FileText, 
  CheckCircle2, 
  Upload, 
  X, 
  ArrowLeft,
  Save,
  Send
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
  'Ban công / Cửa sổ thoáng'
];

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
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
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
            setProvince(r.province || 'Hà Nội');
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
      } catch (err) {
        toast.error('Không thể tải biểu mẫu phòng trọ!');
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
      files.forEach((f) => formData.append('roomImages', f));

      const res = await landlordApi.uploadImages(formData);
      if (res.code === 200 && res.images) {
        setImages((prev) => [...prev, ...res.images].slice(0, 6));
        toast.success(`Đã tải lên ${res.images.length} hình ảnh!`);
      } else {
        toast.error('Tải ảnh thất bại!');
      }
    } catch {
      toast.error('Lỗi tải ảnh lên máy chủ Cloudinary!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (actionStatus = 'PENDING') => {
    if (!title || !categoryId || !price || !area || !address) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
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
        province,
        district,
        ward,
        address: address.trim(),
        description,
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

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
        <div>
          <Link to="/landlord/rooms" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-1 no-underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách bài đăng</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            {isEdit ? 'Chỉnh Sửa Bài Đăng' : 'Đăng Tin Phòng Trọ Mới'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Lưu Nháp
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('PENDING')}
            className="px-5 py-2 rounded-2xl bg-[#A67C52] hover:bg-[#8C6239] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi Phê Duyệt'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFD3] shadow-xs space-y-6">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-2">
            1. Thông Tin Cơ Bản
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Phòng Studio Full Nội Thất Gần ĐH Bách Khoa, Khóa Vân Tay"
              required
              className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Loại phòng trọ <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diện tích (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="VD: 28"
                min="1"
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giá cho thuê (VNĐ/tháng) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 4500000"
                step="50000"
                required
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tiền đặt cọc (VNĐ)
              </label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="VD: 4500000"
                step="50000"
                className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-2">
            2. Vị Trí Phòng Trọ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tỉnh / Thành phố</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quận / Huyện</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="VD: Cầu Giấy"
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phường / Xã</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="VD: Dịch Vọng Hậu"
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ chi tiết (Số nhà, ngõ, tên đường) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 18 Ngõ 86 Duy Tân"
              required
              className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200"
            />
          </div>
        </div>

        {/* Section 3: Amenities */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-2">
            3. Tiện Nghi & Dịch Vụ
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COMMON_AMENITIES.map((am) => {
              const checked = selectedAmenities.includes(am);
              return (
                <button
                  type="button"
                  key={am}
                  onClick={() => handleToggleAmenity(am)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                    checked
                      ? 'bg-amber-50/80 border-[#A67C52] text-[#8C6239]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{am}</span>
                  {checked && <CheckCircle2 className="w-4 h-4 text-[#A67C52]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Image Upload */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              4. Hình Ảnh Thực Tế (Tối đa 6 ảnh)
            </h3>
            <span className="text-xs text-slate-400">Ảnh đầu tiên sẽ làm ảnh đại diện</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={img} alt="Upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#A67C52] bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500">
                  {uploading ? 'Đang tải...' : 'Thêm ảnh'}
                </span>
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

        {/* Section 5: Description */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-serif">
            5. Mô Tả Chi Tiết Phòng Trọ
          </h3>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả về phòng, chi phí điện nước, gửi xe, giờ giấc quy định..."
            className="w-full p-3.5 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-[#A67C52] outline-none leading-relaxed"
          />
        </div>

      </div>
    </div>
  );
};
