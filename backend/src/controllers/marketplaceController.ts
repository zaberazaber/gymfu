import { Request, Response } from 'express';
import ProductModel from '../models/Product';

/**
 * Get all products with filters and pagination
 * GET /api/v1/marketplace/products
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      limit = '10',
      offset = '0',
    } = req.query;

    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    // Validate category if provided
    if (category && !['Supplements', 'Equipment', 'Apparel','Recovery','Accessories'].includes(category as string)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Category must be one of: supplement, gear, food',
        },
      });
    }

    const products = await ProductModel.findAll(
      parsedLimit,
      parsedOffset,
      category as string
    );

    const totalCount = await ProductModel.count(category as string);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: totalCount,
          hasMore: parsedOffset + products.length < totalCount,
        },
      },
      message: 'Products retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get products',
        details: error.message,
      },
    });
  }
};

/**
 * Get product by ID
 * GET /api/v1/marketplace/products/:productId
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findById(parseInt(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get product',
        details: error.message,
      },
    });
  }
};
