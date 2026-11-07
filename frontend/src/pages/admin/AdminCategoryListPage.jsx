import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Tags, Layers } from 'lucide-react';

export const AdminCategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.code === 200 && res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên loại phòng!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.createCategory({ title: title.trim(), description: description.trim() });
      if (res.code === 200) {
        toast.success(res.message || 'Đã thêm danh mục mới!');
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchCategories();
      }
    } catch {
      toast.error('Không thể tạo danh mục!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này?')) return;
    try {
      const res = await adminApi.deleteCategory(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã xóa danh mục!');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {
      toast.error('Xóa danh mục thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Phân Loại Phòng</span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">Danh Mục Loại Phòng Trọ</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Loại Phòng Mới</span>
        </button>
      </div>

      {/* Grid of categories */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white/60 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Tags className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {cat.roomCount || 0} bài đăng
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-serif">{cat.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'Chưa có mô tả cho loại phòng này.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">slug: {cat.slug || cat._id}</span>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Xóa danh mục"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
          Chưa có danh mục nào được khởi tạo.
        </div>
      )}

      {/* Modal Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-serif text-slate-900">Thêm Loại Phòng Mới</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên loại phòng</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Căn Hộ Penthouse"
                  required
                  className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tiêu chuẩn, không gian..."
                  className="w-full p-3 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang thêm...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

