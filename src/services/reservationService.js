import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';

// Create a new reservation
export const createReservation = async (productData, quantity) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if product has enough stock
    const productRef = doc(db, 'products', productData.id);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }

    const currentStock = productDoc.data().stockQuantity || 0;

    if (currentStock < quantity) {
      return { success: false, error: `Only ${currentStock} items available` };
    }

    // Create reservation
    const reservationData = {
      userId: user.uid,
      userEmail: user.email,
      productId: productData.id,
      productName: productData.name,
      productPrice: productData.price,
      productImage: productData.imageUrl,
      shopName: productData.shopName,
      shopLatitude: productData.latitude,
      shopLongitude: productData.longitude,
      quantity: quantity,
      totalPrice: productData.price * quantity,
      status: 'pending', // pending, confirmed, completed, cancelled
      createdAt: Timestamp.now(),
      pickupDate: null, // To be set later if needed
    };

    const docRef = await addDoc(collection(db, 'reservations'), reservationData);

    // Decrease stock quantity
    const newStock = currentStock - quantity;
    await updateDoc(productRef, {
      stockQuantity: newStock,
      inStock: newStock > 0,
    });

    return {
      success: true,
      reservationId: docRef.id,
      data: reservationData
    };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false, error: error.message };
  }
};

// Get all reservations for current user
export const getUserReservations = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Query without orderBy first to avoid composite index requirement
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const reservations = [];

    querySnapshot.forEach((doc) => {
      reservations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in memory by createdAt descending
    reservations.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    return { success: true, data: reservations };
  } catch (error) {
    console.error('Error getting reservations:', error);
    return { success: false, error: error.message };
  }
};

// Update reservation status
export const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { success: false, error: error.message };
  }
};

// Cancel a reservation
export const cancelReservation = async (reservationId) => {
  return updateReservationStatus(reservationId, 'cancelled');
};
