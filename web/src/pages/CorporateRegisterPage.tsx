import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CorporateRegisterPage.css';

export default function CorporateRegisterPage() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        companyName: '',
        contactEmail: '',
        contactPhone: '',
        contactPerson: '',
        packageType: 'standard',
        totalSessions: 100,
        durationMonths: 12,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const packages = {
        basic: { price: 150, discount: 0, description: 'Perfect for small teams' },
        standard: { price: 120, discount: 20, description: 'Best for growing companies' },
        premium: { price: 100, discount: 33, description: 'Ideal for large enterprises' },
    };
    
    const selectedPackage = packages[formData.packageType as keyof typeof packages];
    const totalAmount = selectedPackage.price * formData.totalSessions;
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const response = await fetch('/api/v1/corporate/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(`Registration Successful!\n\nYour corporate account has been created.\nAccount ID: ${data.data.id}\n\nYou can now add employees and manage your account.`);
                navigate(`/corporate/dashboard/${data.data.id}`);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Failed to register. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="corporate-register-page">
            <div className="register-container">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← Back
                </button>
                
                <div className="register-header">
                    <h1>🏢 Corporate Wellness Program</h1>
                    <p>Provide your employees with access to premium gym facilities</p>
                </div>
                
                <div className="register-content">
                    <div className="register-form-section">
                        <h2>Company Information</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="companyName">Company Name *</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                    placeholder="Enter your company name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="contactPerson">Contact Person *</label>
                                <input
                                    type="text"
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    required
                                    placeholder="HR Manager or Admin name"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="contactEmail">Contact Email *</label>
                                    <input
                                        type="email"
                                        id="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        required
                                        placeholder="hr@company.com"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="contactPhone">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        id="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        required
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>
                            
                            <div className="package-selection">
                                <h3>Select Package</h3>
                                <div className="package-cards">
                                    {Object.entries(packages).map(([key, pkg]) => (
                                        <div
                                            key={key}
                                            className={`package-card ${formData.packageType === key ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, packageType: key })}
                                        >
                                            <div className="package-name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                            <div className="package-price">₹{pkg.price}/session</div>
                                            {pkg.discount > 0 && (
                                                <div className="package-discount">{pkg.discount}% OFF</div>
                                            )}
                                            <div className="package-description">{pkg.description}</div>
                                            {formData.packageType === key && (
                                                <div className="package-selected-badge">✓ Selected</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="totalSessions">Number of Sessions *</label>
                                    <input
                                        type="number"
                                        id="totalSessions"
                                        value={formData.totalSessions}
                                        onChange={(e) => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 0 })}
                                        required
                                        min="10"
                                        step="10"
                                    />
                                    <small>Minimum 10 sessions</small>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="durationMonths">Duration (Months) *</label>
                                    <select
                                        id="durationMonths"
                                        value={formData.durationMonths}
                                        onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months</option>
                                        <option value="24">24 Months</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pricing-summary">
                                <h3>Pricing Summary</h3>
                                <div className="summary-row">
                                    <span>Price per session:</span>
                                    <span>₹{selectedPackage.price}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Total sessions:</span>
                                    <span>{formData.totalSessions}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Duration:</span>
                                    <span>{formData.durationMonths} months</span>
                                </div>
                                {selectedPackage.discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount:</span>
                                        <span>{selectedPackage.discount}% OFF</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total Amount:</span>
                                    <span>₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-register"
                            >
                                {loading ? 'Registering...' : 'Register Corporate Account'}
                            </button>
                            
                            <p className="register-note">
                                * After registration, you'll be able to add employees and generate access codes
                            </p>
                        </form>
                    </div>
                    
                    <div className="benefits-section">
                        <h3>Program Benefits</h3>
                        <div className="benefit-item">
                            <span className="benefit-icon">💰</span>
                            <div>
                                <h4>Bulk Discounts</h4>
                                <p>Save up to 33% with premium packages</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">👥</span>
                            <div>
                                <h4>Easy Management</h4>
                                <p>Add and manage employees effortlessly</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">📊</span>
                            <div>
                                <h4>Usage Analytics</h4>
                                <p>Track employee engagement and utilization</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">🏋️</span>
                            <div>
                                <h4>Wide Network</h4>
                                <p>Access to premium gyms across the city</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">⚡</span>
                            <div>
                                <h4>Instant Access</h4>
                                <p>Employees get immediate booking access</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">🔒</span>
                            <div>
                                <h4>Secure Codes</h4>
                                <p>Unique access codes for each employee</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
