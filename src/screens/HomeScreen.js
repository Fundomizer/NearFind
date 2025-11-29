import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity, Text, Alert, TextInput, Modal, ActivityIndicator, FlatList, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { getProducts } from '../services/firestoreService';
import { subscribeToFavorites } from '../services/favoritesService';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {

    const navigation = useNavigation();
    const [currentLocation, setCurrentLocation] = useState('Baguio, Philippines');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [tempLocation, setTempLocation] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);

    // Image mapping for local assets
    const imageMap = {
      'school_supplies.jpg': require('../../assets/images/products/school supplies.jpg'),
      'peanut_butter.jpg': require('../../assets/images/products/peanut butter.jpg'),
      'sour_dough_bread.jpg': require('../../assets/images/products/sour dough bread.jpg'),
      'ube_jam.jpg': require('../../assets/images/products/ube jam.jpg'),
      'lengua.jpg': require('../../assets/images/products/lengua.jpg'),
      'honey.jpg': require('../../assets/images/products/honey.jpg'),
    };

    // Get user's actual location on mount
    useEffect(() => {
        getCurrentLocation();
        getUserLocation();
    }, []);

    // Subscribe to real-time products updates
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'products'),
            (snapshot) => {
                const productsData = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    productsData.push({ id: doc.id, ...data });
                });

                console.log('HomeScreen: Loaded', productsData.length, 'products from Firestore');
                if (productsData.length > 0) {
                    console.log('HomeScreen: First product name:', productsData[0].name);
                    console.log('HomeScreen: First product category:', productsData[0].category);
                    console.log('HomeScreen: First product has imageUrl:', !!productsData[0].imageUrl);
                    console.log('HomeScreen: First product imageUrl:', productsData[0].imageUrl);
                    console.log('HomeScreen: ImageUrl starts with https:', productsData[0].imageUrl?.startsWith('https://'));
                }

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

                productsWithDistance.sort((a, b) => a.distance - b.distance);
            } else {
                productsWithDistance = productsData.map(product => ({
                    ...product,
                    distance: 0
                }));
            }

            setProducts(productsWithDistance);
            setLoading(false);
        },
        (error) => {
            console.error('HomeScreen: Error in products listener:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userLocation]);

    // Subscribe to user's favorites
    useEffect(() => {
        setFavoritesLoading(true);
        const unsubscribe = subscribeToFavorites(async (favorites) => {
            // Get full product details for favorited items
            const favoriteProductIds = favorites.map(fav => fav.productId);
            const allProducts = await getProducts();

            if (allProducts.success) {
                const favProducts = allProducts.data.filter(product =>
                    favoriteProductIds.includes(product.id)
                );
                setFavoriteProducts(favProducts);
            }
            setFavoritesLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
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
    };

    const fetchProducts = async () => {
        setLoading(true);
        const result = await getProducts();

        if (result.success) {
            let productsWithDistance = result.data;

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

                productsWithDistance.sort((a, b) => a.distance - b.distance);
            } else {
                productsWithDistance = result.data.map(product => ({
                    ...product,
                    distance: 0
                }));
            }

            setProducts(productsWithDistance);
        }
        setLoading(false);
    };

    const getProductsByCategory = (category) => {
        return products.filter(product => product.category === category).slice(0, 4);
    };

    const categories = [
        { name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
        { name: 'School Supplies', icon: 'school', color: '#4ECDC4' },
    ];

    const quickActions = [
        { name: 'Browse All', icon: 'grid', color: '#4CAF50' },
        { name: 'My Orders', icon: 'receipt', color: '#2196F3' },
        { name: 'Messages', icon: 'chatbubbles', color: '#FF9800' },
        { name: 'Favorites', icon: 'heart', color: '#E91E63' },
    ];

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setIsLoadingLocation(true);

                // Get current position with high accuracy
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                // Reverse geocode to get address
                const geocodeResults = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (geocodeResults && geocodeResults.length > 0) {
                    const geocode = geocodeResults[0];

                    // Build location string - prioritize city-level info for consistency
                    const parts = [];

                    // Prefer city, then district/subregion for more stable location display
                    if (geocode.city) {
                        parts.push(geocode.city);
                    } else if (geocode.district) {
                        parts.push(geocode.district);
                    } else if (geocode.subregion) {
                        parts.push(geocode.subregion);
                    }

                    // Add region/country if no city found
                    if (parts.length === 0 && geocode.region) {
                        parts.push(geocode.region);
                    }

                    // Add country for context
                    if (geocode.country) {
                        parts.push(geocode.country);
                    }

                    const locationString = parts.length > 0
                        ? parts.join(', ')
                        : 'Current Location';

                    setCurrentLocation(locationString);
                    console.log('Location updated:', locationString);
                } else {
                    setCurrentLocation('Current Location');
                }

                setIsLoadingLocation(false);
            } else {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature');
                setIsLoadingLocation(false);
            }
        } catch (error) {
            console.log('Location error:', error);
            Alert.alert('Error', 'Failed to get current location. Please try again.');
            setIsLoadingLocation(false);
        }
    };

    const handleChangeLocation = () => {
        setTempLocation(currentLocation);
        setShowLocationModal(true);
    };

    const handleSaveLocation = () => {
        if (tempLocation.trim()) {
            setCurrentLocation(tempLocation);
            setShowLocationModal(false);
            Alert.alert('Location Updated', `Your location has been set to ${tempLocation}`);
        } else {
            Alert.alert('Error', 'Please enter a valid location');
        }
    };

    const handleUseCurrentLocation = async () => {
        try {
            setIsLoadingLocation(true);
            setShowLocationModal(false);

            await getCurrentLocation();

            Alert.alert('Success', 'Location updated to your current location');
        } catch (error) {
            console.log('Error getting location:', error);
            setIsLoadingLocation(false);
        }
    };

    const handleProductPress = (product) => {
        navigation.navigate('Market', {
            screen: 'ProductDetails',
            params: { product }
        });
    };

    const getProductImage = (imageUrl) => {
      // If it's a Firebase Storage URL (HTTPS), return it as a URI
      if (imageUrl && imageUrl.startsWith('https://')) {
        return { uri: imageUrl };
      }
      // Otherwise, try to match with local assets
      return imageMap[imageUrl] || imageMap['honey.jpg'];
    };

    const renderCarouselItem = ({ item }) => (
        <TouchableOpacity
            style={styles.carouselCard}
            onPress={() => handleProductPress(item)}
        >
            <Image
                source={getProductImage(item.imageUrl)}
                style={styles.carouselImage}
            />
            {item.discount > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                </View>
            )}
            <View style={styles.carouselInfo}>
                <Text style={styles.carouselProductName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.carouselShopName} numberOfLines={1}>{item.shopName}</Text>
                <View style={styles.carouselFooter}>
                    <Text style={styles.carouselPrice}>₱{item.price}</Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={styles.carouselOriginalPrice}>₱{item.originalPrice}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderProductCard = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleProductPress(item)}
        >
            <Image
                source={getProductImage(item.imageUrl)}
                style={styles.productImage}
            />
            {item.discount > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
                <View style={styles.productFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>₱{item.price}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.originalPrice}>₱{item.originalPrice}</Text>
                        )}
                    </View>
                    {item.distance > 0 && (
                        <View style={styles.distanceContainer}>
                            <Icon name="location" size={12} color="#999" />
                            <Text style={styles.distanceText}>{item.distance.toFixed(1)}km</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/nearfind-logo.png')}
              style={styles.logoSmall}
            />
            <Text style={styles.appName}>NearFind</Text>
          </View>
        </View>

        {/* Location Bar */}
        <TouchableOpacity
          style={styles.locationBar}
          onPress={handleChangeLocation}
          disabled={isLoadingLocation}
        >
          <Icon name="location" size={20} color="#4CAF50" />
          <Text style={styles.locationBarText} numberOfLines={1}>
            {isLoadingLocation ? 'Getting location...' : currentLocation}
          </Text>
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Icon name="chevron-down" size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : products.length > 0 ? (
          <>
            {/* Hot Deals Carousel */}
            {products.filter(p => p.discount > 0).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Icon name="flame" size={20} color="#FF6B6B" />
                    <Text style={styles.sectionTitle}>Hot Deals</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Market')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={products.filter(p => p.discount > 0).slice(0, 10)}
                  renderItem={renderCarouselItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carousel}
                />
              </View>
            )}

            {/* Favorites */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Icon name="heart" size={20} color="#E91E63" />
                  <Text style={styles.sectionTitle}>My Favorites</Text>
                </View>
                {favoriteProducts.length > 6 && (
                  <TouchableOpacity onPress={() => navigation.navigate('Market')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                )}
              </View>
              {favoritesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.loadingText}>Loading favorites...</Text>
                </View>
              ) : favoriteProducts.length > 0 ? (
                <FlatList
                  data={favoriteProducts.slice(0, 6)}
                  renderItem={renderProductCard}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.productRow}
                  contentContainerStyle={styles.productsGrid}
                />
              ) : (
                <View style={styles.emptyFavorites}>
                  <Icon name="heart-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyFavoritesTitle}>No Favorites Yet</Text>
                  <Text style={styles.emptyFavoritesText}>
                    Tap the heart icon on products to add them to your favorites
                  </Text>
                  <TouchableOpacity
                    style={styles.browseFavoritesButton}
                    onPress={() => navigation.navigate('Market')}
                  >
                    <Text style={styles.browseFavoritesButtonText}>Browse Products</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="cube-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No products available</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchProducts}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Location Change Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Enter your city</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Manila, Philippines"
              value={tempLocation}
              onChangeText={setTempLocation}
              autoFocus={true}
            />

            <TouchableOpacity
              style={styles.useLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Icon name="location" size={20} color="#4CAF50" />
              <Text style={styles.useLocationText}>Use My Current Location</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveLocation}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    paddingHorizontal: 16,
    marginBottom: 12,
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
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  locationBarText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  quickActionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryCardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCardCount: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  carousel: {
    paddingRight: 8,
  },
  carouselCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  carouselInfo: {
    padding: 10,
  },
  carouselProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  carouselShopName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  carouselFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  carouselOriginalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productsGrid: {
    paddingBottom: 0,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF5252',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    height: 34,
  },
  shopName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 10,
    color: '#999',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  useLocationText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyFavorites: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyFavoritesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyFavoritesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  browseFavoritesButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseFavoritesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
