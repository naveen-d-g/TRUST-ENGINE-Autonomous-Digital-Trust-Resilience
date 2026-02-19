import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { userService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/auth';

const UserManagement = () => {

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ user_id: '', email: '', password: '', role: UserRole.ANALYST });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.listUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      setSuccessMessage('User created successfully!');
      setShowCreateModal(false);
      setFormData({ user_id: '', email: '', password: '', role: UserRole.ANALYST });
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        email: editingUser.email,
        role: editingUser.role,
      };
      if (editingUser.password) {
        updateData.password = editingUser.password;
      }
      await userService.updateUser(editingUser.user_id, updateData);
      setSuccessMessage('User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user, password: '' });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(userId);
      setSuccessMessage('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err);
    }
  };

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">Only administrators can access user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-black text-white tracking-tighter">User Management</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Manage system users and access control.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl p-4 text-success">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}

      <div className="bg-card border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/40 border-b border-slate-700/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Login</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-48"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                  <td className="px-6 py-6"></td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs text-slate-300 font-medium">{user.user_id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-white font-medium">{user.email}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      user.role === UserRole.ADMIN ? 'bg-primary/20 text-primary border-primary/30' :
                      user.role === UserRole.ANALYST ? 'bg-success/20 text-success border-success/30' :
                      'bg-slate-700/20 text-slate-400 border-slate-600/30'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-400 font-medium">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        disabled={user.user_id === currentUser?.user_id}
                        className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No users found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User ID</label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={UserRole.ANALYST}>Analyst</option>
                  <option value={UserRole.VIEWER}>Viewer</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Edit User</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User ID</label>
                <input
                  type="text"
                  value={editingUser.user_id}
                  disabled
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={UserRole.ANALYST}>Analyst</option>
                  <option value={UserRole.VIEWER}>Viewer</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
