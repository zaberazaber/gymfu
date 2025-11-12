import { useEffect, useState } from 'react';
import api from '../utils/api';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get<HealthResponse>('/health');
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend API');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#4F46E5', marginBottom: '0.5rem' }}>
          🏋️ GYMFU
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6B7280' }}>
          Your Fitness, Your Way - Pay Per Session
        </p>
      </header>

      <div style={{ 
        background: '#F9FAFB', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Backend API Status</h2>
        {loading && <p>Checking backend connection...</p>}
        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#991B1B', 
            padding: '1rem', 
            borderRadius: '0.375rem' 
          }}>
            ❌ {error}
          </div>
        )}
        {health && (
          <div style={{ 
            background: '#D1FAE5', 
            color: '#065F46', 
            padding: '1rem', 
            borderRadius: '0.375rem' 
          }}>
            ✅ {health.message}
            <br />
            <small>Timestamp: {new Date(health.timestamp).toLocaleString()}</small>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>🔍 Discover Gyms</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Find gyms near you and book sessions instantly
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>💳 Pay Per Session</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            No memberships, no commitments - pay only when you workout
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>🤖 AI Coach</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Get personalized workout and nutrition plans
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>🛒 Marketplace</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Shop supplements, gear, and healthy foods
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#6B7280' }}>
        <p>Coming soon: User registration, gym discovery, and more!</p>
      </div>
    </div>
  );
}

export default HomePage;
