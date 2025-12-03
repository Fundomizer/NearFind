import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, PanResponder } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { getProducts } from '../services/firestoreService';
import { useNavigation } from '@react-navigation/native';
import { addToFavorites, removeFromFavorites, subscribeToFavorites } from '../services/favoritesService';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'shops'

  // Filter states (temporary values while editing in modal)
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [distanceFilterEnabled, setDistanceFilterEnabled] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0); // percentage
  const [priceRange, setPriceRange] = useState([0, 1000]); // PHP
  const [sortBy, setSortBy] = useState('distance'); // distance, price, discount

  // Applied filter states (actual values used for filtering)
  const [appliedCategory, setAppliedCategory] = useState('All');
  const [appliedMaxDistance, setAppliedMaxDistance] = useState(10);
  const [appliedDistanceEnabled, setAppliedDistanceEnabled] = useState(false);
  const [appliedMinDiscount, setAppliedMinDiscount] = useState(0);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 1000]);
  const [appliedSortBy, setAppliedSortBy] = useState('distance');

  const [favoritedProducts, setFavoritedProducts] = useState(new Set());

  // Image mapping for local assets
  const imageMap = {
    'school supplies.jpg': require('../../assets/images/products/school supplies.jpg'),
    'peanut_butter.jpg': require('../../assets/images/products/peanut butter.jpg'),
    'sour_dough_bread.jpg': require('../../assets/images/products/sour dough bread.jpg'),
    'ube_jam.jpg': require('../../assets/images/products/ube jam.jpg'),
    'lengua.jpg': require('../../assets/images/products/lengua.jpg'),
    'honey.jpg': require('../../assets/images/products/honey.jpg'),
  };

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status} = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Location error:', error);
      }
    })();
  }, []);

  // Subscribe to real-time products updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });

      // Calculate distance if user location is available
      let productsWithDistance = productsData;
      if (userLocation) {
        productsWithDistance = productsData.map(product => ({
          ...product,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            product.latitude,
            product.longitude
          )
        }));
      }

      setProducts(productsWithDistance);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLocation]);

  // Subscribe to user's favorites
  useEffect(() => {
    const unsubscribe = subscribeToFavorites((favorites) => {
      const favoriteProductIds = new Set(favorites.map(fav => fav.productId));
      setFavoritedProducts(favoriteProductIds);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getProducts();

    if (result.success) {
      let productsWithDistance = result.data;

      // Calculate distance if user location is available
      if (userLocation) {
        productsWithDistance = result.data.map(product => ({
          ...product,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            product.latitude,
            product.longitude
          )
        }));

        // Sort by distance
        productsWithDistance.sort((a, b) => a.distance - b.distance);
      } else {
        // Default distance for products
        productsWithDistance = result.data.map(product => ({
          ...product,
          distance: 0
        }));
      }

      setProducts(productsWithDistance);
      setFilteredProducts(productsWithDistance);
    } else {
      Alert.alert('Error', 'Failed to load products');
    }
    setLoading(false);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1));
  };

  // Apply all filters
  useEffect(() => {
    applyFilters();
  }, [searchText, products, appliedCategory, appliedMaxDistance, appliedMinDiscount, appliedPriceRange, appliedSortBy, appliedDistanceEnabled]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search text filter
    if (searchText.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchText.toLowerCase())
      );}

    // Category filter
    if (appliedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === appliedCategory);
    }

    // Distance filter (only apply when user enabled it)
    if (userLocation && appliedDistanceEnabled) {
      filtered = filtered.filter(product => product.distance <= appliedMaxDistance);
    }

    // Discount filter
    if (appliedMinDiscount > 0) {
      filtered = filtered.filter(product => (product.discount || 0) >= appliedMinDiscount);
    }

    // Price range filter
    if (appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 1000) {
      filtered = filtered.filter(product =>
        product.price >= appliedPriceRange[0] && product.price <= appliedPriceRange[1]
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (appliedSortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        case 'distance':
        default:
          return a.distance - b.distance;
      }
    });

    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    // Reset temporary states
    setSelectedCategory('All');
    setMaxDistance(10);
    setMinDiscount(0);
    setPriceRange([0, 1000]);
    setDistanceFilterEnabled(false);
    setSortBy('distance');
    // Reset applied states
    setAppliedCategory('All');
    setAppliedMaxDistance(10);
    setAppliedMinDiscount(0);
    setAppliedPriceRange([0, 1000]);
    setAppliedDistanceEnabled(false);
    setAppliedSortBy('distance');
  };

  const discardFilterChanges = () => {
    // Restore temporary filter values to match currently applied values
    setSelectedCategory(appliedCategory);
    setMaxDistance(appliedMaxDistance);
    setMinDiscount(appliedMinDiscount);
    setPriceRange([...appliedPriceRange]);
    setDistanceFilterEnabled(appliedDistanceEnabled);
    setSortBy(appliedSortBy);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedCategory !== 'All') count++;
    if (appliedDistanceEnabled && appliedMaxDistance !== 10) count++;
    if (appliedMinDiscount > 0) count++;
    if (appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 1000) count++;
    return count;
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const toggleFavorite = async (product, event) => {
    // Prevent product card press event
    event.stopPropagation();

    const isFavorited = favoritedProducts.has(product.id);

    if (isFavorited) {
      const result = await removeFromFavorites(product.id);
      if (!result.success) {
        Alert.alert('Error', 'Failed to remove from favorites');
      }
    } else {
      const result = await addToFavorites(product);
      if (!result.success) {
        Alert.alert('Error', 'Failed to add to favorites');
      }
    }
  };

  // Get unique shops from products
  const getShops = () => {
    const shopMap = new Map();

    filteredProducts.forEach(product => {
      if (!shopMap.has(product.shopName)) {
        shopMap.set(product.shopName, {
          name: product.shopName,
          latitude: product.latitude,
          longitude: product.longitude,
          distance: product.distance,
          productCount: 1,
          categories: new Set([product.category])
        });
      } else {
        const shop = shopMap.get(product.shopName);
        shop.productCount += 1;
        shop.categories.add(product.category);
      }
    });

    return Array.from(shopMap.values()).map(shop => ({
      ...shop,
      categories: Array.from(shop.categories)
    })).sort((a, b) => a.distance - b.distance);
  };

  const handleShopPress = (shop) => {
    // Filter products by shop and show them
    setViewMode('products');
    setSearchText(shop.name);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/nearfind-logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.appName}>NearFind</Text>
        </View>
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="basket" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for deals and products..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="options-outline" size={24} color="#4CAF50" />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.itemsFound}>
          <Text style={styles.itemsCount}>
            {viewMode === 'products' ? filteredProducts.length : getShops().length}
          </Text> {viewMode === 'products' ? 'products' : 'shops'} found
        </Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'products' && styles.activeToggle]}
            onPress={() => setViewMode('products')}
          >
            <Icon name="grid" size={18} color={viewMode === 'products' ? "#fff" : "#4CAF50"} />
            <Text style={viewMode === 'products' ? styles.activeToggleText : styles.toggleText}>
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'shops' && styles.activeToggle]}
            onPress={() => setViewMode('shops')}
          >
            <Icon name="storefront" size={18} color={viewMode === 'shops' ? "#fff" : "#4CAF50"} />
            <Text style={viewMode === 'shops' ? styles.activeToggleText : styles.toggleText}>
              Shops
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area - Product Grid or Shop List */}
      <ScrollView style={styles.content}>
        {viewMode === 'products' ? (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.productImage}>
                  {getProductImage(product.imageUrl) ? (
                    <Image
                      source={getProductImage(product.imageUrl)}
                      style={[
                        styles.image,
                        (product.stockQuantity === 0 || product.status === 'out of stock') && styles.outOfStockImage
                      ]}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Icon name="image-outline" size={40} color="#ccc" />
                    </View>
                  )}
                  {product.discount && product.stockQuantity > 0 && product.status !== 'pre-order' && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                  )}
                  {product.status === 'pre-order' && (
                    <View style={styles.preOrderBadge}>
                      <Icon name="time" size={12} color="#fff" />
                      <Text style={styles.preOrderBadgeText}>PRE-ORDER</Text>
                    </View>
                  )}
                  {(product.stockQuantity === 0 || product.status === 'out of stock') && (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockBadgeText}>OUT OF STOCK</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.favoriteIconButton}
                    onPress={(e) => toggleFavorite(product, e)}
                  >
                    <Icon
                      name={favoritedProducts.has(product.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={favoritedProducts.has(product.id) ? "#E91E63" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.shopName} numberOfLines={1}>{product.shopName}</Text>
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
                  <Text style={styles.productDistance}>
                    {product.distance > 0 ? `${product.distance} km` : 'Location unavailable'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.shopList}>
            {getShops().map((shop, index) => (
              <TouchableOpacity
                key={index}
                style={styles.shopCard}
                onPress={() => handleShopPress(shop)}
              >
                <View style={styles.shopIconContainer}>
                  <Icon name="storefront" size={32} color="#4CAF50" />
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopCardName}>{shop.name}</Text>
                  <View style={styles.shopDetails}>
                    <View style={styles.shopDetailItem}>
                      <Icon name="cube-outline" size={14} color="#666" />
                      <Text style={styles.shopDetailText}>{shop.productCount} products</Text>
                    </View>
                    <View style={styles.shopDetailItem}>
                      <Icon name="location-outline" size={14} color="#666" />
                      <Text style={styles.shopDetailText}>
                        {shop.distance > 0 ? `${shop.distance} km` : 'Location unavailable'}
                      </Text>
                    </View>
                  </View>
                  {shop.categories.length > 0 && (
                    <View style={styles.categoryTags}>
                      {shop.categories.slice(0, 2).map((category, idx) => (
                        <View key={idx} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                      ))}
                      {shop.categories.length > 2 && (
                        <Text style={styles.moreCategoriesText}>+{shop.categories.length - 2} more</Text>
                      )}
                    </View>
                  )}
                </View>
                <Icon name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          discardFilterChanges();
          setShowFilterModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => {
                discardFilterChanges();
                setShowFilterModal(false);
              }}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Category Filter */}
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {['All', 'Food', 'School Supplies'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextActive
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort By */}
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { value: 'distance', label: 'Nearest First', icon: 'location' },
                  { value: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
                  { value: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
                  { value: 'discount', label: 'Best Deals', icon: 'pricetag' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortBy === option.value && styles.sortOptionActive
                    ]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Icon
                      name={option.icon}
                      size={20}
                      color={sortBy === option.value ? '#4CAF50' : '#666'}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option.value && styles.sortOptionTextActive
                      ]}
                    >
                      {option.label}
                    </Text>
                    {sortBy === option.value && (
                      <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Distance Filter */}
              <Text style={styles.filterLabel}>Max Distance: {maxDistance} km</Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setMaxDistance(Math.max(1, maxDistance - 1))}
                >
                  <Icon name="remove" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <View
                  style={styles.sliderTrack}
                  {...PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: () => true,
                    onPanResponderGrant: (e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = e.nativeEvent.pageX - pageX;
                        const percentage = Math.max(0, Math.min(1, touchX / width));
                        const newValue = Math.round(percentage * 20);
                        setMaxDistance(Math.max(1, Math.min(20, newValue || 1)));
                      });
                    },
                    onPanResponderMove: (e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = e.nativeEvent.pageX - pageX;
                        const percentage = Math.max(0, Math.min(1, touchX / width));
                        const newValue = Math.round(percentage * 20);
                        setMaxDistance(Math.max(1, Math.min(20, newValue || 1)));
                      });
                    },
                  }).panHandlers}
                >
                  <View style={[styles.sliderFill, { width: `${(maxDistance / 20) * 100}%` }]} />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setMaxDistance(Math.min(20, maxDistance + 1))}
                >
                  <Icon name="add" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {/* Discount Filter */}
              <Text style={styles.filterLabel}>Min Discount: {minDiscount}%</Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setMinDiscount(Math.max(0, minDiscount - 5))}
                >
                  <Icon name="remove" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <View
                  style={styles.sliderTrack}
                  {...PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: () => true,
                    onPanResponderGrant: (e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = e.nativeEvent.pageX - pageX;
                        const percentage = Math.max(0, Math.min(1, touchX / width));
                        const newValue = Math.round(percentage * 10) * 5;
                        setMinDiscount(Math.max(0, Math.min(50, newValue)));
                      });
                    },
                    onPanResponderMove: (e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        const touchX = e.nativeEvent.pageX - pageX;
                        const percentage = Math.max(0, Math.min(1, touchX / width));
                        const newValue = Math.round(percentage * 10) * 5;
                        setMinDiscount(Math.max(0, Math.min(50, newValue)));
                      });
                    },
                  }).panHandlers}
                >
                  <View style={[styles.sliderFill, { width: `${(minDiscount / 50) * 100}%` }]} />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setMinDiscount(Math.min(50, minDiscount + 5))}
                >
                  <Icon name="add" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {/* Price Range */}
              <Text style={styles.filterLabel}>
                Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}
              </Text>
              <View style={styles.priceInputs}>
                <View style={styles.priceInputGroup}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange[0].toString()}
                    onChangeText={(text) => {
                      const val = parseInt(text) || 0;
                      setPriceRange([val, priceRange[1]]);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.priceRangeSeparator}>-</Text>
                <View style={styles.priceInputGroup}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange[1].toString()}
                    onChangeText={(text) => {
                      const val = parseInt(text) || 1000;
                      setPriceRange([priceRange[0], val]);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {/* Extra spacing at bottom */}
              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => {
                  // Apply the temporary filter values to the applied states
                  setAppliedCategory(selectedCategory);
                  setAppliedMaxDistance(maxDistance);
                  setAppliedMinDiscount(minDiscount);
                  setAppliedPriceRange([...priceRange]);
                  setAppliedSortBy(sortBy);
                  setAppliedDistanceEnabled(true);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoSmall: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  clearButton: {
    padding: 4,
    marginLeft: 4,
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
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  preOrderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preOrderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  outOfStockImage: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  favoriteIconButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    lineHeight: 20,
  },
  shopName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
  // Shop list styles
  shopList: {
    padding: 16,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 12,
  },
  shopIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: {
    flex: 1,
  },
  shopCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  shopDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  shopDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopDetailText: {
    fontSize: 12,
    color: '#666',
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#999',
  },
  // Filter styles
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  filterContent: {
    padding: 20,
    paddingBottom: 60,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  sortOptionActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  priceRangeSeparator: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
