import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import './AdminApprovalsPage.css';

interface PendingGym {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  address: string;
  city: string;
  basePrice: number;
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [pendingGyms, setPendingGyms] = useState<PendingGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ gymId: number; gymName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPendingGyms();
  }, [token, navigate]);

  const fetchPendingGyms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gyms/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(data.data);
      } else {
        setError(data.error || 'Failed to fetch pending gyms');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gymId: number) => {
    setActionLoading(gymId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gyms/${gymId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(prev => prev.filter(gym => gym.id !== gymId));
      } else {
        alert(data.error || 'Failed to approve gym');
      }
    } catch (err) {
      alert('Failed to approve gym');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    
    setActionLoading(rejectModal.gymId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gyms/${rejectModal.gymId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(prev => prev.filter(gym => gym.id !== rejectModal.gymId));
        setRejectModal(null);
        setRejectReason('');
      } else {
        alert(data.error || 'Failed to reject gym');
      }
    } catch (err) {
      alert('Failed to reject gym');
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return (
      <div className="admin-approvals">
        <div className="loading">Loading pending gyms...</div>
      </div>
    );
  }

  return (
    <div className="admin-approvals">
      <header className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>⏳ Pending Gym Approvals</h1>
        <p>{pendingGyms.length} gym(s) awaiting approval</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="approvals-content">
        {pendingGyms.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <h2>All caught up!</h2>
            <p>No gyms pending approval at the moment.</p>
          </div>
        ) : (
          <div className="gyms-list">
            {pendingGyms.map(gym => (
              <div key={gym.id} className="gym-card">
                <div className="gym-header">
                  <h3>{gym.name}</h3>
                  <span className="pending-badge">Pending</span>
                </div>
                
                <div className="gym-details">
                  <div className="detail-row">
                    <span className="label">📍 Location:</span>
                    <span>{gym.address}, {gym.city}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">👤 Owner:</span>
                    <span>{gym.ownerName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📧 Email:</span>
                    <span>{gym.ownerEmail || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">💰 Base Price:</span>
                    <span>{formatCurrency(gym.basePrice)}/session</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Submitted:</span>
                    <span>{formatDate(gym.createdAt)}</span>
                  </div>
                </div>

                <div className="gym-actions">
                  <button
                    onClick={() => handleApprove(gym.id)}
                    disabled={actionLoading === gym.id}
                    className="approve-btn"
                  >
                    {actionLoading === gym.id ? 'Processing...' : '✅ Approve'}
                  </button>
                  <button
                    onClick={() => setRejectModal({ gymId: gym.id, gymName: gym.name })}
                    disabled={actionLoading === gym.id}
                    className="reject-btn"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reject Gym</h2>
            <p>Are you sure you want to reject "{rejectModal.gymName}"?</p>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="modal-actions">
              <button onClick={() => setRejectModal(null)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleReject} className="confirm-reject-btn">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
