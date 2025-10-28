import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  // Product data
  const products = [
    {
      id: 1,
      name: 'School Supply Kit',
      price: 599.00,
      originalPrice: 750.00,
      discount: 20,
      distance: 1.2,
      image: require('../../assets/images/products/school supplies.jpg'),
    },
    {
      id: 2,
      name: 'Peanut Butter',
      price: 149.00,
      originalPrice: null,
      discount: null,
      distance: 2.5,
      image: require('../../assets/images/products/peanut butter.jpg'),
    },
    {
      id: 3,
      name: 'Artisan Sourdough Bread',
      price: 79.00,
      originalPrice: 120.00,
      discount: 35,
      distance: 0.8,
      image: require('../../assets/images/products/sour dough bread.jpg'),
    },
    {
      id: 4,
      name: 'Ube Jam',
      price: 199.00,
      originalPrice: null,
      discount: null,
      distance: 3.1,
      image: require('../../assets/images/products/ube jam.jpg'),
    },
    {
      id: 5,
      name: 'Lengua de Gato',
      price: 59.00,
      originalPrice: 120.00,
      discount: 50,
      distance: 1.7,
      image: require('../../assets/images/products/lengua.jpg'),
    },
    {
      id: 6,
      name: 'Organic Honey',
      price: 129.00,
      originalPrice: null,
      discount: null,
      distance: 2.0,
      image: require('../../assets/images/products/honey.jpg'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for deals and products..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity style={styles.sortButton}>
          <Icon name="options-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.itemsFound}>
          <Text style={styles.itemsCount}>{products.length}</Text> products found
        </Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity style={[styles.toggleButton, styles.activeToggle]}>
            <Icon name="list" size={18} color="#fff" />
            <Text style={styles.activeToggleText}>List</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="map" size={18} color="#4CAF50" />
            <Text style={styles.toggleText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area - Product Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.productGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImage}>
                {product.image ? (
                  <Image source={product.image} style={styles.image} />
                ) : (
                  <Text style={styles.placeholderText}>Insert Image</Text>
                )}
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              {product.originalPrice ? (
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>₱{product.originalPrice.toFixed(2)}</Text>
                  <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                </View>
              ) : (
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
              )}
              <View style={styles.distanceContainer}>
                <Icon name="location-outline" size={12} color="#999" />
                <Text style={styles.productDistance}>{product.distance} km</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsFound: {
    fontSize: 14,
    color: '#666',
  },
  itemsCount: {
    fontWeight: '700',
    color: '#4CAF50',
    fontSize: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  activeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productDistance: {
    fontSize: 12,
    color: '#999',
  },
});
