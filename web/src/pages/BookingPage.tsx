import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { createBooking, clearError } from '../store/bookingSlice';
import './BookingPage.css';

export default function BookingPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedGym, loading: gymLoading } = useAppSelector(state => state.gym);
  const { selectedBooking, loading: bookingLoading, error } = useAppSelector(state => state.booking);
  
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('10:00');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (gymId) {
      dispatch(getGymById(parseInt(gymId)));
    }
  }, [gymId, dispatch]);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSessionDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedBooking && selectedBooking.status === 'confirmed') {
      setShowConfirmation(true);
    }
  }, [selectedBooking]);

  const handleBooking = async () => {
    if (!sessionDate || !sessionTime) {
      alert('Please select date and time');
      return;
    }

    const dateTime = new Date(`${sessionDate}T${sessionTime}:00`);
    
    const result = await dispatch(createBooking({
      gymId: parseInt(gymId!),
      sessionDate: dateTime.toISOString(),
    }));

    if (createBooking.fulfilled.match(result)) {
      setShowConfirmation(true);
    }
  };

  const handleViewHistory = () => {
    navigate('/bookings');
  };

  if (gymLoading) {
    return <div className="booking-page"><div className="loading">Loading gym details...</div></div>;
  }

  if (!selectedGym) {
    return <div className="booking-page"><div className="error">Gym not found</div></div>;
  }

  if (showConfirmation && selectedBooking) {
    return (
      <div className="booking-page">
        <div className="confirmation-container">
          <div className="confirmation-header">
            <h1>✅ Booking Confirmed!</h1>
            <p>Your gym session has been booked successfully</p>
          </div>

          <div className="booking-details">
            <h2>{selectedGym.name}</h2>
            <p className="address">{selectedGym.address}</p>
            <p className="city">{selectedGym.city}</p>
            
            <div className="booking-info">
              <div className="info-row">
                <span className="label">Session Date:</span>
                <span className="value">{new Date(selectedBooking.sessionDate).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Price:</span>
                <span className="value">₹{selectedBooking.price}</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-confirmed">{selectedBooking.status}</span>
              </div>
              <div className="info-row">
                <span className="label">Booking ID:</span>
                <span className="value">#{selectedBooking.id}</span>
              </div>
            </div>

            {selectedBooking.qrCodeImage && (
              <div className="qr-code-section">
                <h3>Your QR Code</h3>
                <p className="qr-instructions">Show this QR code at the gym to check in</p>
                <img src={selectedBooking.qrCodeImage} alt="Booking QR Code" className="qr-code" />
                <p className="qr-code-string">{selectedBooking.qrCode}</p>
                {selectedBooking.qrCodeExpiry && (
                  <p className="qr-expiry">
                    Valid until: {new Date(selectedBooking.qrCodeExpiry).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="confirmation-actions">
            <button onClick={handleViewHistory} className="btn-secondary">
              View My Bookings
            </button>
            <button onClick={() => navigate('/gyms')} className="btn-primary">
              Book Another Gym
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="gym-details">
          <h1>{selectedGym.name}</h1>
          <p className="address">{selectedGym.address}</p>
          <p className="city">{selectedGym.city}, {selectedGym.pincode}</p>
          
          <div className="gym-info">
            <div className="info-item">
              <span className="label">Rating:</span>
              <span className="value">⭐ {selectedGym.rating}</span>
            </div>
            <div className="info-item">
              <span className="label">Price:</span>
              <span className="value">₹{selectedGym.basePrice}/session</span>
            </div>
            <div className="info-item">
              <span className="label">Capacity:</span>
              <span className="value">{selectedGym.capacity} people</span>
            </div>
          </div>

          {selectedGym.amenities && selectedGym.amenities.length > 0 && (
            <div className="amenities">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {selectedGym.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="booking-form">
          <h2>Book Your Session</h2>
          
          <div className="form-group">
            <label htmlFor="sessionDate">Select Date</label>
            <input
              type="date"
              id="sessionDate"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sessionTime">Select Time</label>
            <input
              type="time"
              id="sessionTime"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              required
            />
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Session Price:</span>
              <span>₹{selectedGym.basePrice}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>₹{selectedGym.basePrice}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => dispatch(clearError())} className="close-error">×</button>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={bookingLoading || !sessionDate || !sessionTime}
            className="btn-book"
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </button>

          <p className="booking-note">
            * Your booking will be confirmed instantly and you'll receive a QR code
          </p>
        </div>
      </div>
    </div>
  );
}
