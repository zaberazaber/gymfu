import { Request, Response } from 'express';
import Cart from '../models/Cart';
import { ProductModel } from '../models/Product';

/**
 * Add item to cart
 * POST /api/v1/marketplace/cart
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId, quantity = 1 } = req.body;

    console.log('Add to cart request:', { userId, productId, quantity });

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Check if product exists and has stock
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`,
      });
    }

    // Add to cart
    const cartItem = await Cart.addItem(userId, productId, quantity);

    // Get updated cart
    const cart = await Cart.getByUserId(userId);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cartItem,
        cart,
      },
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

/**
 * Get user's cart
 * GET /api/v1/marketplace/cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const cart = await Cart.getByUserId(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message,
    });
  }
};

/**
 * Update cart item quantity
 * PUT /api/v1/marketplace/cart/:itemId
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    // Get cart item to check product stock
    const cartItem = await Cart.getById(cartItemId, userId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // Check product stock
    const product = await ProductModel.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`,
      });
    }

    // Update quantity
    const updatedItem = await Cart.updateQuantity(cartItemId, userId, quantity);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // Get updated cart
    const cart = await Cart.getByUserId(userId);

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: updatedItem,
        cart,
      },
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/v1/marketplace/cart/:itemId
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const cartItemId = parseInt(req.params.itemId);

    const removed = await Cart.removeItem(cartItemId, userId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // Get updated cart
    const cart = await Cart.getByUserId(userId);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

/**
 * Clear cart
 * DELETE /api/v1/marketplace/cart
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await Cart.clearCart(userId);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        total: 0,
        itemCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};
