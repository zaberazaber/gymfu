import { pgPool } from '../config/database';
import { PoolClient } from 'pg';

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  // Joined product details
  productName?: string;
  productPrice?: number;
  productImages?: string[];
  productStockQuantity?: number;
}

export interface CartWithTotal {
  items: CartItem[];
  total: number;
  itemCount: number;
}

class Cart {
  /**
   * Add item to cart or update quantity if already exists
   */
  static async addItem(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem> {
    const client = await pgPool.connect();
    try {
      // Check if item already exists in cart
      const existingItem = await client.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );

      let result;
      if (existingItem.rows.length > 0) {
        // Update quantity
        result = await client.query(
          `UPDATE cart 
           SET quantity = quantity + $1, updated_at = NOW()
           WHERE user_id = $2 AND product_id = $3
           RETURNING *`,
          [quantity, userId, productId]
        );
      } else {
        // Insert new item
        result = await client.query(
          `INSERT INTO cart (user_id, product_id, quantity)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [userId, productId, quantity]
        );
      }

      return this.mapToCartItem(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Get user's cart with product details
   */
  static async getByUserId(userId: number): Promise<CartWithTotal> {
    const client = await pgPool.connect();
    try {
      const result = await client.query(
        `SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          c.created_at,
          p.name as product_name,
          p.price as product_price,
          p.images as product_images,
          p.stock_quantity as product_stock_quantity
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [userId]
      );

      const items = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        productId: row.product_id,
        quantity: row.quantity,
        createdAt: row.created_at,
        productName: row.product_name,
        productPrice: parseFloat(row.product_price),
        productImages: row.product_images,
        productStockQuantity: row.product_stock_quantity,
      }));

      const total = items.reduce(
        (sum, item) => sum + (item.productPrice || 0) * item.quantity,
        0
      );

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return { items, total, itemCount };
    } finally {
      client.release();
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(
    cartItemId: number,
    userId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const client = await pgPool.connect();
    try {
      const result = await client.query(
        `UPDATE cart 
         SET quantity = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [quantity, cartItemId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToCartItem(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId: number, userId: number): Promise<boolean> {
    const client = await pgPool.connect();
    try {
      const result = await client.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2',
        [cartItemId, userId]
      );

      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId: number): Promise<boolean> {
    const client = await pgPool.connect();
    try {
      await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Get cart item by ID
   */
  static async getById(cartItemId: number, userId: number): Promise<CartItem | null> {
    const client = await pgPool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM cart WHERE id = $1 AND user_id = $2',
        [cartItemId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToCartItem(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static mapToCartItem(row: any): CartItem {
    return {
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      quantity: row.quantity,
      createdAt: row.created_at,
    };
  }
}

export default Cart;
