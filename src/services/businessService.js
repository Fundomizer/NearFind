import { db, auth, storage } from '../config/firebase';
import {
<<<<<<< HEAD
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    setDoc,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Get business profile for current user
export const getBusinessProfile = async() => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                success: true,
                data: {
                    id: null,
                    companyName: 'Business',
                    logoUrl: null,
                    promoImages: [],
                },
            };
        }

        const profileRef = doc(db, 'businesses', user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
            return {
                success: true,
                data: {
                    id: user.uid,
                    ...profileDoc.data(),
                },
            };
        }

        // Return default profile if not found
        return {
            success: true,
            data: {
                id: user.uid,
                companyName: 'Business',
                logoUrl: null,
                promoImages: [],
            },
        };
    } catch (error) {
        console.error('Error getting business profile:', error);
        return {
            success: false,
            error: error.message,
            data: {
                id: null,
                companyName: 'Business',
                logoUrl: null,
                promoImages: [],
            },
        };
    }
};

// Update business profile
export const updateBusinessProfile = async(updates) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const profileRef = doc(db, 'businesses', user.uid);

        // Check if document exists
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
            await updateDoc(profileRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            });
        } else {
            // Create new profile if it doesn't exist
            await setDoc(profileRef, {
                ...updates,
                userId: user.uid,
                email: user.email,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating business profile:', error);
        return { success: false, error: error.message };
    }
};

// Upload image to Firebase Storage
export const uploadImage = async(imageUri, folder = 'products') => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Fetch the image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Create unique filename
        const filename = `${folder}/${user.uid}/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        // Upload the image
        await uploadBytes(storageRef, blob);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
};

// Subscribe to business products (real-time)
export const subscribeToBusinessProducts = (callback) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('User not authenticated');
            return null;
        }

        const q = query(
            collection(db, 'products'),
            where('businessId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const products = [];
            snapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            callback(products);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to products:', error);
        return null;
    }
};

// Add a new product
export const addProduct = async(product) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Upload product image if it's a local URI
        let imageUrl = product.image;
        if (product.image && product.image.startsWith('file://')) {
            const uploadResult = await uploadImage(product.image, 'products');
            if (!uploadResult.success) {
                return { success: false, error: 'Failed to upload image' };
            }
            imageUrl = uploadResult.url;
        }

        const productData = {
            ...product,
            image: imageUrl,
            businessId: user.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'products'), productData);

        return { success: true, productId: docRef.id };
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, error: error.message };
    }
};

// Update a product
export const updateProduct = async(productId, updates) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Upload new image if provided and is a local URI
        let imageUrl = updates.image;
        if (updates.image && updates.image.startsWith('file://')) {
            const uploadResult = await uploadImage(updates.image, 'products');
            if (!uploadResult.success) {
                return { success: false, error: 'Failed to upload image' };
            }
            imageUrl = uploadResult.url;
        }

        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            ...updates,
            image: imageUrl,
            updatedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
};

// Delete a product
export const deleteProduct = async(productId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get product to verify ownership
        const productRef = doc(db, 'products', productId);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
            return { success: false, error: 'Product not found' };
        }

        const productData = productDoc.data();
        if (productData.businessId !== user.uid) {
            return { success: false, error: 'Unauthorized' };
        }

        // Delete the product
        await deleteDoc(productRef);

        // Optionally delete the image from storage
        // (You might want to keep images for order history)

        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
};

// Get all products for current business
export const getBusinessProducts = async() => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const q = query(
            collection(db, 'products'),
            where('businessId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const products = [];

        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return { success: true, data: products };
    } catch (error) {
        console.error('Error getting business products:', error);
        return { success: false, error: error.message };
    }
};

// Update product stock quantity
export const updateProductStock = async(productId, quantity) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const productRef = doc(db, 'products', productId);

        // Verify ownership
        const productDoc = await getDoc(productRef);
        if (!productDoc.exists() || productDoc.data().businessId !== user.uid) {
            return { success: false, error: 'Unauthorized or product not found' };
        }

        await updateDoc(productRef, {
            quantity: quantity,
            updatedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating product stock:', error);
        return { success: false, error: error.message };
    }
};
=======
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ==================== BUSINESS PROFILE ====================

/**
 * Get or create business profile for current user
 */
export const getBusinessProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const businessRef = doc(db, 'businesses', user.uid);
    const businessDoc = await getDoc(businessRef);

    if (businessDoc.exists()) {
      return { success: true, data: { id: businessDoc.id, ...businessDoc.data() } };
    } else {
      // Create default business profile using setDoc (not updateDoc)
      const defaultProfile = {
        userId: user.uid,
        userEmail: user.email,
        companyName: 'My Business',
        logo: null,
        location: null,
        latitude: null,
        longitude: null,
        shopHours: '9:00 AM - 6:00 PM',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(businessRef, defaultProfile);
      return { success: true, data: { id: user.uid, ...defaultProfile } };
    }
  } catch (error) {
    console.error('Error getting business profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update business profile
 */
export const updateBusinessProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const businessRef = doc(db, 'businesses', user.uid);

    const updateData = {
      ...profileData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(businessRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating business profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload image to Firebase Storage and return download URL
 */
export const uploadImage = async (imageUri, folder = 'products') => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Upload failed: User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    console.log('📤 Starting image upload to Firebase Storage...');
    console.log('📁 Folder:', folder);
    console.log('👤 User ID:', user.uid);
    console.log('🖼️  Image URI:', imageUri);

    // Fetch the image and convert to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    console.log('✅ Image fetched, blob size:', (blob.size / 1024).toFixed(2), 'KB');

    // Create a unique filename using timestamp and user ID
    const filename = `${folder}/${user.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    console.log('📂 Uploading to path:', filename);

    // Upload the blob to Firebase Storage
    await uploadBytes(storageRef, blob);
    console.log('✅ Blob uploaded successfully');

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log('✅ Image uploaded successfully!');
    console.log('🔗 Download URL:', downloadURL);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('❌ Error uploading image to Firebase Storage:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    // Provide more helpful error messages
    if (error.code === 'storage/unauthorized') {
      return { success: false, error: 'Firebase Storage rules not configured. Please check FIREBASE_STORAGE_SETUP.md' };
    } else if (error.code === 'storage/unauthenticated') {
      return { success: false, error: 'User not authenticated. Please log in again.' };
    } else if (error.code === 'storage/unknown') {
      return { success: false, error: 'Firebase Storage might not be enabled. Check Firebase Console > Storage.' };
    }

    return { success: false, error: error.message };
  }
};

// ==================== PRODUCTS ====================

/**
 * Add a new product to Firestore
 */
export const addProduct = async (productData) => {
  try {
    console.log('addProduct called with data:', JSON.stringify(productData, null, 2));

    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get business profile to get shop name
    const businessProfile = await getBusinessProfile();
    if (!businessProfile.success) {
      return { success: false, error: 'Business profile not found' };
    }

    console.log('Business profile:', JSON.stringify(businessProfile.data, null, 2));

    // Upload product image if it's a local URI
    let imageUrl = productData.image;
    if (productData.image && productData.image.startsWith('file://')) {
      console.log('Uploading image from local file...');
      const uploadResult = await uploadImage(productData.image, 'products');
      if (!uploadResult.success) {
        console.error('Image upload failed:', uploadResult.error);
        return { success: false, error: uploadResult.error };
      }
      imageUrl = uploadResult.url;
      console.log('Image uploaded successfully, size:', (imageUrl.length / 1024).toFixed(2), 'KB');
    }

    // Calculate discount percentage if discounted price exists
    let discountPercentage = 0;
    if (productData.discountedPrice && productData.originalPrice > productData.discountedPrice) {
      discountPercentage = Math.round(((productData.originalPrice - productData.discountedPrice) / productData.originalPrice) * 100);
    }

    const product = {
      name: productData.label,
      price: productData.discountedPrice || productData.originalPrice,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice || null,
      discount: discountPercentage,
      description: productData.description || '',
      imageUrl: imageUrl,
      stockQuantity: productData.quantity || 0,
      inStock: (productData.quantity || 0) > 0 && productData.status === 'available',
      status: productData.status || 'available',
      tags: productData.tags || [],
      category: productData.category || 'General',
      shopName: businessProfile.data.companyName,
      shopId: user.uid,
      latitude: businessProfile.data.latitude || 0,
      longitude: businessProfile.data.longitude || 0,
      shopHours: businessProfile.data.shopHours || '9:00 AM - 6:00 PM',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'products'), product);

    console.log('Product added successfully:', docRef.id);
    console.log('Product saved - Name:', product.name, 'Price:', product.price, 'Category:', product.category);

    // Verify the document was actually saved
    setTimeout(async () => {
      const verifyDoc = await getDoc(docRef);
      if (verifyDoc.exists()) {
        console.log('✓ Product verified in Firestore:', docRef.id);
      } else {
        console.error('✗ Product NOT found in Firestore after save:', docRef.id);
      }
    }, 1000);

    return { success: true, productId: docRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify product ownership
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }

    if (productDoc.data().shopId !== user.uid) {
      return { success: false, error: 'Access denied' };
    }

    // Upload new image if changed and is local URI
    let imageUrl = productData.image;
    if (productData.image && productData.image.startsWith('file://')) {
      const uploadResult = await uploadImage(productData.image, 'products');
      if (!uploadResult.success) {
        return { success: false, error: 'Failed to upload product image' };
      }
      imageUrl = uploadResult.url;
    }

    // Calculate discount percentage if discounted price exists
    let discountPercentage = 0;
    if (productData.discountedPrice && productData.originalPrice > productData.discountedPrice) {
      discountPercentage = Math.round(((productData.originalPrice - productData.discountedPrice) / productData.originalPrice) * 100);
    }

    const updateData = {
      name: productData.label,
      price: productData.discountedPrice || productData.originalPrice,
      originalPrice: productData.originalPrice,
      discountedPrice: productData.discountedPrice || null,
      discount: discountPercentage,
      description: productData.description || '',
      imageUrl: imageUrl,
      stockQuantity: productData.quantity || 0,
      inStock: (productData.quantity || 0) > 0 && productData.status === 'available',
      status: productData.status || 'available',
      tags: productData.tags || [],
      category: productData.category || 'General',
      updatedAt: Timestamp.now(),
    };

    await updateDoc(productRef, updateData);

    console.log('Product updated successfully:', productId);
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify product ownership
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }

    if (productDoc.data().shopId !== user.uid) {
      return { success: false, error: 'Access denied' };
    }

    await deleteDoc(productRef);

    console.log('Product deleted successfully:', productId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all products for current business
 */
export const getBusinessProducts = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'products'),
      where('shopId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Loaded ${products.length} products for business`);
    return { success: true, products };
  } catch (error) {
    console.error('Error getting business products:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to real-time product updates for current business
 */
export const subscribeToBusinessProducts = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const q = query(
      collection(db, 'products'),
      where('shopId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      console.log(`Real-time update: ${products.length} products`);
      callback(products);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to products:', error);
    return null;
  }
};

// ==================== RESERVATIONS ====================

/**
 * Get all reservations for current business
 */
export const getBusinessReservations = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get all products for this business
    const productsResult = await getBusinessProducts();
    if (!productsResult.success) {
      return productsResult;
    }

    const productIds = productsResult.products.map(p => p.id);

    if (productIds.length === 0) {
      return { success: true, reservations: [] };
    }

    // Get reservations for these products
    const q = query(
      collection(db, 'reservations'),
      where('productId', 'in', productIds.slice(0, 10)) // Firestore limit: max 10 items in 'in' query
    );

    const querySnapshot = await getDocs(q);
    const reservations = [];

    querySnapshot.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt descending
    reservations.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    console.log(`Loaded ${reservations.length} reservations for business`);
    return { success: true, reservations };
  } catch (error) {
    console.error('Error getting business reservations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to real-time reservation updates for current business
 */
export const subscribeToBusinessReservations = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    // First get business products to know which reservations to watch
    getBusinessProducts().then((productsResult) => {
      if (!productsResult.success || productsResult.products.length === 0) {
        callback([]);
        return;
      }

      const productIds = productsResult.products.map(p => p.id);

      // Subscribe to reservations for these products
      const q = query(
        collection(db, 'reservations'),
        where('productId', 'in', productIds.slice(0, 10)) // Firestore limit
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reservations = [];
        snapshot.forEach((doc) => {
          reservations.push({ id: doc.id, ...doc.data() });
        });

        // Sort by createdAt descending
        reservations.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

        console.log(`Real-time update: ${reservations.length} reservations`);
        callback(reservations);
      });

      return unsubscribe;
    });
  } catch (error) {
    console.error('Error subscribing to reservations:', error);
    return null;
  }
};
>>>>>>> 88981e373c144f654f005a65718cd99475f835bd
