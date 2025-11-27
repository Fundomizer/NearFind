import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createReservation } from '../services/reservationService';

export default function ReservationConfirmScreen({ route, navigation }) {
  const { product, quantity } = route.params;
  const [loading, setLoading] = useState(false);

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

  const totalPrice = product.price * quantity;

  const handleConfirmReservation = async () => {
    setLoading(true);
    const result = await createReservation(product, quantity);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Reservation Confirmed!',
        `Your reservation for ${quantity} ${product.name} has been confirmed. You can pick it up at ${product.shopName}.`,
        [
          {
            text: 'View Reservations',
            onPress: () => {
              // Navigate back to root then to Reservations tab
              navigation.getParent()?.navigate('Reservations');
            }
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              // Navigate back to Market (SearchHome)
              navigation.navigate('SearchHome');
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to create reservation. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Reservation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.productCard}>
            <View style={styles.productImageContainer}>
              {getProductImage(product.imageUrl) ? (
                <Image source={getProductImage(product.imageUrl)} style={styles.productImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="image-outline" size={40} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.shopName}>{product.shopName}</Text>
              <Text style={styles.price}>₱{product.price.toFixed(2)} each</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>{quantity}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per item</Text>
              <Text style={styles.summaryValue}>₱{product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₱{totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Pickup Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Information</Text>
          <View style={styles.pickupCard}>
            <View style={styles.pickupRow}>
              <Icon name="storefront" size={20} color="#4CAF50" />
              <View style={styles.pickupInfo}>
                <Text style={styles.pickupLabel}>Shop</Text>
                <Text style={styles.pickupValue}>{product.shopName}</Text>
              </View>
            </View>
            <View style={styles.pickupRow}>
              <Icon name="location" size={20} color="#4CAF50" />
              <View style={styles.pickupInfo}>
                <Text style={styles.pickupLabel}>Distance</Text>
                <Text style={styles.pickupValue}>
                  {product.distance > 0 ? `${product.distance} km away` : 'Location unavailable'}
                </Text>
              </View>
            </View>
            <View style={styles.pickupRow}>
              <Icon name="time" size={20} color="#4CAF50" />
              <View style={styles.pickupInfo}>
                <Text style={styles.pickupLabel}>Pickup Time</Text>
                <Text style={styles.pickupValue}>Within 24 hours</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.notesCard}>
            <View style={styles.noteRow}>
              <Icon name="information-circle" size={18} color="#666" />
              <Text style={styles.noteText}>
                Please pick up your order within 24 hours of reservation
              </Text>
            </View>
            <View style={styles.noteRow}>
              <Icon name="information-circle" size={18} color="#666" />
              <Text style={styles.noteText}>
                Payment will be made upon pickup at the shop
              </Text>
            </View>
            <View style={styles.noteRow}>
              <Icon name="information-circle" size={18} color="#666" />
              <Text style={styles.noteText}>
                You can cancel the reservation anytime before pickup
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceSection}>
          <Text style={styles.bottomPriceLabel}>Total to Pay</Text>
          <Text style={styles.bottomPriceValue}>₱{totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmReservation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="calendar" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
            </>
          )}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
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
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  pickupCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  pickupValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notesCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPriceSection: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexShrink: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
