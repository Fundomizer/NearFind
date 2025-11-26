import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';

// Create a new reservation
export const createReservation = async (productData, quantity) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

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

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reservations = [];

    querySnapshot.forEach((doc) => {
      reservations.push({
        id: doc.id,
        ...doc.data(),
      });
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
