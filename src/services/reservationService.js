import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, Timestamp, getDoc, onSnapshot } from 'firebase/firestore';

// Create a new reservation
export const createReservation = async (productData, quantity, pickupTime) => {
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
      productStatus: productData.status || 'available', // Track if it's a pre-order
      shopName: productData.shopName,
      shopLatitude: productData.latitude,
      shopLongitude: productData.longitude,
      shopHours: productData.shopHours,
      quantity: quantity,
      totalPrice: productData.price * quantity,
      status: 'pending', // pending, confirmed, completed, cancelled
      createdAt: Timestamp.now(),
      pickupTime: pickupTime || null, // Selected pickup time
    };

    const docRef = await addDoc(collection(db, 'reservations'), reservationData);

    // Decrease stock quantity
    const newStock = currentStock - quantity;
    console.log('Updating stock:', {
      productId: productData.id,
      productName: productData.name,
      currentStock,
      quantity,
      newStock,
      inStock: newStock > 0
    });

    await updateDoc(productRef, {
      stockQuantity: newStock,
      inStock: newStock > 0,
    });

    console.log('Stock updated successfully');

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

// Subscribe to real-time reservation updates for current user
export const subscribeToReservations = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservations = [];
      snapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort by createdAt descending
      reservations.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });

      callback(reservations);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to reservations:', error);
    return null;
  }
};

// Cancel a reservation and restore stock
export const cancelReservation = async (reservationId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('=== CANCEL RESERVATION START ===');
    console.log('Reservation ID:', reservationId);

    // Get the reservation details
    const reservationRef = doc(db, 'reservations', reservationId);
    const reservationDoc = await getDoc(reservationRef);

    if (!reservationDoc.exists()) {
      console.log('❌ Reservation not found');
      return { success: false, error: 'Reservation not found' };
    }

    const reservationData = reservationDoc.data();
    console.log('Reservation Status:', reservationData.status);
    console.log('Reservation Quantity:', reservationData.quantity);

    // Verify user owns this reservation
    if (reservationData.userId !== user.uid) {
      console.log('❌ Access denied');
      return { success: false, error: 'Access denied' };
    }

    // Check if reservation is already cancelled
    if (reservationData.status === 'cancelled') {
      console.log('⚠️ Reservation already cancelled - SKIPPING stock restoration');
      return { success: false, error: 'Reservation already cancelled' };
    }

    // IMPORTANT: Update reservation status to cancelled FIRST
    // This prevents race conditions where the function could be called twice
    await updateDoc(reservationRef, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Reservation status updated to cancelled');

    // Now restore the stock quantity
    const productRef = doc(db, 'products', reservationData.productId);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      const currentStock = productDoc.data().stockQuantity || 0;
      const newStock = currentStock + reservationData.quantity;

      console.log('📦 Stock Restoration:', {
        productName: reservationData.productName,
        currentStock,
        quantityToRestore: reservationData.quantity,
        newStock
      });

      await updateDoc(productRef, {
        stockQuantity: newStock,
        inStock: true, // Product is back in stock
      });

      console.log('✅ Stock restored successfully');
    } else {
      console.log('⚠️ Product not found - skipping stock restoration');
    }

    console.log('=== CANCEL RESERVATION END ===\n');

    return { success: true };
  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    return { success: false, error: error.message };
  }
};
