import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { Search, Lock, Unlock, Users, ShieldAlert } from 'lucide-react';

export const AdminUserListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = searchParams.get('role') || '';
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const res = await adminApi.getUsers(params);
      if (res.code === 200 && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) newParams.set('keyword', searchInput.trim());
    else newParams.delete('keyword');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleRoleFilter = (r) => {
    const newParams = new URLSearchParams(searchParams);
    if (r) newParams.set('role', r);
    else newParams.delete('role');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleToggleBlock = async (id, currentBlocked) => {
    const action = currentBlocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

    try {
      const res = await adminApi.toggleUserBlock(id, !currentBlocked);
      if (res.code === 200) {
        toast.success(res.message || `Đã ${action} tài khoản thành công!`);
        fetchUsers();
      }
    } catch {
      toast.error('Thao tác thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Thành Viên Hệ Thống</span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">Quản Lý Người Dùng</h1>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { label: 'Tất cả', val: '' },
            { label: 'Khách thuê', val: 'CUSTOMER' },
            { label: 'Chủ trọ', val: 'LANDLORD' },
            { label: 'Quản trị viên', val: 'ADMIN' }
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => handleRoleFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                role === tab.val ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
            placeholder="Tìm theo tên, email, SĐT..."
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
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Họ tên & Email</th>
                  <th className="py-3.5 px-6">Vai trò</th>
                  <th className="py-3.5 px-6">Số điện thoại</th>
                  <th className="py-3.5 px-6">Trạng thái khóa</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {u.role === 'ADMIN' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Admin</span>}
                      {u.role === 'LANDLORD' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#A67C52] border border-[#E6DFD3]">Chủ trọ</span>}
                      {u.role === 'CUSTOMER' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Khách thuê</span>}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">
                      {u.phone || 'Chưa có SĐT'}
                    </td>
                    <td className="py-4 px-6">
                      {u.isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Đang bị khóa
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
                            u.isBlocked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                              : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white'
                          }`}
                        >
                          {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.isBlocked ? 'Mở khóa' : 'Khóa'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">Không tìm thấy người dùng nào.</div>
        )}
      </div>
    </div>
  );
};

