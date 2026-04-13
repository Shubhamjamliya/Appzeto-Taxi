import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Eye, FileSearch, MoreHorizontal, RotateCcw, Search, Trash2 } from 'lucide-react';

const DriverDeleteRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchDeletedDrivers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin/drivers/deleted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedDrivers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    if (!activeMenuId) {
      return undefined;
    }

    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId((current) => (current === id ? null : id));
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore driver account?')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/admin/drivers/deleted/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Driver restored');
        fetchDeletedDrivers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE DRIVER? This cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/admin/drivers/deleted/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Driver deleted permanently');
        fetchDeletedDrivers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filteredDrivers = drivers.filter((item) => {
    const name = String(item.name || item.user_id?.name || '').toLowerCase();
    const email = String(item.email || '').toLowerCase();
    const mobile = String(item.mobile || item.phone || item.user_id?.mobile || item.user_id?.phone || '').toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return name.includes(term) || email.includes(term) || mobile.includes(term);
  });

  const safePerPage = Math.max(1, Number(itemsPerPage) || 10);
  const total = filteredDrivers.length;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * safePerPage;
  const pagedDrivers = filteredDrivers.slice(startIndex, startIndex + safePerPage);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = total === 0 ? 0 : Math.min(startIndex + safePerPage, total);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-gray-400">Loading deleted drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Drivers</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Delete Request Drivers</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Delete Request Drivers</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value) || 10)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Mobile Number</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileSearch size={44} strokeWidth={1.5} />
                      <p className="text-sm font-medium">No Data Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedDrivers.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{item.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.mobile || item.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => toggleMenu(e, item._id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                          title="Actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {activeMenuId === item._id ? (
                          <div
                            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/drivers/${item._id}`);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Eye size={16} className="text-indigo-600" />
                              View
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => {
                                setActiveMenuId(null);
                                handleRestore(item._id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <RotateCcw size={16} className="text-emerald-600" />
                              Restore
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => {
                                setActiveMenuId(null);
                                handlePermanentDelete(item._id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} className="text-rose-600" />
                              Permanent Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <div>
            Showing {showingFrom} to {showingTo} of {total} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
              {safePage}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDeleteRequests;

