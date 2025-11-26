import express from 'express';
import {
  getProducts,
  getProductById,
} from '../controllers/marketplaceController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/products', getProducts);
router.get('/products/:productId', getProductById);

export default router;
