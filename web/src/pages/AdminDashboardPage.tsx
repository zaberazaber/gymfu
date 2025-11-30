import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import './AdminDashboardPage.css';

interface DashboardStats {
  totalUsers: number;
  totalGyms: number;
  totalBookings: number;
  totalRevenue: number;
  pendingGyms: number;
  activeUsers: number;
  todayBookings: number;
  todayRevenue: number;
}

interface RecentActivity {
  type: string;
  title: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [token, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity);
      } else {
        setError(data.error || 'Failed to fetch dashboard');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user': return '👤';
      case 'new_booking': return '📅';
      case 'new_gym': return '🏋️';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <nav className="admin-nav">
          <button onClick={() => navigate('/admin/gyms')} className="nav-btn">
            🏋️ Gyms
          </button>
          <button onClick={() => navigate('/admin/users')} className="nav-btn">
            👥 Users
          </button>
          <button onClick={() => navigate('/admin/approvals')} className="nav-btn pending">
            ⏳ Pending ({stats?.pendingGyms || 0})
          </button>
          <button onClick={() => navigate('/')} className="nav-btn home">
            🏠 Home
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-value">{stats?.totalUsers || 0}</p>
              <span className="stat-label">{stats?.activeUsers || 0} active (30d)</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">🏋️</div>
            <div className="stat-info">
              <h3>Total Gyms</h3>
              <p className="stat-value">{stats?.totalGyms || 0}</p>
              <span className="stat-label">{stats?.pendingGyms || 0} pending approval</span>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats?.totalBookings || 0}</p>
              <span className="stat-label">{stats?.todayBookings || 0} today</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <span className="stat-label">{formatCurrency(stats?.todayRevenue || 0)} today</span>
            </div>
          </div>
        </section>

        <section className="dashboard-panels">
          <div className="panel recent-activity">
            <h2>📊 Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <p className="no-activity">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                    <div className="activity-details">
                      <p className="activity-title">{activity.title}</p>
                      <span className="activity-time">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel quick-actions">
            <h2>⚡ Quick Actions</h2>
            <div className="actions-grid">
              <button onClick={() => navigate('/admin/approvals')} className="action-btn">
                <span className="action-icon">✅</span>
                <span>Approve Gyms</span>
              </button>
              <button onClick={() => navigate('/admin/users')} className="action-btn">
                <span className="action-icon">👤</span>
                <span>Manage Users</span>
              </button>
              <button onClick={() => navigate('/admin/gyms')} className="action-btn">
                <span className="action-icon">🏢</span>
                <span>View All Gyms</span>
              </button>
              <button onClick={() => navigate('/admin/logs')} className="action-btn">
                <span className="action-icon">📋</span>
                <span>Activity Logs</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
