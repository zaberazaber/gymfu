import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import './AdminGymsPage.css';

interface Gym {
  id: number;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  isVerified: boolean;
  basePrice: number;
  rating: number;
  totalBookings: number;
  createdAt: string;
}

export default function AdminGymsPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchGyms();
  }, [token, navigate, page, filter]);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (filter !== 'all') {
        params.append('verified', filter === 'verified' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/admin/gyms?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setGyms(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.error || 'Failed to fetch gyms');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gymId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gyms/${gymId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setGyms(prev => prev.map(g => 
          g.id === gymId ? { ...g, isVerified: true } : g
        ));
      } else {
        alert(data.error || 'Failed to approve gym');
      }
    } catch (err) {
      alert('Failed to approve gym');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="admin-gyms">
      <header className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>🏋️ Gym Management</h1>
      </header>

      <main className="gyms-content">
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            All Gyms
          </button>
          <button 
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => { setFilter('verified'); setPage(1); }}
          >
            ✅ Verified
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => { setFilter('pending'); setPage(1); }}
          >
            ⏳ Pending
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading gyms...</div>
        ) : (
          <>
            <div className="gyms-grid">
              {gyms.map(gym => (
                <div key={gym.id} className={`gym-card ${gym.isVerified ? 'verified' : 'pending'}`}>
                  <div className="gym-header">
                    <h3>{gym.name}</h3>
                    <span className={`status-badge ${gym.isVerified ? 'verified' : 'pending'}`}>
                      {gym.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  
                  <div className="gym-info">
                    <p><span>📍</span> {gym.address}, {gym.city}</p>
                    <p><span>👤</span> {gym.ownerName || 'N/A'}</p>
                    <p><span>💰</span> {formatCurrency(gym.basePrice)}/session</p>
                    <p><span>⭐</span> {gym.rating?.toFixed(1) || 'N/A'}</p>
                    <p><span>📅</span> {gym.totalBookings} bookings</p>
                    <p><span>🗓️</span> Added {formatDate(gym.createdAt)}</p>
                  </div>

                  <div className="gym-actions">
                    <button 
                      onClick={() => navigate(`/gyms/${gym.id}`)}
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                    {!gym.isVerified && (
                      <button 
                        onClick={() => handleApprove(gym.id)}
                        className="approve-btn"
                      >
                        ✅ Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {gyms.length === 0 && (
              <div className="empty-state">
                <p>No gyms found</p>
              </div>
            )}

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
    </div>
  );
}
