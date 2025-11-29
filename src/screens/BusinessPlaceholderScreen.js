import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image, Linking, Platform, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { logOut } from '../services/authService';
import AddProductScreen from './AddProductScreen';
import {
    getBusinessProfile,
    updateBusinessProfile,
    uploadImage,
    deleteProduct,
    subscribeToBusinessProducts
} from '../services/businessService';

export default function BusinessPlaceholderScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [promoImages, setPromoImages] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [businessLogo, setBusinessLogo] = useState(null);
    const [companyName, setCompanyName] = useState('My Business');
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [pinLocation, setPinLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState(null);

    // Load business profile and products on mount
    useEffect(() => {
        loadBusinessProfile();

        // Subscribe to real-time product updates
        const unsubscribe = subscribeToBusinessProducts((updatedProducts) => {
            setProducts(updatedProducts);
            setLoading(false);
        });

        if (!unsubscribe) {
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const loadBusinessProfile = async () => {
        const result = await getBusinessProfile();
        if (result.success) {
            const profile = result.data;
            setBusinessId(profile.id);
            setCompanyName(profile.companyName || 'My Business');
            setBusinessLogo(profile.logo || null);
            if (profile.latitude && profile.longitude) {
                setPinLocation({ latitude: profile.latitude, longitude: profile.longitude });
            }
        }
    };

    const handleLogout = async() => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async() => {
                    const result = await logOut();
                    if (!result.success) {
                        Alert.alert('Error', 'Failed to logout. Please try again.');
                    }
                }
            },
        ]);
    };

    const handleChangePinLocation = async() => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable location permissions to set your business location.');
                return;
            }

            Alert.alert('Getting Location', 'Fetching your current location...');

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;

            setPinLocation({ latitude, longitude });

            // Save location to business profile
            await updateBusinessProfile({ latitude, longitude });

            const scheme = Platform.select({
                ios: 'maps:',
                android: 'geo:',
            });
            const url = Platform.select({
                ios: `${scheme}?q=${latitude},${longitude}&ll=${latitude},${longitude}`,
                android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}`,
            });

            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
                Alert.alert(
                    'Location Set',
                    `Your business location has been set to:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\n\nYou can view it on Google Maps.`
                );
            } else {
                Alert.alert('Error', 'Cannot open Google Maps');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get your location. Please try again.');
        }
    };

    const handleLogoPress = () => {
        Alert.alert('Business Profile', 'What would you like to do?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Change Company Name',
                onPress: () => {
                    Alert.prompt('Company Name', 'Enter your company name:', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Save',
                            onPress: async (text) => {
                                if (text && text.trim()) {
                                    setCompanyName(text.trim());
                                    await updateBusinessProfile({ companyName: text.trim() });
                                }
                            }
                        },
                    ], 'plain-text', companyName);
                }
            },
            {
                text: 'Change Logo',
                onPress: async() => {
                    try {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            const logoUri = result.assets[0].uri;
                            setBusinessLogo(logoUri);

                            // Upload logo to Firebase Storage
                            const uploadResult = await uploadImage(logoUri, 'logos');
                            if (uploadResult.success) {
                                await updateBusinessProfile({ logo: uploadResult.url });
                            } else {
                                Alert.alert('Error', 'Failed to upload logo to cloud storage.');
                            }
                        }
                    } catch (error) {
                        console.error('Error picking logo:', error);
                        Alert.alert('Error', 'Failed to upload logo. Please try again.');
                    }
                }
            },
            {
                text: 'Change Pin Location',
                onPress: handleChangePinLocation
            },
        ]);
    };

    const handleFilterPress = () => {
        const allTags = new Set();
        products.forEach(product => {
            if (product.tags && product.tags.length > 0) {
                product.tags.forEach(tag => allTags.add(tag));
            }
        });
        const tags = Array.from(allTags).sort();
        if (tags.length === 0) {
            Alert.alert('No Tags', 'No product tags available yet. Add products with tags first!');
            return;
        }
        const buttons = [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear Filter', onPress: () => setSelectedFilter(null) },
            ...tags.map(tag => ({
                text: tag.charAt(0).toUpperCase() + tag.slice(1),
                onPress: () => setSelectedFilter(tag)
            }))
        ];
        Alert.alert('Filter by Tag', 'Select a tag to filter products:', buttons);
    };

    const handleImageUpload = async() => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });
            if (!result.canceled) {
                setPromoImages([...promoImages, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
    };

    const handleImagePress = (index) => {
        Alert.alert('Manage Image', 'What would you like to do with this image?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Replace',
                onPress: async() => {
                    try {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [16, 9],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            const updatedImages = [...promoImages];
                            updatedImages[index] = result.assets[0].uri;
                            setPromoImages(updatedImages);
                        }
                    } catch (error) {
                        console.error('Error replacing image:', error);
                        Alert.alert('Error', 'Failed to replace image. Please try again.');
                    }
                }
            },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    const updatedImages = promoImages.filter((_, i) => i !== index);
                    setPromoImages(updatedImages);
                }
            },
        ]);
    };

    // No longer needed - AddProductScreen handles saving directly to Firestore
    // Real-time listener will automatically update the products list

    const handleProductPress = (product) => {
        const productName = product.label || product.name;
        const productPrice = product.originalPrice || product.price;
        const productDiscounted = product.discountedPrice;
        const productQuantity = product.quantity || product.stockQuantity;
        const productStatus = product.status;
        const productDescription = product.description;

        Alert.alert(productName, 'What would you like to do?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'View Details',
                onPress: () => {
                    const priceText = productDiscounted ? `₱${productDiscounted} (was ₱${productPrice})` : `₱${productPrice}`;
                    Alert.alert(productName, `${priceText}\n\nQuantity: ${productQuantity}\nStatus: ${productStatus}\n\n${productDescription}`);
                }
            },
            {
                text: 'Edit',
                onPress: () => {
                    setEditingProduct(product);
                    setShowAddProduct(true);
                }
            },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    Alert.alert('Remove Product', `Are you sure you want to remove "${productName}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: async () => {
                                const result = await deleteProduct(product.id);
                                if (result.success) {
                                    Alert.alert('Success', 'Product removed successfully');
                                } else {
                                    Alert.alert('Error', result.error || 'Failed to remove product');
                                }
                            }
                        },
                    ]);
                }
            },
        ]);
    };

    const handleAddButtonPress = () => {
        setActiveTab('add');
        setShowAddProduct(true);
    };

    const organizeProductsByTags = () => {
        const tagGroups = {};
        let filteredProducts = products;
        if (selectedFilter) {
            filteredProducts = products.filter(p => p.tags && p.tags.includes(selectedFilter));
        }
        filteredProducts.forEach(product => {
            if (product.tags && product.tags.length > 0) {
                product.tags.forEach(tag => {
                    if (!tagGroups[tag]) {
                        tagGroups[tag] = [];
                    }
                    tagGroups[tag].push(product);
                });
            } else {
                if (!tagGroups['Uncategorized']) {
                    tagGroups['Uncategorized'] = [];
                }
                tagGroups['Uncategorized'].push(product);
            }
        });
        return tagGroups;
    };

    if (showAddProduct) {
        return <AddProductScreen onBack = {
            () => {
                setShowAddProduct(false);
                setEditingProduct(null);
            }
        }
        editProduct = { editingProduct }
        />;
    }

    const productsByTag = organizeProductsByTags();

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
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
                    {businessLogo ? (
                        <Image source={{ uri: businessLogo }} style={styles.logoImage} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Icon name="business" size={24} color="#4CAF50" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{companyName}</Text>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
                    <Icon name="filter-outline" size={24} color={selectedFilter ? '#4CAF50' : '#333'} />
                    {selectedFilter && <View style={styles.filterBadge} />}
                </TouchableOpacity>
            </View>

            {selectedFilter && (
                <View style={styles.filterIndicator}>
                    <Text style={styles.filterText}>Filtered by: {selectedFilter}</Text>
                    <TouchableOpacity onPress={() => setSelectedFilter(null)} style={styles.clearFilter}>
                        <Icon name="close-circle" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.promoSection}>
                    <Text style={styles.sectionTitle}>School Promo</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
                        {promoImages.map((image, index) => (
                            <TouchableOpacity key={index} style={styles.carouselItem} onPress={() => handleImagePress(index)}>
                                <Image source={{ uri: image }} style={styles.carouselImage} />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.uploadPlaceholder} onPress={handleImageUpload}>
                            <Icon name="cloud-upload-outline" size={40} color="#999" />
                            <Text style={styles.uploadText}>Upload Image</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {Object.keys(productsByTag).map((tag) => (
                    <View key={tag} style={styles.promoSection}>
                        <Text style={styles.sectionTitle}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
                            {productsByTag[tag].map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => handleProductPress(product)}
                                >
                                    <Image source={{ uri: product.image || product.imageUrl }} style={styles.productImage} />

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={async () => {
                                            Alert.alert('Remove Product', `Are you sure you want to remove "${product.label || product.name}"?`, [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Remove',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        const result = await deleteProduct(product.id);
                                                        if (result.success) {
                                                            Alert.alert('Success', 'Product removed successfully');
                                                        } else {
                                                            Alert.alert('Error', result.error || 'Failed to remove product');
                                                        }
                                                    }
                                                }
                                            ]);
                                        }}
                                    >
                                        <Icon name="trash-outline" size={18} color="#fff" />
                                    </TouchableOpacity>

                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={1}>{product.label || product.name}</Text>
                                        <View style={styles.priceContainer}>
                                            {product.discountedPrice ? (
                                                <>
                                                    <Text style={styles.discountedPrice}>₱{product.discountedPrice}</Text>
                                                    <Text style={styles.originalPriceStrike}>₱{product.originalPrice}</Text>
                                                </>
                                            ) : (
                                                <Text style={styles.productPrice}>₱{product.originalPrice || product.price}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.quantityText}>Qty: {product.quantity || product.stockQuantity}</Text>
                                        <View style={[styles.statusBadge, product.status === 'available' ? styles.statusAvailable : product.status === 'out of stock' ? styles.statusOutOfStock : styles.statusPreOrder]}>
                                            <Text style={styles.statusText}>{product.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('home')}>
                    <Icon name={activeTab === 'home' ? 'home' : 'home-outline'} size={28} color={activeTab === 'home' ? '#4CAF50' : '#999'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleAddButtonPress}>
                    <View style={styles.addButton}>
                        <Icon name="add" size={32} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => { setActiveTab('chat'); navigation.navigate('BusinessChatList'); }}>
                    <Icon name={activeTab === 'chat' ? 'chatbubble' : 'chatbubble-outline'} size={28} color={activeTab === 'chat' ? '#4CAF50' : '#999'} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    logoContainer: { width: 44, height: 44, marginRight: 12 },
    logoImage: { width: '100%', height: '100%', borderRadius: 22, resizeMode: 'cover' },
    logoPlaceholder: { width: '100%', height: '100%', borderRadius: 22, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#333' },
    logoutButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
    searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12, height: 45 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, color: '#333', padding: 0 },
    filterButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, position: 'relative' },
    filterBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
    filterIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E8F5E9' },
    filterText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
    clearFilter: { padding: 4 },
    scrollContent: { flex: 1 },
    promoSection: { paddingVertical: 20, backgroundColor: '#fff' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 20, marginBottom: 15 },
    carousel: { paddingLeft: 20 },
    carouselContent: { paddingRight: 20, gap: 15 },
    carouselItem: { width: 280, height: 160, borderRadius: 12, overflow: 'hidden' },
    carouselImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    uploadPlaceholder: { width: 280, height: 160, borderRadius: 12, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    uploadText: { marginTop: 8, fontSize: 14, color: '#999', fontWeight: '600' },
    productCard: { width: 160, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
    productImage: { width: '100%', height: 160, resizeMode: 'cover' },
    deleteButton: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    productInfo: { padding: 12 },
    productName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    productPrice: { fontSize: 16, fontWeight: '700', color: '#4CAF50' },
    discountedPrice: { fontSize: 16, fontWeight: '700', color: '#4CAF50' },
    originalPriceStrike: { fontSize: 14, color: '#999', textDecorationLine: 'line-through' },
    quantityText: { fontSize: 13, color: '#666', marginBottom: 6 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusAvailable: { backgroundColor: '#E8F5E9' },
    statusOutOfStock: { backgroundColor: '#FFEBEE' },
    statusPreOrder: { backgroundColor: '#FFF3E0' },
    statusText: { fontSize: 11, fontWeight: '600', color: '#333', textTransform: 'uppercase' },
    bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 5 },
    navButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    addButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
});