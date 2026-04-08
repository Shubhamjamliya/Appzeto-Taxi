import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, UserPlus, Star, MoreHorizontal, X,
  ChevronRight, UserCheck, Edit2, Lock, Trash2,
  CheckCircle2, Printer, Copy, Loader2
} from 'lucide-react';

const StatusToggle = ({ status, onToggle }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${status === 'Active' ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
  </button>
);

import UserModal from './UserModal';
import { adminService } from '../../services/adminService';

const UserList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const resData = await adminService.getUsers(1, 50);
      if (resData.success) {
        const mapped = (resData.data?.results || []).map(u => ({
          id: u._id,
          name: u.name || 'Anonymous',
          email: u.email || 'N/A',
          phone: u.mobile || 'N/A',
          rides: 0,
          rating: 0.0,
          wallet: `₹${u.wallet_balance || 0}`,
          status: u.active ? 'Active' : 'Suspended',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
        }));
        setUsers(mapped);
      } else {
        setError(resData.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone.includes(searchTerm);
    return matchesSearch;
  });

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? false : true;
      const resData = await adminService.updateUser(userId, { active: newStatus });
      if (resData.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus ? 'Active' : 'Suspended' } : u));
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleAddUser = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleEditUser = (user) => { setEditingUser(user); setIsModalOpen(true); };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const resData = await adminService.deleteUser(userId);
        if (resData.success) setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        console.error('Failed to delete user', err);
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const resData = editingUser 
        ? await adminService.updateUser(editingUser.id, formData)
        : await adminService.createUser(formData);
      if (resData.success) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert(resData.message || 'Operation failed');
      }
    } catch (err) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectedRows.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id));
  };

  const toggleRowSelect = (id) => {
    setSelectedRows(selectedRows.includes(id) ? selectedRows.filter(r => r !== id) : [...selectedRows, id]);
  };

  const toggleMenu = (e, userId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <span>Users</span>
        <ChevronRight size={12} />
        <span className="text-gray-700">All Users</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Passengers</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button 
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus size={15} /> New User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selectedRows.length === filteredUsers.length && filteredUsers.length > 0 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}
                  >
                    {selectedRows.length === filteredUsers.length && filteredUsers.length > 0 && <CheckCircle2 size={10} />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Wallet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${selectedRows.includes(user.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleRowSelect(user.id); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selectedRows.includes(user.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}
                    >
                      {selectedRows.includes(user.id) && <CheckCircle2 size={10} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-xs flex items-center justify-center">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusToggle status={user.status} onToggle={() => handleToggleStatus(user.id, user.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      {user.rating} <Star size={12} className="fill-amber-400 text-amber-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.wallet}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{user.joined}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleMenu(e, user.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button onClick={() => navigate(`/admin/users/${user.id}`)} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <UserCheck size={13} className="text-emerald-500" /> View Profile
                          </button>
                          <button onClick={() => handleEditUser(user)} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Edit2 size={13} className="text-blue-500" /> Edit
                          </button>
                          <button onClick={() => handleEditUser(user)} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Lock size={13} className="text-amber-500" /> Update Password
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button onClick={() => handleDeleteUser(user.id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        editingUser={editingUser}
        isLoading={isSubmitting}
      />

      {/* Selection bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-6 z-[100]">
          <div className="flex items-center gap-3 pr-6 border-r border-white/20">
            <button onClick={() => setSelectedRows([])} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X size={14} />
            </button>
            <span className="text-sm font-medium">{selectedRows.length} selected</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-xs hover:text-indigo-300 transition-colors"><Printer size={14} /> Print</button>
            <button className="flex items-center gap-1.5 text-xs hover:text-indigo-300 transition-colors"><Copy size={14} /> Copy</button>
            <button className="flex items-center gap-1.5 text-xs hover:text-indigo-300 transition-colors"><Download size={14} /> Export</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
