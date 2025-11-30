import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { createBooking, verifyPayment, clearError } from '../store/bookingSlice';
import './BookingPage.css';

export default function BookingPage() {
    const { gymId } = useParams<{ gymId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { selectedGym, loading: gymLoading } = useAppSelector(state => state.gym);
    const { selectedBooking, loading: bookingLoading, error } = useAppSelector(state => state.booking);
    const { user } = useAppSelector(state => state.auth);

    const [sessionDate, setSessionDate] = useState('');
    const [sessionTime, setSessionTime] = useState('10:00');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [useRewardPoints, setUseRewardPoints] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        if (gymId) {
            dispatch(getGymById(parseInt(gymId)));
        }
        // Fetch reward points balance
        fetchRewardBalance();
    }, [gymId, dispatch]);

    const fetchRewardBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/referrals/balance', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setRewardPoints(data.data.rewardPoints);
            }
        } catch (error) {
            console.error('Error fetching reward balance:', error);
        }
    };

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

    useEffect(() => {
        if (useRewardPoints && pointsToUse > 0 && selectedGym) {
            calculateDiscount();
        } else {
            setDiscountAmount(0);
        }
    }, [useRewardPoints, pointsToUse, selectedGym]);

    const calculateDiscount = async () => {
        if (!selectedGym || pointsToUse <= 0) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/referrals/calculate-discount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingAmount: selectedGym.basePrice,
                    pointsToUse: pointsToUse,
                }),
            });
            const data = await response.json();
            if (data.success && data.data.canApply) {
                setDiscountAmount(data.data.discountAmount);
            } else {
                setDiscountAmount(0);
                if (!data.data.canApply) {
                    alert(data.data.message);
                }
            }
        } catch (error) {
            console.error('Error calculating discount:', error);
        }
    };

    const handleBooking = async () => {
        if (!sessionDate || !sessionTime) {
            alert('Please select date and time');
            return;
        }

        const dateTime = new Date(`${sessionDate}T${sessionTime}:00`);

        // Step 1: Create booking (status: pending)
        const result = await dispatch(createBooking({
            gymId: parseInt(gymId!),
            sessionDate: dateTime.toISOString(),
            useRewardPoints: useRewardPoints,
            pointsToUse: pointsToUse,
        }));

        if (createBooking.fulfilled.match(result)) {
            const booking = result.payload;
            
            // Step 2: Open Razorpay payment modal
            if (booking.razorpayOrderId) {
                openRazorpayModal(booking);
            } else {
                alert('Failed to initialize payment. Please try again.');
            }
        }
    };

    const openRazorpayModal = (booking: any) => {
        const options: RazorpayOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: booking.price * 100, // Amount in paise
            currency: 'INR',
            name: 'GymFu',
            description: `Booking for ${selectedGym?.name}`,
            order_id: booking.razorpayOrderId,
            handler: async (response: RazorpaySuccessResponse) => {
                setProcessingPayment(true);
                
                // Step 3: Verify payment on backend
                const verifyResult = await dispatch(verifyPayment({
                    bookingId: booking.id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                }));

                setProcessingPayment(false);

                if (verifyPayment.fulfilled.match(verifyResult)) {
                    setShowConfirmation(true);
                } else {
                    alert('Payment verification failed. Please contact support.');
                }
            },
            prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: user?.phoneNumber || '',
            },
            theme: {
                color: '#6366f1',
            },
            modal: {
                ondismiss: () => {
                    alert('Payment cancelled. Your booking is still pending. You can complete payment from booking history.');
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
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
                            <span className="value">
                                {selectedGym.currentOccupancy || 0}/{selectedGym.capacity} people
                                {selectedGym.currentOccupancy >= selectedGym.capacity && (
                                    <span className="capacity-full"> (Full)</span>
                                )}
                            </span>
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

                    {rewardPoints > 0 && (
                        <div className="reward-points-section">
                            <div className="reward-header">
                                <span>💎 You have {rewardPoints} reward points (₹{rewardPoints})</span>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={useRewardPoints}
                                        onChange={(e) => setUseRewardPoints(e.target.checked)}
                                    />
                                    Use reward points for discount
                                </label>
                            </div>
                            {useRewardPoints && (
                                <div className="form-group">
                                    <label htmlFor="pointsToUse">Points to use (max {Math.min(rewardPoints, selectedGym.basePrice)})</label>
                                    <input
                                        type="number"
                                        id="pointsToUse"
                                        value={pointsToUse}
                                        onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                                        min="0"
                                        max={Math.min(rewardPoints, selectedGym.basePrice)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="price-summary">
                        <div className="price-row">
                            <span>Session Price:</span>
                            <span>₹{selectedGym.basePrice}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="price-row discount">
                                <span>Reward Discount:</span>
                                <span>-₹{discountAmount}</span>
                            </div>
                        )}
                        <div className="price-row total">
                            <span>Total:</span>
                            <span>₹{selectedGym.basePrice - discountAmount}</span>
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
                        disabled={bookingLoading || processingPayment || !sessionDate || !sessionTime}
                        className="btn-book"
                    >
                        {processingPayment ? 'Processing Payment...' : bookingLoading ? 'Creating Booking...' : 'Proceed to Payment'}
                    </button>

                    <p className="booking-note">
                        * Payment is required to confirm your booking. You'll receive a QR code after successful payment.
                    </p>
                </div>
            </div>
        </div>
    );
}
