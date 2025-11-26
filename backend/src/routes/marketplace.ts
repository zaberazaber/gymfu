import express from 'express';
import {
  getProducts,
  getProductById,
} from '../controllers/marketplaceController';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  verifyOrderPayment,
} from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/products', getProducts);
router.get('/products/:productId', getProductById);

// Protected cart routes (authentication required)
router.post('/cart', authenticate, addToCart);
router.get('/cart', authenticate, getCart);
router.put('/cart/:itemId', authenticate, updateCartItem);
router.delete('/cart/:itemId', authenticate, removeFromCart);
router.delete('/cart', authenticate, clearCart);

// Protected order routes (authentication required)
router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, getUserOrders);
router.get('/orders/:orderId', authenticate, getOrderById);
router.post('/orders/:orderId/verify-payment', authenticate, verifyOrderPayment);
router.put('/orders/:orderId/cancel', authenticate, cancelOrder);

export default router;
