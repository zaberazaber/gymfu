import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import api from '../utils/api';

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

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { productId } = route.params as { productId: number };
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/marketplace/products/${productId}`);
      setProduct(response.data.data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load product');
      }
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
      (navigation as any).navigate('Login');
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      
      Alert.alert(
        'Success',
        'Product added to cart!',
        [
          { text: 'Continue Shopping', style: 'cancel' },
          {
            text: 'Go to Cart',
            onPress: () => (navigation as any).navigate('Cart'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Back to Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Images */}
      <View style={styles.imageSection}>
        <View style={styles.mainImage}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[selectedImage] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>📦</Text>
            </View>
          )}
        </View>
        
        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailActive,
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoSection}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(product.category)}
          </Text>
        </View>

        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.rating > 0 && (
            <View style={styles.rating}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.stockSection}>
          {product.stockQuantity > 0 ? (
            <>
              <Text style={styles.inStock}>✓ In Stock</Text>
              {product.stockQuantity < 10 && (
                <Text style={styles.lowStock}>
                  Only {product.stockQuantity} left!
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.outOfStock}>✗ Out of Stock</Text>
          )}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>
              {getCategoryLabel(product.category)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Stock:</Text>
            <Text style={styles.metaValue}>{product.stockQuantity} units</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Product ID:</Text>
            <Text style={styles.metaValue}>#{product.id}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            (product.stockQuantity === 0 || addingToCart) && styles.addToCartBtnDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={product.stockQuantity === 0 || addingToCart}
        >
          <Text style={styles.addToCartText}>
            {addingToCart
              ? 'Adding...'
              : product.stockQuantity > 0
              ? '🛒 Add to Cart'
              : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageSection: {
    backgroundColor: 'white',
  },
  mainImage: {
    width: width,
    height: width,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  thumbnailsContainer: {
    paddingVertical: 12,
  },
  thumbnailsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 20,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  inStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  outOfStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  lowStock: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '500',
  },
  descriptionSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  metaSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  addToCartBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addToCartBtnDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
