'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/endpoints';
import { getUser, isAuthenticated } from '@/lib/auth';
import type { User, Role } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { RoleBadge } from '@/components/Badges';
import toast from 'react-hot-toast';
import {
  Users, Search, Trash2, Shield, UserCheck, UserX,
  ChevronLeft, ChevronRight, X, MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const router = useRouter();
  const currentUser = getUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [roleModal, setRoleModal] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('USER');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (currentUser?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search: search || undefined, page, size: 15 });
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); fetchUsers(); };

  const handleToggle = async (user: User) => {
    try {
      const res = await adminApi.toggleEnabled(user.id);
      setUsers(us => us.map(u => u.id === user.id ? res.data : u));
      toast.success(`User ${res.data.enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminApi.deleteUser(confirmDelete.id);
      setUsers(us => us.filter(u => u.id !== confirmDelete.id));
      setConfirmDelete(null);
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const handleRoleUpdate = async () => {
    if (!roleModal) return;
    try {
      const res = await adminApi.updateRole(roleModal.id, newRole);
      setUsers(us => us.map(u => u.id === roleModal.id ? res.data : u));
      setRoleModal(null);
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={24} /> User Management
            </h1>
            <p className="page-subtitle">Manage users, roles, and account status</p>
          </div>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="label">Search Users</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or username..." style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary"><Search size={14} /> Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(0); fetchUsers(); }}
                className="btn btn-secondary"><X size={14} /> Clear</button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <Users size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: '#94a3b8' }}>No users found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: user.role === 'ADMIN'
                            ? 'linear-gradient(135deg, #f43f5e, #f97316)'
                            : user.role === 'SUPPORT_AGENT'
                              ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                              : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8125rem', fontWeight: 700, color: 'white',
                        }}>
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: '#f1f5f9', fontSize: '0.875rem' }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8125rem' }}>@{user.username}</td>
                    <td><RoleBadge role={user.role} /></td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: user.enabled ? '#34d399' : '#94a3b8',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.enabled ? '#34d399' : '#475569', display: 'block' }} />
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setRoleModal(user); setNewRole(user.role); }}
                          className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title="Change Role">
                          <Shield size={13} />
                        </button>
                        <button onClick={() => handleToggle(user)}
                          className={`btn ${user.enabled ? 'btn-danger' : 'btn-success'}`}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title={user.enabled ? 'Disable' : 'Enable'}>
                          {user.enabled ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button onClick={() => setConfirmDelete(user)}
                            className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            title="Delete User">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: '#f1f5f9' }}>Confirm Delete</h3>
              <button onClick={() => setConfirmDelete(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#94a3b8' }}>
                Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{confirmDelete.fullName}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={15} /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role change modal */}
      {roleModal && (
        <div className="modal-overlay" onClick={() => setRoleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: '#f1f5f9' }}>Change Role</h3>
              <button onClick={() => setRoleModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Updating role for <strong style={{ color: '#f1f5f9' }}>{roleModal.fullName}</strong>
              </p>
              <label className="label">New Role</label>
              <select className="input" value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
                <option value="USER">User</option>
                <option value="SUPPORT_AGENT">Support Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="modal-footer">
              <button onClick={() => setRoleModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleRoleUpdate} className="btn btn-primary">
                <Shield size={15} /> Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
