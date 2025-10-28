import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  const [activeTab, setActiveTab] = useState('Feed');
  const [likedReviews, setLikedReviews] = useState({});

  const reviews = [
    {
      id: 1,
      userName: 'Maria Santos',
      shopName: 'Artisan Bakery',
      rating: 5,
      timeAgo: '2h ago',
      reviewText: 'Amazing sourdough bread! Fresh and delicious. The staff was very friendly too.',
      productImage: require('../../assets/images/products/sour dough bread.jpg'),
    },
    {
      id: 2,
      userName: 'Juan dela Cruz',
      shopName: 'Baguio School Supplies',
      rating: 4,
      timeAgo: '5h ago',
      reviewText: 'Great selection and affordable prices. Found everything I needed for the new school year.',
      productImage: require('../../assets/images/products/school supplies.jpg'),
    },
  ];

  const getInitials = (name) => {
    const names = name.split(' ');
    const firstInitial = names[0]?.charAt(0) || '';
    const lastInitial = names[names.length - 1]?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const toggleLike = (reviewId) => {
    setLikedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Share experiences and discover favorites</Text>
      </View>

      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <View style={styles.ovalContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Feed' && styles.activeTab]}
            onPress={() => setActiveTab('Feed')}
          >
            <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>
              Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Reviews' && styles.activeTab]}
            onPress={() => setActiveTab('Reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Share' && styles.activeTab]}
            onPress={() => setActiveTab('Share')}
          >
            <Text style={[styles.tabText, activeTab === 'Share' && styles.activeTabText]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Content */}
      {activeTab === 'Feed' && (
        <ScrollView style={styles.feedContent} showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              {/* User Info */}
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{getInitials(review.userName)}</Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{review.userName}</Text>
                    <Text style={styles.shopName}>{review.shopName}</Text>
                  </View>
                </View>
                <Text style={styles.timeAgo}>{review.timeAgo}</Text>
              </View>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#F9A825"
                  />
                ))}
              </View>

              {/* Review Text */}
              <Text style={styles.reviewText}>{review.reviewText}</Text>

              {/* Product Image */}
              <Image source={review.productImage} style={styles.reviewImage} />

              {/* Actions */}
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleLike(review.id)}
                >
                  <Ionicons
                    name={likedReviews[review.id] ? "heart" : "heart-outline"}
                    size={20}
                    color={likedReviews[review.id] ? "#FF4444" : "#666"}
                  />
                  <Text style={[styles.actionText, likedReviews[review.id] && styles.likedText]}>
                    Like
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#666" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Vendor Dashboard Button */}
      <View style={styles.vendorSection}>
        <TouchableOpacity style={styles.vendorButton}>
          <View style={styles.vendorButtonContent}>
            <Ionicons name="storefront-outline" size={20} color="#333" />
            <Text style={styles.vendorButtonText}>Vendor Dashboard</Text>
          </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ovalContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    gap: 4,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  vendorSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  vendorButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vendorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  feedContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
  },
  userDetails: {
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  shopName: {
    fontSize: 13,
    color: '#666',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#FF4444',
  },
});
