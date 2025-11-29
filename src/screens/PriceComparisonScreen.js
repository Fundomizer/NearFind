import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { getSimilarProducts } from '../services/firestoreService';

export default function PriceComparisonScreen({ route, navigation }) {
  const { product: currentProduct } = route.params;
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Image mapping for local assets
  const imageMap = {
    'school_supplies.jpg': require('../../assets/images/products/school supplies.jpg'),
    'peanut_butter.jpg': require('../../assets/images/products/peanut butter.jpg'),
    'sour_dough_bread.jpg': require('../../assets/images/products/sour dough bread.jpg'),
    'ube_jam.jpg': require('../../assets/images/products/ube jam.jpg'),
    'lengua.jpg': require('../../assets/images/products/lengua.jpg'),
    'honey.jpg': require('../../assets/images/products/honey.jpg'),
  };

  const getProductImage = (imageUrl) => {
    if (imageMap[imageUrl]) {
      return imageMap[imageUrl];
    }
    return null;
  };

  useEffect(() => {
    fetchSimilarProducts();
  }, []);

  const fetchSimilarProducts = async () => {
    setLoading(true);
    const result = await getSimilarProducts(
      currentProduct.name,
      currentProduct.category,
      currentProduct.id
    );

    if (result.success) {
      setSimilarProducts(result.data);
    }
    setLoading(false);
  };

  const findBestDeal = () => {
    const allProducts = [currentProduct, ...similarProducts];
    const inStockProducts = allProducts.filter(p => p.stockQuantity > 0);

    if (inStockProducts.length === 0) return null;

    return inStockProducts.reduce((best, product) => {
      return product.price < best.price ? product : best;
    }, inStockProducts[0]);
  };

  const calculateSavings = (productPrice) => {
    const bestDeal = findBestDeal();
    if (!bestDeal) return 0;
    return productPrice - bestDeal.price;
  };

  const renderProductCard = (product, isCurrent = false) => {
    const savings = calculateSavings(product.price);
    const isBestDeal = findBestDeal()?.id === product.id;
    const isOutOfStock = product.stockQuantity === 0;

    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productCard,
          isCurrent && styles.currentProductCard,
          isBestDeal && !isOutOfStock && styles.bestDealCard,
        ]}
        onPress={() => {
          if (!isCurrent) {
            navigation.replace('ProductDetails', { product });
          }
        }}
        disabled={isCurrent}
      >
        {/* Best Deal Badge */}
        {isBestDeal && !isOutOfStock && (
          <View style={styles.bestDealBadge}>
            <Icon name="trophy" size={14} color="#FFD700" />
            <Text style={styles.bestDealText}>Best Deal</Text>
          </View>
        )}

        {/* Current Product Badge */}
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current Product</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Product Image */}
          <View style={styles.imageSection}>
            {getProductImage(product.imageUrl) ? (
              <Image
                source={getProductImage(product.imageUrl)}
                style={styles.productImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="image-outline" size={40} color="#ccc" />
              </View>
            )}
            {product.discount && !isOutOfStock && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
            {isOutOfStock && (
              <View style={styles.soldOutOverlay}>
                <Text style={styles.soldOutText}>OUT OF STOCK</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoSection}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>

            <View style={styles.shopRow}>
              <Icon name="storefront-outline" size={14} color="#666" />
              <Text style={styles.shopName} numberOfLines={1}>
                {product.shopName}
              </Text>
            </View>

            {product.distance !== undefined && (
              <View style={styles.distanceRow}>
                <Icon name="location-outline" size={14} color="#666" />
                <Text style={styles.distanceText}>
                  {product.distance > 0 ? `${product.distance} km` : 'N/A'}
                </Text>
              </View>
            )}

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                {product.originalPrice ? (
                  <>
                    <Text style={styles.originalPrice}>
                      ₱{product.originalPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.currentPrice}>
                      ₱{product.price.toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.currentPrice}>₱{product.price.toFixed(2)}</Text>
                )}
              </View>

              {/* Savings vs Best Deal */}
              {!isBestDeal && savings > 0 && !isOutOfStock && (
                <View style={styles.savingsRow}>
                  <Text style={styles.savingsText}>
                    ₱{savings.toFixed(2)} more than best deal
                  </Text>
                </View>
              )}
              {isBestDeal && !isOutOfStock && (
                <View style={styles.bestPriceRow}>
                  <Icon name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.bestPriceText}>Lowest Price</Text>
                </View>
              )}
            </View>

            {!isCurrent && !isOutOfStock && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.replace('ProductDetails', { product })}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
                <Icon name="arrow-forward" size={14} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Comparison</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            Comparing prices for "{currentProduct.name}" across different shops
          </Text>
        </View>

        {/* Current Product */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Selected Shop</Text>
          {renderProductCard(currentProduct, true)}
        </View>

        {/* Similar Products */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Finding this product at other shops...</Text>
          </View>
        ) : similarProducts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Same Product at Other Shops ({similarProducts.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Sorted by price (lowest first)
            </Text>
            {similarProducts.map((product) => renderProductCard(product, false))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Other Shops Found</Text>
            <Text style={styles.emptyText}>
              This product is only available at {currentProduct.shopName}
            </Text>
          </View>
        )}

        {/* Summary Section */}
        {!loading && similarProducts.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Price Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lowest Price:</Text>
                <Text style={styles.summaryValue}>
                  ₱{findBestDeal()?.price.toFixed(2) || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Highest Price:</Text>
                <Text style={styles.summaryValue}>
                  ₱
                  {Math.max(
                    currentProduct.price,
                    ...similarProducts
                      .filter(p => p.stockQuantity > 0)
                      .map(p => p.price)
                  ).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Potential Savings:</Text>
                <Text style={[styles.summaryValue, styles.savingsHighlight]}>
                  ₱
                  {(
                    Math.max(
                      currentProduct.price,
                      ...similarProducts
                        .filter(p => p.stockQuantity > 0)
                        .map(p => p.price)
                    ) - (findBestDeal()?.price || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentProductCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  bestDealCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  bestDealBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  bestDealText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageSection: {
    width: 100,
    height: 100,
    marginRight: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  soldOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  infoSection: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#999',
  },
  priceSection: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  savingsRow: {
    marginTop: 2,
  },
  savingsText: {
    fontSize: 11,
    color: '#FF5252',
    fontWeight: '500',
  },
  bestPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bestPriceText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  summarySection: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  savingsHighlight: {
    color: '#4CAF50',
    fontSize: 18,
  },
});
