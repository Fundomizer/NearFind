import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================
// PRODUCTS
// ============================================

// Add a new product
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all products
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get products by location (within certain distance)
export const getProductsByLocation = async (userLat, userLng, maxDistance = 10) => {
  try {
    // Note: For production, use Geohash or GeoFirestore for efficient location queries
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Calculate distance (simplified - for production use proper geospatial queries)
      const distance = calculateDistance(userLat, userLng, data.latitude, data.longitude);

      if (distance <= maxDistance) {
        products.push({ id: doc.id, ...data, distance: distance.toFixed(2) });
      }
    });

    // Sort by distance
    products.sort((a, b) => a.distance - b.distance);

    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SHOPS
// ============================================

// Add a new shop
export const addShop = async (shopData) => {
  try {
    const docRef = await addDoc(collection(db, 'shops'), {
      ...shopData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all shops
export const getShops = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shops'));
    const shops = [];
    querySnapshot.forEach((doc) => {
      shops.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: shops };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REVIEWS
// ============================================

// Add a review
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: reviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all reviews (for feed)
export const getAllReviews = async () => {
  try {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: reviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// CHAT MESSAGES
// ============================================

// Add a chat message
export const addChatMessage = async (userId, message, sender) => {
  try {
    const docRef = await addDoc(collection(db, 'chats'), {
      userId,
      message,
      sender, // 'user' or 'ai'
      timestamp: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get chat history for a user
export const getChatHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
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
  return distance;
};
