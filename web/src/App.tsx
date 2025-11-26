import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import GymsPage from './pages/GymsPage';
import GymDetailPage from './pages/GymDetailPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import GymEditPage from './pages/GymEditPage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import './App.css';
import './styles/neumorphic.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/gyms" element={<GymsPage />} />
            <Route path="/gyms/:gymId" element={<GymDetailPage />} />
            <Route path="/gyms/:gymId/book" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingHistoryPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/products/:productId" element={<ProductDetailPage />} />
            <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
            <Route path="/partner/gym/new" element={<GymEditPage />} />
            <Route path="/partner/gym/edit/:gymId" element={<GymEditPage />} />
          </Routes>        </div>
      </Router>
    </Provider>
  );
}

export default App;
