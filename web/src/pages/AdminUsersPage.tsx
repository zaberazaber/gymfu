import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import './AdminUsersPage.css';

interface User {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  role: string;
  isPartner: boolean;
  createdAt: string;
  totalBookings: number;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModal, setEditModal] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [token, navigate, page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEditModal = (user: User) => {
    setEditModal(user);
    setEditRole(user.role);
    setEditIsAdmin(user.isAdmin);
  };

  const handleUpdateRole = async () => {
    if (!editModal) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${editModal.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editRole, isAdmin: editIsAdmin }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === editModal.id 
            ? { ...u, role: editRole, isAdmin: editIsAdmin }
            : u
        ));
        setEditModal(null);
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeClass = (role: string, isAdmin: boolean) => {
    if (isAdmin) return 'badge admin';
    if (role === 'partner') return 'badge partner';
    return 'badge user';
  };

  return (
    <div className="admin-users">
      <header className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>👥 User Management</h1>
      </header>

      <main className="users-content">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">🔍 Search</button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Bookings</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <div className="contact-info">
                          {user.email && <span>📧 {user.email}</span>}
                          {user.phoneNumber && <span>📱 {user.phoneNumber}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={getRoleBadgeClass(user.role, user.isAdmin)}>
                          {user.isAdmin ? '🛡️ Admin' : user.isPartner ? '🏋️ Partner' : '👤 User'}
                        </span>
                      </td>
                      <td>{user.totalBookings}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button 
                          onClick={() => openEditModal(user)}
                          className="edit-btn"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User Role</h2>
            <p>Editing: {editModal.name}</p>
            
            <div className="form-group">
              <label>Role</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="user">User</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={editIsAdmin}
                  onChange={e => setEditIsAdmin(e.target.checked)}
                />
                Grant Admin Access
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={() => setEditModal(null)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleUpdateRole} className="save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
