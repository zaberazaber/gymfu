import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import './ProductDetailPage.css';

interface Product {
  id: number;
  name: string;
  category: 'supplement' | 'gear' | 'food';
  description: string;
  price: number;
  images: string[];
  stockQuantity: number;
  rating: number;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/marketplace/products/${productId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      supplement: 'Supplements',
      gear: 'Gear & Equipment',
      food: 'Food & Nutrition',
    };
    return labels[category] || category;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(2)}`;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      
      // Show success message and navigate to cart
      if (window.confirm('Product added to cart! Go to cart?')) {
        navigate('/cart');
      }
    } catch (error: any) {
      alert(error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>😕 {error || 'Product not found'}</h2>
          <button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate('/marketplace')}>
        ← Back to Marketplace
      </button>

      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images-section">
          <div className="main-image">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
              />
            ) : (
              <div className="placeholder-image">
                <span>📦</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-category-badge">
            {getCategoryLabel(product.category)}
          </div>
          
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price-section">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.rating > 0 && (
              <div className="product-rating">
                <span className="stars">⭐</span>
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="product-stock">
            {product.stockQuantity > 0 ? (
              <>
                <span className="in-stock">✓ In Stock</span>
                {product.stockQuantity < 10 && (
                  <span className="low-stock-warning">
                    Only {product.stockQuantity} left!
                  </span>
                )}
              </>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || addingToCart}
            >
              {addingToCart
                ? 'Adding...'
                : product.stockQuantity > 0
                ? '🛒 Add to Cart'
                : 'Out of Stock'}
            </button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{getCategoryLabel(product.category)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Stock:</span>
              <span className="meta-value">{product.stockQuantity} units</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Product ID:</span>
              <span className="meta-value">#{product.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
