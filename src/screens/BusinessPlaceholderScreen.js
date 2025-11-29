import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Ionicons';
import AddProductScreen from './AddProductScreen';
import { getBusinessProfile, updateBusinessProfile, uploadImage, deleteProduct, subscribeToBusinessProducts, addProduct, updateProduct } from '../services/businessService';

export default function BusinessPlaceholderScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [promoImages, setPromoImages] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [businessLogo, setBusinessLogo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        async function loadBusinessProfile() {
            const result = await getBusinessProfile();
            if (result.success && result.data) {
                setCompanyName(result.data.companyName || 'Business');
                setBusinessLogo(result.data.logoUrl || null);
                setPromoImages(result.data.promoImages || []);
            }
        }
        loadBusinessProfile();
        const unsubscribe = subscribeToBusinessProducts((updatedProducts) => {
            setProducts(updatedProducts);
            setLoading(false);
        });
        if (!unsubscribe) setLoading(false);
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    function organizeProductsByTags() {
        const byTag = {};
        products.forEach(product => {
            // Check multiple possible tag field names
            const tag = product.tag || product.category || product.type || 'Other';
            const tagName = (typeof tag === 'string' && tag.trim()) ? tag.trim() : 'Other';
            if (!byTag[tagName]) byTag[tagName] = [];
            byTag[tagName].push(product);
        });
        return byTag;
    }

    function handleLogoPress() {}

    function handleLogout() {
        Alert.alert('Logout', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') }]);
    }

    function handleFilterPress() {}

    function handleImagePress(index) {}

    async function handleImageUpload() {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library');
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (pickerResult.canceled) {
                return;
            }

            const imageUri = pickerResult.assets[0].uri;
            const result = await uploadImage(imageUri, 'promos');

            if (result.success && result.url) {
                const updatedImages = [...promoImages, result.url];
                setPromoImages(updatedImages);
                const updateResult = await updateBusinessProfile({ promoImages: updatedImages });
                if (updateResult.success) {
                    Alert.alert('Success', 'Image uploaded successfully');
                } else {
                    Alert.alert('Error', 'Failed to save image');
                }
            } else {
                Alert.alert('Error', result.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error in handleImageUpload:', error);
            Alert.alert('Error', 'Failed to upload image');
        }
    }

    function handleProductPress(product) {
        setEditingProduct(product);
        setShowAddProduct(true);
    }

    function handleAddButtonPress() {
        setEditingProduct(null);
        setShowAddProduct(true);
    }

    async function handleSaveProduct(product) {
        try {
            let result;
            if (editingProduct) {
                // Update existing product
                result = await updateProduct(product.id, product);
            } else {
                // Add new product
                result = await addProduct(product);
            }

            if (result.success) {
                // Products will auto-update via subscription
                setShowAddProduct(false);
                setEditingProduct(null);
            } else {
                Alert.alert('Error', result.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Error', 'Failed to save product');
        }
    }

    if (showAddProduct) {
        return React.createElement(AddProductScreen, {
            onBack: () => {
                setShowAddProduct(false);
                setEditingProduct(null);
            },
            onSaveProduct: handleSaveProduct,
            editProduct: editingProduct
        });
    }

    const productsByTag = organizeProductsByTags();

    if (loading) {
        return React.createElement(View, { style: [styles.container, styles.centerContent] },
            React.createElement(ActivityIndicator, { size: "large", color: "#4CAF50" }),
            React.createElement(Text, { style: styles.loadingText }, "Loading products...")
        );
    }

    return React.createElement(View, { style: styles.container },
        React.createElement(View, { style: styles.header },
            React.createElement(TouchableOpacity, { onPress: handleLogoPress, style: styles.logoContainer },
                businessLogo ?
                React.createElement(Image, { source: { uri: businessLogo }, style: styles.logoImage }) :
                React.createElement(View, { style: styles.logoPlaceholder },
                    React.createElement(Icon, { name: "business", size: 24, color: "#4CAF50" })
                )
            ),
            React.createElement(Text, { style: styles.headerTitle }, companyName),
            React.createElement(TouchableOpacity, { onPress: handleLogout, style: styles.logoutButton },
                React.createElement(Icon, { name: "log-out-outline", size: 24, color: "#333" })
            )
        ),
        React.createElement(View, { style: styles.searchContainer },
            React.createElement(View, { style: styles.searchInputWrapper },
                React.createElement(Icon, { name: "search-outline", size: 20, color: "#999", style: styles.searchIcon }),
                React.createElement(TextInput, { style: styles.searchInput, placeholder: "Search...", value: searchQuery, onChangeText: setSearchQuery, placeholderTextColor: "#999" })
            ),
            React.createElement(TouchableOpacity, { style: styles.filterButton, onPress: handleFilterPress },
                React.createElement(Icon, { name: "filter-outline", size: 24, color: selectedFilter ? '#4CAF50' : '#333' }),
                selectedFilter && React.createElement(View, { style: styles.filterBadge })
            )
        ),
        selectedFilter && React.createElement(View, { style: styles.filterIndicator },
            React.createElement(Text, { style: styles.filterText }, "Filtered by: " + selectedFilter),
            React.createElement(TouchableOpacity, { onPress: () => setSelectedFilter(null), style: styles.clearFilter },
                React.createElement(Icon, { name: "close-circle", size: 20, color: "#4CAF50" })
            )
        ),
        React.createElement(ScrollView, { style: styles.scrollContent, contentContainerStyle: { paddingBottom: 120 } },
            React.createElement(View, { style: styles.promoSection },
                React.createElement(Text, { style: styles.sectionTitle }, "School Promo"),
                React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.carousel, contentContainerStyle: styles.carouselContent },
                    promoImages.map((image, index) => React.createElement(TouchableOpacity, { key: index, style: styles.carouselItem, onPress: () => handleImagePress(index) },
                        React.createElement(Image, { source: { uri: image }, style: styles.carouselImage })
                    )),
                    React.createElement(TouchableOpacity, { style: styles.uploadPlaceholder, onPress: handleImageUpload },
                        React.createElement(Icon, { name: "cloud-upload-outline", size: 40, color: "#999" }),
                        React.createElement(Text, { style: styles.uploadText }, "Upload Image")
                    )
                )
            ),
            Object.keys(productsByTag).map((tag) => React.createElement(View, { key: tag, style: styles.promoSection },
                React.createElement(Text, { style: styles.sectionTitle }, tag.charAt(0).toUpperCase() + tag.slice(1)),
                React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.carousel, contentContainerStyle: styles.carouselContent },
                    productsByTag[tag].map((product) => React.createElement(TouchableOpacity, { key: product.id, style: styles.productCard, onPress: () => handleProductPress(product) },
                        React.createElement(Image, { source: { uri: product.image || product.imageUrl }, style: styles.productImage }),
                        React.createElement(TouchableOpacity, {
                                style: styles.deleteButton,
                                onPress: async() => {
                                    Alert.alert('Remove Product', `Are you sure you want to remove "${product.label || product.name}"?`, [{ text: 'Cancel', style: 'cancel' }, {
                                        text: 'Remove',
                                        style: 'destructive',
                                        onPress: async() => {
                                            const result = await deleteProduct(product.id);
                                            if (result.success) { Alert.alert('Success', 'Product removed successfully'); } else { Alert.alert('Error', result.error || 'Failed to remove product'); }
                                        }
                                    }]);
                                }
                            },
                            React.createElement(Icon, { name: "trash-outline", size: 18, color: "#fff" })
                        ),
                        React.createElement(View, { style: styles.productInfo },
                            React.createElement(Text, { style: styles.productName, numberOfLines: 1 }, product.label || product.name),
                            React.createElement(View, { style: styles.priceContainer },
                                product.discountedPrice ?
                                React.createElement(React.Fragment, null,
                                    React.createElement(Text, { style: styles.discountedPrice }, product.discountedPrice),
                                    React.createElement(Text, { style: styles.originalPriceStrike }, product.originalPrice)
                                ) :
                                React.createElement(Text, { style: styles.productPrice }, product.originalPrice || product.price)
                            ),
                            React.createElement(Text, { style: styles.quantityText }, "Qty: " + (product.quantity || product.stockQuantity)),
                            React.createElement(View, { style: [styles.statusBadge, product.status === 'available' ? styles.statusAvailable : product.status === 'out of stock' ? styles.statusOutOfStock : styles.statusPreOrder] },
                                React.createElement(Text, { style: styles.statusText }, product.status)
                            )
                        )
                    ))
                )
            ))
        ),
        React.createElement(View, { style: styles.bottomNav },
            React.createElement(TouchableOpacity, { style: styles.navButton, onPress: () => setActiveTab('home') },
                React.createElement(Icon, { name: activeTab === 'home' ? 'home' : 'home-outline', size: 28, color: activeTab === 'home' ? '#4CAF50' : '#999' })
            ),
            React.createElement(TouchableOpacity, { style: styles.navButton, onPress: handleAddButtonPress },
                React.createElement(View, { style: styles.addButton },
                    React.createElement(Icon, { name: "add", size: 32, color: "#fff" })
                )
            ),
            React.createElement(TouchableOpacity, {
                    style: styles.navButton,
                    onPress: () => {
                        setActiveTab('chat');
                        navigation.navigate('BusinessChatList');
                    }
                },
                React.createElement(Icon, { name: activeTab === 'chat' ? 'chatbubble' : 'chatbubble-outline', size: 28, color: activeTab === 'chat' ? '#4CAF50' : '#999' })
            )
        )
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#eee' },
    logoContainer: { marginRight: 12 },
    logoImage: { width: 40, height: 40, borderRadius: 20 },
    logoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#333' },
    logoutButton: { marginLeft: 12 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff' },
    searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 8 },
    searchIcon: { marginRight: 6 },
    searchInput: { flex: 1, height: 36, fontSize: 16, color: '#333' },
    filterButton: { marginLeft: 10 },
    filterBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', position: 'absolute', top: 2, right: 2 },
    filterIndicator: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, marginLeft: 8 },
    filterText: { fontSize: 14, color: '#4CAF50', marginRight: 8 },
    clearFilter: { padding: 2 },
    scrollContent: { flex: 1 },
    promoSection: { marginVertical: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8, marginLeft: 12 },
    carousel: { paddingLeft: 12 },
    carouselContent: { alignItems: 'center' },
    carouselItem: { marginRight: 12 },
    carouselImage: { width: 120, height: 80, borderRadius: 8 },
    uploadPlaceholder: { width: 120, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    uploadText: { fontSize: 12, color: '#999', marginTop: 4 },
    productCard: { width: 140, marginRight: 12, backgroundColor: '#fff', borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, padding: 8 },
    productImage: { width: '100%', height: 80, borderRadius: 8 },
    deleteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#f44336', borderRadius: 12, padding: 4, zIndex: 2 },
    productInfo: { marginTop: 8 },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    discountedPrice: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold', marginRight: 6 },
    originalPriceStrike: { fontSize: 14, color: '#999', textDecorationLine: 'line-through' },
    productPrice: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    quantityText: { fontSize: 14, color: '#666', marginTop: 2 },
    statusBadge: { marginTop: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
    statusAvailable: { backgroundColor: '#C8E6C9' },
    statusOutOfStock: { backgroundColor: '#FFCDD2' },
    statusPreOrder: { backgroundColor: '#FFE0B2' },
    statusText: { fontSize: 12, color: '#333' },
    bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', elevation: 8 },
    navButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', marginTop: -24, elevation: 4 },
    centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
});