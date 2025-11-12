import { useState, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyOTP, clearError } from '../store/authSlice';
import './OTPVerificationPage.css';

export default function OTPVerificationPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error, registrationIdentifier } = useAppSelector((state) => state.auth);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no registration identifier
    if (!registrationIdentifier) {
        navigate('/register');
        return null;
    }

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted data is 6 digits
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(clearError());

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            return;
        }

        // Determine if identifier is phone or email
        const isPhone = /^\d+$/.test(registrationIdentifier);
        const data = {
            otp: otpString,
            ...(isPhone ? { phoneNumber: registrationIdentifier } : { email: registrationIdentifier }),
        };

        const result = await dispatch(verifyOTP(data));

        if (verifyOTP.fulfilled.match(result)) {
            // Navigate to home page on success
            navigate('/');
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <div className="otp-container">
            <div className="otp-card">
                <div className="otp-icon">📱</div>
                <h1>Verify OTP</h1>
                <p className="subtitle">
                    We've sent a 6-digit code to<br />
                    <strong>{registrationIdentifier}</strong>
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                disabled={loading}
                                className="otp-input"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!isOtpComplete || loading}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <div className="resend-section">
                    <p>Didn't receive the code?</p>
                    <button
                        type="button"
                        className="resend-btn"
                        onClick={() => {
                            // TODO: Implement resend OTP
                            alert('Resend OTP functionality coming soon!');
                        }}
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                </div>

                <div className="back-link">
                    <a
                        href="/register"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/register');
                        }}
                    >
                        ← Back to Registration
                    </a>
                </div>
            </div>
        </div>
    );
}
