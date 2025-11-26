import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MarketplacePage.css';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  stockQuantity: number;
  rating: number;
}

type Category = 'all' | 'Supplements' | 'Equipment' | 'Apparel' | 'Accessories' | 'Recovery';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const response = await fetch(
        `${API_URL}/marketplace/products?limit=${limit}&offset=${page * limit}${categoryParam}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (page === 0) {
        setProducts(data.data.products);
      } else {
        setProducts(prev => [...prev, ...data.data.products]);
      }
      
      setHasMore(data.data.pagination.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setPage(0);
    setProducts([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/marketplace/products/${productId}`);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'All Products',
      Supplements: 'Supplements',
      Equipment: 'Equipment',
      Apparel: 'Apparel',
      Accessories: 'Accessories',
      Recovery: 'Recovery',
    };
    return labels[category] || category;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(2)}`;
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1>Marketplace</h1>
        <p>Shop fitness gear, supplements, and nutrition</p>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {(['all', 'Supplements', 'Equipment', 'Apparel', 'Accessories', 'Recovery'] as Category[]).map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProducts}>Try Again</button>
        </div>
      )}

      {/* Loading State */}
      {loading && page === 0 && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading || page > 0 ? (
        <>
          {products.length === 0 && !loading ? (
            <div className="empty-state">
              <p>No products found in this category</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span>📦</span>
                      </div>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{getCategoryLabel(product.category)}</p>
                    <div className="product-footer">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                        <span className="low-stock">Only {product.stockQuantity} left</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && products.length > 0 && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default MarketplacePage;
