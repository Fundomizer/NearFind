import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  // Image mapping for local assets
  const imageMap = {
    'school supplies.jpg': require('../../assets/images/products/school supplies.jpg'),
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

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${product.latitude},${product.longitude}`;
    Linking.openURL(url);
  };

  const maxStock = product.stockQuantity || 99; // Default to 99 if no stock quantity specified

  const incrementQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalPrice = product.price * quantity;

  const handleReserve = () => {
    navigation.navigate('ReservationConfirm', {
      product: product,
      quantity: quantity
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {getProductImage(product.imageUrl) ? (
            <Image source={getProductImage(product.imageUrl)} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image-outline" size={80} color="#ccc" />
            </View>
          )}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Shop Name */}
          <View style={styles.shopRow}>
            <Icon name="storefront-outline" size={16} color="#666" />
            <Text style={styles.shopName}>{product.shopName}</Text>
          </View>

          {/* Distance */}
          <View style={styles.distanceRow}>
            <Icon name="location-outline" size={16} color="#666" />
            <Text style={styles.distanceText}>
              {product.distance > 0 ? `${product.distance} km away` : 'Location unavailable'}
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            {product.originalPrice ? (
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>₱{product.originalPrice.toFixed(2)}</Text>
                <Text style={styles.currentPrice}>₱{product.price.toFixed(2)}</Text>
                <View style={styles.savingsTag}>
                  <Text style={styles.savingsText}>
                    Save ₱{(product.originalPrice - product.price).toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.currentPrice}>₱{product.price.toFixed(2)}</Text>
            )}
          </View>

          {/* Category Badge */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <Icon name="pricetag-outline" size={14} color="#4CAF50" />
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || 'No description available for this product.'}
            </Text>
          </View>

          {/* Stock Status */}
          <View style={styles.stockSection}>
            <View style={styles.stockInfo}>
              <Icon
                name={product.inStock ? "checkmark-circle" : "close-circle"}
                size={20}
                color={product.inStock ? "#4CAF50" : "#FF5252"}
              />
              <Text style={[styles.stockText, !product.inStock && styles.outOfStock]}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            {product.inStock && (
              <Text style={styles.stockAvailable}>{maxStock} available</Text>
            )}
          </View>
        </View>

        {/* Shop Info Section */}
        <View style={styles.shopSection}>
          <Text style={styles.sectionTitle}>Shop Information</Text>
          <View style={styles.shopCard}>
            <View style={styles.shopHeader}>
              <Icon name="storefront" size={24} color="#4CAF50" />
              <Text style={styles.shopCardName}>{product.shopName}</Text>
            </View>

            <View style={styles.shopDetail}>
              <Icon name="location" size={16} color="#666" />
              <Text style={styles.shopDetailText}>
                {product.distance > 0 ? `${product.distance} km from you` : 'Distance unavailable'}
              </Text>
            </View>

            <View style={styles.shopActions}>
              <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
                <Icon name="navigate" size={20} color="#fff" />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactButton}>
                <Icon name="call" size={20} color="#4CAF50" />
                <Text style={styles.contactText}>Contact Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeftSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.bottomPriceLabel}>Total Price</Text>
            <Text style={styles.bottomPrice}>₱{totalPrice.toFixed(2)}</Text>
          </View>

          {product.inStock && (
            <View style={styles.bottomQuantityControls}>
              <TouchableOpacity
                style={[styles.bottomQuantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={decrementQuantity}
                disabled={quantity === 1}
              >
                <Icon name="remove" size={18} color={quantity === 1 ? "#ccc" : "#333"} />
              </TouchableOpacity>
              <Text style={styles.bottomQuantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.bottomQuantityButton, quantity >= maxStock && styles.quantityButtonDisabled]}
                onPress={incrementQuantity}
                disabled={quantity >= maxStock}
              >
                <Icon name="add" size={18} color={quantity >= maxStock ? "#ccc" : "#333"} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.reserveButton, !product.inStock && styles.reserveButtonDisabled]}
          disabled={!product.inStock}
          onPress={handleReserve}
        >
          <Icon name="calendar" size={20} color="#fff" />
          <Text style={styles.reserveText}>
            {product.inStock ? 'Reserve' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  shopName: {
    fontSize: 14,
    color: '#666',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  savingsTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#FF5252',
  },
  stockAvailable: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  shopSection: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  shopCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  shopCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  shopDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  shopDetailText: {
    fontSize: 14,
    color: '#666',
  },
  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  contactText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomLeftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInfo: {
    flexShrink: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  bottomQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomQuantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bottomQuantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexShrink: 0,
  },
  reserveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reserveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
