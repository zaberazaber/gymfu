import { pgPool } from '../config/database';

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: Date;
  // Joined product details
  productName?: string;
  productImages?: string[];
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt?: Date;
  items?: OrderItem[];
}

export interface CreateOrderData {
  userId: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

class OrderModel {
  /**
   * Create a new order with items
   */
  static async create(orderData: CreateOrderData): Promise<Order> {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, status, shipping_address)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, total_amount, status, shipping_address, created_at, updated_at`,
        [
          orderData.userId,
          orderData.totalAmount,
          'pending',
          JSON.stringify(orderData.shippingAddress),
        ]
      );

      const order = this.mapToOrder(orderResult.rows[0]);

      // Create order items
      const orderItems: OrderItem[] = [];
      for (const item of orderData.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)
           RETURNING id, order_id, product_id, quantity, price, created_at`,
          [order.id, item.productId, item.quantity, item.price]
        );
        orderItems.push(this.mapToOrderItem(itemResult.rows[0]));
      }

      await client.query('COMMIT');

      order.items = orderItems;
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get order by ID with items
   */
  static async findById(orderId: number, userId?: number): Promise<Order | null> {
    const client = await pgPool.connect();
    try {
      let query = `
        SELECT 
          o.id, o.user_id, o.total_amount, o.status, o.shipping_address,
          o.created_at, o.updated_at
        FROM orders o
        WHERE o.id = $1
      `;
      const params: any[] = [orderId];

      if (userId) {
        query += ' AND o.user_id = $2';
        params.push(userId);
      }

      const orderResult = await client.query(query, params);

      if (orderResult.rows.length === 0) {
        return null;
      }

      const order = this.mapToOrder(orderResult.rows[0]);

      // Get order items with product details
      const itemsResult = await client.query(
        `SELECT 
          oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.created_at,
          p.name as product_name, p.images as product_images
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      order.items = itemsResult.rows.map(row => ({
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        price: parseFloat(row.price),
        createdAt: row.created_at,
        productName: row.product_name,
        productImages: row.product_images,
      }));

      return order;
    } finally {
      client.release();
    }
  }

  /**
   * Get user's orders
   */
  static async findByUserId(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ orders: Order[]; total: number }> {
    const client = await pgPool.connect();
    try {
      // Get total count
      const countResult = await client.query(
        'SELECT COUNT(*) FROM orders WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count);

      // Get orders
      const ordersResult = await client.query(
        `SELECT id, user_id, total_amount, status, shipping_address, created_at, updated_at
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const orders = await Promise.all(
        ordersResult.rows.map(async (row) => {
          const order = this.mapToOrder(row);

          // Get order items
          const itemsResult = await client.query(
            `SELECT 
              oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.created_at,
              p.name as product_name, p.images as product_images
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [order.id]
          );

          order.items = itemsResult.rows.map(itemRow => ({
            id: itemRow.id,
            orderId: itemRow.order_id,
            productId: itemRow.product_id,
            quantity: itemRow.quantity,
            price: parseFloat(itemRow.price),
            createdAt: itemRow.created_at,
            productName: itemRow.product_name,
            productImages: itemRow.product_images,
          }));

          return order;
        })
      );

      return { orders, total };
    } finally {
      client.release();
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(
    orderId: number,
    status: Order['status'],
    userId?: number
  ): Promise<Order | null> {
    const client = await pgPool.connect();
    try {
      let query = `
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `;
      const params: any[] = [status, orderId];

      if (userId) {
        query += ' AND user_id = $3';
        params.push(userId);
      }

      query += ' RETURNING id, user_id, total_amount, status, shipping_address, created_at, updated_at';

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToOrder(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static mapToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      shippingAddress: typeof row.shipping_address === 'string' 
        ? JSON.parse(row.shipping_address) 
        : row.shipping_address,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static mapToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      price: parseFloat(row.price),
      createdAt: row.created_at,
    };
  }
}

export default OrderModel;
