import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { createReservation } from '../services/reservationService';

export default function ReservationConfirmScreen({ route, navigation }) {
  const { product, quantity } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    // If it's a Firebase Storage URL (HTTPS), return it as a URI
    if (imageUrl && (imageUrl.startsWith('https://') || imageUrl.startsWith('http://'))) {
      return { uri: imageUrl };
    }
    // If it starts with file:// (local URI), return it
    if (imageUrl && imageUrl.startsWith('file://')) {
      return { uri: imageUrl };
    }
    // Try to match with local assets
    if (imageMap[imageUrl]) {
      return imageMap[imageUrl];
    }
    // Return default fallback
    return imageMap['honey.jpg'];
  };

  // Parse store hours (e.g., "8:00 AM - 5:00 PM")
  const parseStoreHours = (hours) => {
    if (!hours) return { start: 8, end: 17 }; // Default 8 AM - 5 PM

    const parts = hours.split(' - ');
    if (parts.length !== 2) return { start: 8, end: 17 };

    const parseTime = (timeStr) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;

      let hour = parseInt(match[1]);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      return hour;
    };

    return {
      start: parseTime(parts[0]) || 8,
      end: parseTime(parts[1]) || 17
    };
  };

  // Generate available time slots within store hours
  const generateTimeSlots = () => {
    const { start, end } = parseStoreHours(product.shopHours);
    const slots = [];

    for (let hour = start; hour < end; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      slots.push({
        value: hour,
        label: `${displayHour}:00 ${period}`,
        displayLabel: `${displayHour}:00 ${period}`
      });

      // Add half-hour slot if not the last hour
      if (hour < end - 1) {
        slots.push({
          value: hour + 0.5,
          label: `${displayHour}:30 ${period}`,
          displayLabel: `${displayHour}:30 ${period}`
        });
      }
    }

    return slots;
  };

  const totalPrice = product.price * quantity;

  const handleConfirmReservation = async () => {
    if (!selectedPickupTime) {
      Alert.alert('Pickup Time Required', 'Please select a pickup time for your reservation.');
      return;
    }

    setLoading(true);
    const result = await createReservation(product, quantity, selectedPickupTime);
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
            <View style={styles.storeHoursRow}>
              <Icon name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.storeHoursText}>
                Store Hours: {product.shopHours || 'Not available'}
              </Text>
            </View>
          </View>

          {/* Highlighted Pickup Time Selection */}
          <View style={styles.pickupTimeSection}>
            <View style={styles.pickupTimeHeader}>
              <Icon name="time" size={24} color="#4CAF50" />
              <Text style={styles.pickupTimeTitle}>Select Pickup Time</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.pickupTimeButton,
                !selectedPickupTime && styles.pickupTimeButtonEmpty
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.pickupTimeContent}>
                {selectedPickupTime ? (
                  <>
                    <Icon name="checkmark-circle" size={28} color="#4CAF50" />
                    <Text style={styles.selectedTimeText}>{selectedPickupTime}</Text>
                  </>
                ) : (
                  <>
                    <Icon name="alarm-outline" size={28} color="#999" />
                    <Text style={styles.selectTimePlaceholder}>Tap to select pickup time</Text>
                  </>
                )}
              </View>
              <Icon name="chevron-forward" size={24} color={selectedPickupTime ? "#4CAF50" : "#999"} />
            </TouchableOpacity>
            {!selectedPickupTime && (
              <View style={styles.requiredBadge}>
                <Icon name="alert-circle" size={16} color="#FF5252" />
                <Text style={styles.requiredText}>Required</Text>
              </View>
            )}
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

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Pickup Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={generateTimeSlots()}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeSlot,
                    selectedPickupTime === item.label && styles.selectedTimeSlot
                  ]}
                  onPress={() => {
                    setSelectedPickupTime(item.label);
                    setShowTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedPickupTime === item.label && styles.selectedTimeSlotText
                    ]}
                  >
                    {item.displayLabel}
                  </Text>
                  {selectedPickupTime === item.label && (
                    <Icon name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  pickupTimeSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pickupTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pickupTimeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  pickupTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  pickupTimeButtonEmpty: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  pickupTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedTimeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  selectTimePlaceholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  requiredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5252',
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
  pickupPlaceholder: {
    color: '#999',
    fontStyle: 'italic',
  },
  storeHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  storeHoursText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedTimeSlot: {
    backgroundColor: '#E8F5E9',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
