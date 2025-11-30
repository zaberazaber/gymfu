import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import './ClassDetailPage.css';

interface Class {
  id: number;
  gymId: number;
  instructorId: number;
  name: string;
  type: 'yoga' | 'zumba' | 'dance' | 'pilates' | 'spinning' | 'crossfit' | 'boxing';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  price: number | string;
  description?: string;
  gymName: string;
  instructorName: string;
  instructorRating: number | string;
  instructorSpecialization: string;
}

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (id) {
      fetchClassDetails();
    }
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/v1/classes/${id}`);
      const data = await response.json();
      if (data.success) {
        setClassData(data.data);
      } else {
        setError(data.message || 'Failed to fetch class details');
      }
    } catch (err: any) {
      setError('Failed to fetch class details');
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!classData) return;

    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gymId: classData.gymId,
          date: getNextClassDate(),
          timeSlot: getNextClassTimeSlot(),
          sessionType: 'class',
          classId: classData.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Class booked successfully!');
        navigate('/bookings');
      } else {
        alert(data.message || 'Failed to book class');
      }
    } catch (err: any) {
      console.error('Error booking class:', err);
      alert('Failed to book class');
    } finally {
      setBooking(false);
    }
  };

  const getNextClassDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextClassTimeSlot = () => {
    if (!classData || classData.schedule.length === 0) return '10:00-11:00';
    const firstSchedule = classData.schedule[0];
    return `${firstSchedule.startTime}-${firstSchedule.endTime}`;
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      yoga: '🧘',
      zumba: '💃',
      dance: '🕺',
      pilates: '🤸',
      spinning: '🚴',
      crossfit: '🏋️',
      boxing: '🥊',
    };
    return icons[type] || '🏃';
  };

  if (loading) {
    return (
      <div className="class-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="class-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Class not found'}</p>
          <button onClick={() => navigate('/classes')} className="back-button">
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-page">
      <div className="class-detail-header">
        <button onClick={() => navigate('/classes')} className="back-button">
          ← Back to Classes
        </button>
      </div>

      <div className="class-detail-content">
        <div className="class-main-info">
          <div className="class-type-badge">
            <span className="type-icon">{getTypeIcon(classData.type)}</span>
            <span className="type-name">{classData.type}</span>
          </div>

          <h1 className="class-title">{classData.name}</h1>

          <div className="class-meta">
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span className="meta-text">{classData.gymName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">💰</span>
              <span className="meta-text">₹{typeof classData.price === 'string' ? parseFloat(classData.price) : classData.price} per session</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span className="meta-text">Max {classData.capacity} participants</span>
            </div>
          </div>

          {classData.description && (
            <div className="class-description">
              <h3>About This Class</h3>
              <p>{classData.description}</p>
            </div>
          )}
        </div>

        <div className="class-sidebar">
          <div className="instructor-card">
            <h3>Your Instructor</h3>
            <div className="instructor-info">
              <div className="instructor-avatar">
                👨‍🏫
              </div>
              <div className="instructor-details">
                <h4>{classData.instructorName}</h4>
                <p className="instructor-specialization">{classData.instructorSpecialization}</p>
                <div className="instructor-rating">
                  <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-number">{typeof classData.instructorRating === 'string' ? parseFloat(classData.instructorRating).toFixed(1) : classData.instructorRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="schedule-card">
            <h3>Class Schedule</h3>
            <div className="schedule-list">
              {classData.schedule.map((schedule, index) => (
                <div key={index} className="schedule-item">
                  <div className="schedule-day">{dayNames[schedule.dayOfWeek]}</div>
                  <div className="schedule-time">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-card">
            <div className="price-display">
              <span className="price-label">Price per session</span>
              <span className="price-amount">₹{typeof classData.price === 'string' ? parseFloat(classData.price) : classData.price}</span>
            </div>
            <button 
              className={`book-button ${booking ? 'booking' : ''}`}
              onClick={handleBookClass}
              disabled={booking}
            >
              {booking ? 'Booking...' : 'Book This Class'}
            </button>
            {!user && (
              <p className="login-notice">
                Please <a href="/login">login</a> to book this class
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
