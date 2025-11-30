import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserBookings, checkInBooking, cancelBooking, getBookingQRCode, clearError } from '../store/bookingSlice';
import './BookingHistoryPage.css';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { bookings, qrCodeData, loading, error } = useAppSelector(state => state.booking);
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(getUserBookings());
    }
  }, [user, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCheckIn = async (bookingId: number) => {
    try {
      await dispatch(checkInBooking(bookingId)).unwrap();
      dispatch(getUserBookings());
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await dispatch(cancelBooking(bookingId)).unwrap();
        dispatch(getUserBookings());
      } catch (error) {
        console.error('Cancellation failed:', error);
      }
    }
  };

  const handleShowQRCode = async (bookingId: number) => {
    try {
      await dispatch(getBookingQRCode(bookingId)).unwrap();
      setSelectedBookingId(bookingId);
      setShowQRModal(true);
    } catch (error) {
      console.error('Failed to get QR code:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      confirmed: 'status-confirmed',
      checked_in: 'status-checked-in',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      pending: 'status-pending'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const isQRCodeExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const canCheckIn = (booking: any) => {
    return booking.status === 'confirmed' && 
           booking.qrCode && 
           !isQRCodeExpired(booking.qrCodeExpiry);
  };

  const canCancel = (booking: any) => {
    return booking.status === 'confirmed' || booking.status === 'pending';
  };

  if (!user) {
    return (
      <div className="booking-history-page">
        <div className="booking-history-container">
          <h2>Please log in to view your bookings</h2>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="booking-history-page">
        <div className="booking-history-container">
          <div className="loading">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
      <div className="booking-history-container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <button 
            onClick={() => navigate('/gyms')} 
            className="btn btn-primary"
          >
            Book New Session
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>You haven't made any gym bookings yet. Start by exploring gyms near you!</p>
            <button 
              onClick={() => navigate('/gyms')} 
              className="btn btn-primary"
            >
              Find Gyms
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="gym-info">
                    <h3>{booking.gymName || 'Unknown Gym'}</h3>
                    {booking.sessionType === 'class' && booking.className && (
                      <div className="class-info-badge">
                        <span className="class-icon">🧘</span>
                        <span className="class-name">{booking.className}</span>
                        {booking.instructorName && (
                          <span className="instructor-name">with {booking.instructorName}</span>
                        )}
                      </div>
                    )}
                    <p className="gym-address">{booking.gymAddress}</p>
                    <p className="gym-city">{booking.gymCity}, {booking.gymPincode}</p>
                  </div>
                  <div className="booking-status">
                    <div className="session-type-badge">
                      {booking.sessionType === 'class' ? '🧘 Class' : '🏋️ Gym'}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Session Date:</span>
                    <span className="value">
                      {new Date(booking.sessionDate).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value price">₹{booking.price}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Booked on:</span>
                    <span className="value">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {booking.checkInTime && (
                    <div className="detail-item">
                      <span className="label">Checked in:</span>
                      <span className="value">
                        {new Date(booking.checkInTime).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {booking.gymAmenities && booking.gymAmenities.length > 0 && (
                    <div className="detail-item">
                      <span className="label">Amenities:</span>
                      <div className="amenities-list">
                        {booking.gymAmenities.map((amenity: string, index: number) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {canCheckIn(booking) && (
                    <button
                      onClick={() => handleCheckIn(booking.id)}
                      className="btn btn-success"
                      disabled={loading}
                    >
                      Check In
                    </button>
                  )}
                  
                  {booking.qrCode && (
                    <button
                      onClick={() => handleShowQRCode(booking.id)}
                      className="btn btn-info"
                      disabled={loading}
                    >
                      Show QR Code
                    </button>
                  )}
                  
                  {canCancel(booking) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="btn btn-danger"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {booking.qrCodeExpiry && isQRCodeExpired(booking.qrCodeExpiry) && (
                  <div className="qr-expired-notice">
                    ⚠️ QR Code has expired
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && qrCodeData && selectedBookingId && (
          <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Booking QR Code</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowQRModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="qr-code-display">
                  <img 
                    src={qrCodeData.qrCodeImage} 
                    alt="Booking QR Code" 
                    className="qr-code-image"
                  />
                  <p className="qr-code-text">{qrCodeData.qrCodeString}</p>
                  <p className="qr-instructions">
                    Show this QR code at the gym to check in
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
