import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

/**
 * Add a product to user's favorites
 */
export const addToFavorites = async (product) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if already favorited
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('productId', '==', product.id)
    );

    const snapshot = await getDocs(favoritesQuery);

    if (!snapshot.empty) {
      return { success: false, error: 'Product already in favorites' };
    }

    // Add to favorites
    const favoriteData = {
      userId: user.uid,
      userEmail: user.email,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.imageUrl,
      shopName: product.shopName,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'favorites'), favoriteData);

    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove a product from user's favorites
 */
export const removeFromFavorites = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Find the favorite document
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('productId', '==', productId)
    );

    const snapshot = await getDocs(favoritesQuery);

    if (snapshot.empty) {
      return { success: false, error: 'Product not in favorites' };
    }

    // Delete the favorite
    await deleteDoc(doc(db, 'favorites', snapshot.docs[0].id));

    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a product is in user's favorites
 */
export const isFavorite = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, isFavorite: false };
    }

    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('productId', '==', productId)
    );

    const snapshot = await getDocs(favoritesQuery);

    return { success: true, isFavorite: !snapshot.empty };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { success: false, error: error.message, isFavorite: false };
  }
};

/**
 * Get all favorites for the current user
 */
export const getUserFavorites = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(favoritesQuery);

    const favorites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: favorites };
  } catch (error) {
    console.error('Error getting favorites:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Subscribe to user's favorites in real-time
 */
export const subscribeToFavorites = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(favoritesQuery, (snapshot) => {
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(favorites);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to favorites:', error);
    return null;
  }
};
