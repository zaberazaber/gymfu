import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';
import './CartPage.css';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await dispatch(updateCartItem({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = async (itemId: number) => {
    if (window.confirm('Remove this item from cart?')) {
      await dispatch(removeFromCart(itemId));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow in next task
    alert('Checkout functionality coming soon!');
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  if (loading && cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="loading">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="error-message">{error}</div>
          <button onClick={() => dispatch(fetchCart())} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <button onClick={() => navigate('/marketplace')} className="shop-btn">
              Browse Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={handleClearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.productImages && item.productImages.length > 0 ? (
                    <img src={item.productImages[0]} alt={item.productName} />
                  ) : (
                    <div className="placeholder-image">📦</div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.productName}</h3>
                  <p className="item-price">{formatPrice(item.productPrice)}</p>
                  {item.productStockQuantity < 10 && (
                    <p className="low-stock">Only {item.productStockQuantity} left!</p>
                  )}
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.productStockQuantity}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  <p className="subtotal-label">Subtotal</p>
                  <p className="subtotal-value">
                    {formatPrice(item.productPrice * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-btn"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Items ({cart.itemCount})</span>
              <span>{formatPrice(cart.total)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>

            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/marketplace')}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
