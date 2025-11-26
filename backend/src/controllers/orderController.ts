import { Request, Response } from 'express';
import OrderModel, { ShippingAddress } from '../models/Order';
import Cart from '../models/Cart';
import { ProductModel } from '../models/Product';
import { PaymentModel } from '../models/Payment';
import RazorpayService from '../services/razorpayService';

/**
 * Create order from cart
 * POST /api/v1/marketplace/orders
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { shippingAddress } = req.body as { shippingAddress: ShippingAddress };

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phoneNumber ||
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
      });
    }

    // Get user's cart
    const cart = await Cart.getByUserId(userId);

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productName} not found`,
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName}. Only ${product.stockQuantity} available.`,
        });
      }
    }

    // Create order with pending status
    const order = await OrderModel.create({
      userId,
      totalAmount: cart.total,
      shippingAddress,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productPrice || 0,
      })),
    });

    // Create payment record
    const payment = await PaymentModel.create({
      orderId: order.id,
      userId,
      amount: cart.total,
    });

    // Create Razorpay order
    const razorpayOrder = await RazorpayService.createOrder({
      amount: cart.total,
      currency: 'INR',
      receipt: `order_${order.id}`,
    });

    // Update payment with Razorpay order ID
    await PaymentModel.updateRazorpayDetails(payment.id, razorpayOrder.id);

    // Get full order details
    const fullOrder = await OrderModel.findById(order.id, userId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      data: {
        order: fullOrder,
        payment: {
          id: payment.id,
          amount: razorpayOrder.amount, // Amount in paise
          currency: razorpayOrder.currency,
          razorpayOrderId: razorpayOrder.id,
          keyId: RazorpayService.getKeyId(),
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * Get user's orders
 * GET /api/v1/marketplace/orders
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { orders, total } = await OrderModel.findByUserId(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + orders.length < total,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

/**
 * Get order by ID
 * GET /api/v1/marketplace/orders/:orderId
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const orderId = parseInt(req.params.orderId);

    const order = await OrderModel.findById(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

/**
 * Cancel order
 * PUT /api/v1/marketplace/orders/:orderId/cancel
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const orderId = parseInt(req.params.orderId);

    // Get order
    const order = await OrderModel.findById(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered',
      });
    }

    // Update order status
    const updatedOrder = await OrderModel.updateStatus(orderId, 'cancelled', userId);

    // Restore product stock
    if (order.items) {
      for (const item of order.items) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          await ProductModel.updateStock(
            item.productId,
            product.stockQuantity + item.quantity
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
};


/**
 * Verify payment and confirm order
 * POST /api/v1/marketplace/orders/:orderId/verify-payment
 */
export const verifyOrderPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const orderId = parseInt(req.params.orderId);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate input
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details',
      });
    }

    // Get order
    const order = await OrderModel.findById(orderId, userId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Get payment
    const payment = await PaymentModel.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Verify Razorpay signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      await PaymentModel.updateStatus(payment.id, 'failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Update payment status and details
    await PaymentModel.updateRazorpayDetails(
      payment.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    await PaymentModel.updateStatus(payment.id, 'success');

    // Update order status to confirmed
    await OrderModel.updateStatus(orderId, 'confirmed', userId);

    // Update product stock
    if (order.items) {
      for (const item of order.items) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          await ProductModel.updateStock(
            item.productId,
            product.stockQuantity - item.quantity
          );
        }
      }
    }

    // Clear cart
    await Cart.clearCart(userId);

    // Get updated order
    const updatedOrder = await OrderModel.findById(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};
