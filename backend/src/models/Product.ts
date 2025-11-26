import { pgPool } from '../config/database';

export interface Product {
  id: number;
  name: string;
  category: 'supplement' | 'gear' | 'food';
  description: string;
  price: number;
  images: string[];
  stockQuantity: number;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateProductData {
  name: string;
  category: 'supplement' | 'gear' | 'food';
  description: string;
  price: number;
  images?: string[];
  stockQuantity: number;
}

export class ProductModel {
  // Create a new product
  static async create(productData: CreateProductData): Promise<Product> {
    const query = `
      INSERT INTO products (
        name, category, description, price, images, stock_quantity
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, name, category, description, price, images,
        stock_quantity as "stockQuantity", rating,
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [
      productData.name,
      productData.category,
      productData.description,
      productData.price,
      productData.images || [],
      productData.stockQuantity,
    ];

    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  // Find product by ID
  static async findById(id: number): Promise<Product | null> {
    const query = `
      SELECT 
        id, name, category, description, price, images,
        stock_quantity as "stockQuantity", rating,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM products
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find all products with filters and pagination
  static async findAll(
    limit: number = 10,
    offset: number = 0,
    category?: string
  ): Promise<Product[]> {
    let query = `
      SELECT 
        id, name, category, description, price, images,
        stock_quantity as "stockQuantity", rating,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM products
    `;

    const params: any[] = [];
    
    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const result = await pgPool.query(query, params);
    return result.rows;
  }

  // Count products with optional category filter
  static async count(category?: string): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM products';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    const result = await pgPool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Update product
  static async update(id: number, productData: Partial<CreateProductData>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (productData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(productData.name);
    }
    if (productData.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(productData.category);
    }
    if (productData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(productData.description);
    }
    if (productData.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(productData.price);
    }
    if (productData.images !== undefined) {
      fields.push(`images = $${paramCount++}`);
      values.push(productData.images);
    }
    if (productData.stockQuantity !== undefined) {
      fields.push(`stock_quantity = $${paramCount++}`);
      values.push(productData.stockQuantity);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, name, category, description, price, images,
        stock_quantity as "stockQuantity", rating,
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, values);
    return result.rows[0] || null;
  }

  // Update stock quantity
  static async updateStock(id: number, quantity: number): Promise<Product | null> {
    const query = `
      UPDATE products
      SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, name, category, description, price, images,
        stock_quantity as "stockQuantity", rating,
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [quantity, id]);
    return result.rows[0] || null;
  }

  // Check if product has sufficient stock
  static async hasStock(id: number, quantity: number): Promise<boolean> {
    const query = 'SELECT stock_quantity >= $1 as "hasStock" FROM products WHERE id = $2';
    const result = await pgPool.query(query, [quantity, id]);
    return result.rows[0]?.hasStock || false;
  }

  // Delete product
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
}

export default ProductModel;
