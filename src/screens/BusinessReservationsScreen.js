import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { subscribeToBusinessReservations, completeBusinessReservation } from '../services/businessService';

export default function BusinessReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    // Subscribe to real-time reservation updates
    const unsubscribe = subscribeToBusinessReservations((updatedReservations) => {
      setReservations(updatedReservations);
      setLoading(false);
    });

    if (!unsubscribe) {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCompleteReservation = (reservationId, productName) => {
    Alert.alert(
      'Mark as Completed',
      `Mark ${productName} as completed? This confirms the customer has picked up the order.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Complete',
          style: 'default',
          onPress: async () => {
            const result = await completeBusinessReservation(reservationId);
            if (result.success) {
              Alert.alert('Success', 'Reservation marked as completed');
            } else {
              Alert.alert('Error', result.error || 'Failed to complete reservation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F9A825';
      case 'confirmed':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#FF5252';
      case 'expired':
        return '#999';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      case 'expired':
        return 'hourglass-outline';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const activeReservations = reservations.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  );

  const historyReservations = reservations.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled' || r.status === 'expired'
  );

  const displayReservations = activeTab === 'active' ? activeReservations : historyReservations;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservations</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeReservations.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({historyReservations.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {displayReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'No active reservations' : 'No reservation history'}
            </Text>
          </View>
        ) : (
          <View style={styles.reservationsList}>
            {displayReservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                {/* Status Badge and Time */}
                <View style={styles.statusRow}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}
                  >
                    <Icon name={getStatusIcon(reservation.status)} size={14} color="#fff" />
                    <Text style={styles.statusText}>{reservation.status.toUpperCase()}</Text>
                  </View>
                  <View style={styles.timeAgoContainer}>
                    <Icon name="time-outline" size={14} color="#999" />
                    <Text style={styles.timeAgoText}>{getTimeAgo(reservation.createdAt)}</Text>
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.reservationHeader}>
                  <Icon name="cube" size={24} color="#4CAF50" />
                  <View style={styles.reservationHeaderInfo}>
                    <View style={styles.productNameRow}>
                      <Text style={styles.productName}>{reservation.productName}</Text>
                      {reservation.productStatus === 'pre-order' && (
                        <View style={styles.preOrderBadge}>
                          <Icon name="time" size={12} color="#fff" />
                          <Text style={styles.preOrderBadgeText}>PRE-ORDER</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.customerEmail}>{reservation.userEmail}</Text>
                  </View>
                </View>

                {/* Order Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Icon name="cube-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{reservation.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={styles.detailValue}>₱{reservation.totalPrice.toFixed(2)}</Text>
                  </View>
                  {reservation.pickupTime && (
                    <View style={styles.detailRow}>
                      <Icon name="time-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Pickup Time:</Text>
                      <Text style={styles.detailValue}>{reservation.pickupTime}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Icon name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Reserved:</Text>
                    <Text style={styles.detailValue}>{formatDate(reservation.createdAt)}</Text>
                  </View>
                </View>

                {/* Actions */}
                {activeTab === 'active' && (
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteReservation(reservation.id, reservation.productName)}
                    >
                      <Icon name="checkmark-done" size={18} color="#fff" />
                      <Text style={styles.completeButtonText}>Mark as Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  reservationsList: {
    padding: 16,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  timeAgoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeAgoText: {
    fontSize: 12,
    color: '#999',
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  reservationHeaderInfo: {
    flex: 1,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  preOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  preOrderBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
