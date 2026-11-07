import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { Search, Check, X, ShieldCheck, Clock, UserCheck } from 'lucide-react';

export const AdminLandlordListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  const fetchLandlords = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const res = await adminApi.getLandlords(params);
      if (res.code === 200 && res.data) {
        setLandlords(res.data.landlords || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách chủ trọ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) newParams.set('keyword', searchInput.trim());
    else newParams.delete('keyword');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusFilter = (st) => {
    const newParams = new URLSearchParams(searchParams);
    if (st) newParams.set('status', st);
    else newParams.delete('status');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleApprove = async (id) => {
    try {
      const res = await adminApi.approveLandlord(id);
      if (res.code === 200) {
        toast.success(res.message || 'Đã phê duyệt tài khoản Chủ trọ!');
        fetchLandlords();
      }
    } catch {
      toast.error('Phê duyệt thất bại!');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối tài khoản Chủ trọ:', 'Thông tin đăng ký chưa đầy đủ hoặc không hợp lệ');
    if (reason === null) return;
    try {
      const res = await adminApi.rejectLandlord(id, reason);
      if (res.code === 200) {
        toast.success(res.message || 'Đã từ chối tài khoản!');
        fetchLandlords();
      }
    } catch {
      toast.error('Thao tác thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Đối Tác Cho Thuê</span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">Thẩm Định & Duyệt Chủ Trọ</h1>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { label: 'Tất cả', val: '' },
            { label: 'Chờ duyệt', val: 'PENDING' },
            { label: 'Đã duyệt', val: 'APPROVED' },
            { label: 'Từ chối', val: 'REJECTED' }
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => handleStatusFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                status === tab.val ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo họ tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : landlords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Họ tên & Email</th>
                  <th className="py-3.5 px-6">Số điện thoại</th>
                  <th className="py-3.5 px-6">Số bài đăng</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thẩm định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {landlords.map((ll) => (
                  <tr key={ll._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={ll.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{ll.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{ll.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {ll.phone || 'Chưa cung cấp'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {ll.roomCount || 0} phòng
                    </td>
                    <td className="py-4 px-6">
                      {ll.status === 'APPROVED' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã duyệt</span>}
                      {ll.status === 'PENDING' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>}
                      {ll.status === 'REJECTED' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Bị từ chối</span>}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      {ll.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(ll._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                      )}

                      {ll.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleReject(ll._id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">Không tìm thấy tài khoản chủ trọ nào.</div>
        )}
      </div>
    </div>
  );
};

