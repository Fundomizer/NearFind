import { db, auth, storage } from '../config/firebase';
import {
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