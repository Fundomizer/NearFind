import { db, auth } from '../config/firebase';
import {
<<<<<<< HEAD
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc,
} from 'firebase/firestore';

// Create or get a conversation between user and shop
export const getOrCreateConversation = async(shopName, shopId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Create a unique conversation ID based on user and shop
        const conversationId = `${user.uid}_${shopId}`;
        const conversationRef = doc(db, 'conversations', conversationId);

        // Check if conversation exists
        const conversationDoc = await getDoc(conversationRef);

        if (!conversationDoc.exists()) {
            // Create new conversation
            await setDoc(conversationRef, {
                id: conversationId,
                userId: user.uid,
                userEmail: user.email,
                shopId: shopId,
                shopName: shopName,
                lastMessage: '',
                lastMessageTime: Timestamp.now(),
                unreadCount: 0,
                businessUnreadCount: 0,
                createdAt: Timestamp.now(),
            });
        }

        return { success: true, conversationId };
    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        return { success: false, error: error.message };
    }
};

// Send a message
export const sendMessage = async(conversationId, shopName, messageText, sender = 'user') => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verify the conversationId belongs to the current user
        // conversationId format: {userId}_{shopId}
        if (!conversationId.startsWith(user.uid + '_')) {
            console.error('User does not have access to this conversation');
            return { success: false, error: 'Access denied to this conversation' };
        }

        const messageData = {
            conversationId,
            text: messageText,
            sender, // 'user' or 'shop'
            senderId: sender === 'user' ? user.uid : shopName,
            timestamp: Timestamp.now(),
            read: false,
        };

        // Add message to messages subcollection
        const messageRef = await addDoc(
            collection(db, 'conversations', conversationId, 'messages'),
            messageData
        );

        // Update conversation's last message
        const conversationRef = doc(db, 'conversations', conversationId);
        const updateData = {
            lastMessage: messageText,
            lastMessageTime: Timestamp.now(),
        };

        // Set unread count based on sender
        if (sender === 'shop') {
            updateData.unreadCount = 1; // Customer should see unread
            updateData.businessUnreadCount = 0; // Business has read their own message
        } else {
            updateData.unreadCount = 0; // Customer has read their own message
            updateData.businessUnreadCount = 1; // Business should see unread
        }

        await updateDoc(conversationRef, updateData);

        return { success: true, messageId: messageRef.id };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
=======
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Create or get a conversation between user and shop
export const getOrCreateConversation = async (shopName, shopId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create a unique conversation ID based on user and shop
    const conversationId = `${user.uid}_${shopId}`;
    const conversationRef = doc(db, 'conversations', conversationId);

    // Check if conversation exists
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      // Create new conversation
      await setDoc(conversationRef, {
        id: conversationId,
        userId: user.uid,
        userEmail: user.email,
        shopId: shopId,
        shopName: shopName,
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        unreadCount: 0,
        createdAt: Timestamp.now(),
      });
    }

    return { success: true, conversationId };
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    return { success: false, error: error.message };
  }
};

// Send a message
export const sendMessage = async (conversationId, shopName, messageText, sender = 'user') => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify the conversationId belongs to the current user
    // conversationId format: {userId}_{shopId}
    if (!conversationId.startsWith(user.uid + '_')) {
      console.error('User does not have access to this conversation');
      return { success: false, error: 'Access denied to this conversation' };
    }

    const messageData = {
      conversationId,
      text: messageText,
      sender, // 'user' or 'shop'
      senderId: sender === 'user' ? user.uid : shopName,
      timestamp: Timestamp.now(),
      read: false,
    };

    // Add message to messages subcollection
    const messageRef = await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: messageText,
      lastMessageTime: Timestamp.now(),
      unreadCount: sender === 'shop' ? 1 : 0, // Increment if from shop
    });

    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
>>>>>>> 88981e373c144f654f005a65718cd99475f835bd
};

// Get all messages for a conversation (real-time listener)
export const subscribeToMessages = (conversationId, callback) => {
<<<<<<< HEAD
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('User not authenticated');
            return null;
        }

        // Verify the conversationId belongs to the current user
        // conversationId format: {userId}_{shopId}
        if (!conversationId.startsWith(user.uid + '_')) {
            console.error('User does not have access to this conversation');
            return null;
        }

        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            callback(messages);
        });

        return unsubscribe; // Return function to unsubscribe
    } catch (error) {
        console.error('Error subscribing to messages:', error);
        return null;
    }
};

// Get all conversations for current user
export const getUserConversations = async() => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const q = query(
            collection(db, 'conversations'),
            where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const conversations = [];

        querySnapshot.forEach((doc) => {
            conversations.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Sort by lastMessageTime on the client side
        conversations.sort((a, b) => {
            const timeA = a.lastMessageTime ?.toMillis ? a.lastMessageTime.toMillis() : 0;
            const timeB = b.lastMessageTime ?.toMillis ? b.lastMessageTime.toMillis() : 0;
            return timeB - timeA;
        });

        return { success: true, data: conversations };
    } catch (error) {
        console.error('Error getting conversations:', error);
        return { success: false, error: error.message };
    }
=======
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    // Verify the conversationId belongs to the current user
    // conversationId format: {userId}_{shopId}
    if (!conversationId.startsWith(user.uid + '_')) {
      console.error('User does not have access to this conversation');
      return null;
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(messages);
    });

    return unsubscribe; // Return function to unsubscribe
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return null;
  }
};

// Get all conversations for current user
export const getUserConversations = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by lastMessageTime on the client side
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : 0;
      const timeB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : 0;
      return timeB - timeA;
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return { success: false, error: error.message };
  }
>>>>>>> 88981e373c144f654f005a65718cd99475f835bd
};

// Subscribe to conversations (real-time)
export const subscribeToConversations = (callback) => {
<<<<<<< HEAD
    try {
        const user = auth.currentUser;
        if (!user) {
            return null;
        }

        const q = query(
            collection(db, 'conversations'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const conversations = [];
            snapshot.forEach((doc) => {
                conversations.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Sort by lastMessageTime on the client side
            conversations.sort((a, b) => {
                const timeA = a.lastMessageTime ?.toMillis ? a.lastMessageTime.toMillis() : 0;
                const timeB = b.lastMessageTime ?.toMillis ? b.lastMessageTime.toMillis() : 0;
                return timeB - timeA;
            });

            callback(conversations);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to conversations:', error);
        return null;
    }
};

// Mark conversation as read
export const markConversationAsRead = async(conversationId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verify the conversationId belongs to the current user
        if (!conversationId.startsWith(user.uid + '_')) {
            console.error('User does not have access to this conversation');
            return { success: false, error: 'Access denied to this conversation' };
        }

        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            unreadCount: 0,
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        return { success: false, error: error.message };
    }
};

// ==================== BUSINESS FUNCTIONS ====================

// Get all conversations for a business (where shopId matches the business)
export const getBusinessConversations = async(shopId) => {
    try {
        if (!shopId) {
            return { success: false, error: 'Shop ID is required' };
        }

        const q = query(
            collection(db, 'conversations'),
            where('shopId', '==', shopId)
        );

        const querySnapshot = await getDocs(q);
        const conversations = [];

        querySnapshot.forEach((doc) => {
            conversations.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Sort by lastMessageTime
        conversations.sort((a, b) => {
            const timeA = a.lastMessageTime ?.toMillis ? a.lastMessageTime.toMillis() : 0;
            const timeB = b.lastMessageTime ?.toMillis ? b.lastMessageTime.toMillis() : 0;
            return timeB - timeA;
        });

        return { success: true, data: conversations };
    } catch (error) {
        console.error('Error getting business conversations:', error);
        return { success: false, error: error.message };
    }
};

// Subscribe to business conversations (real-time)
export const subscribeToBusinessConversations = (shopId, callback) => {
    try {
        if (!shopId) {
            console.error('Shop ID is required');
            return null;
        }

        const q = query(
            collection(db, 'conversations'),
            where('shopId', '==', shopId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const conversations = [];
            snapshot.forEach((doc) => {
                conversations.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Sort by lastMessageTime
            conversations.sort((a, b) => {
                const timeA = a.lastMessageTime ?.toMillis ? a.lastMessageTime.toMillis() : 0;
                const timeB = b.lastMessageTime ?.toMillis ? b.lastMessageTime.toMillis() : 0;
                return timeB - timeA;
            });

            callback(conversations);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to business conversations:', error);
        return null;
    }
};

// Subscribe to messages for business (no user verification needed)
export const subscribeToBusinessMessages = (conversationId, callback) => {
    try {
        if (!conversationId) {
            console.error('Conversation ID is required');
            return null;
        }

        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            callback(messages);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error subscribing to business messages:', error);
        return null;
    }
};

// Send message as business
export const sendBusinessMessage = async(conversationId, messageText) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get conversation to verify business owns it
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationDoc = await getDoc(conversationRef);

        if (!conversationDoc.exists()) {
            return { success: false, error: 'Conversation not found' };
        }

        const conversationData = conversationDoc.data();

        // Verify the business user ID matches the shopId in the conversation
        // (assuming shopId is actually the business user's UID)
        if (conversationData.shopId !== user.uid) {
            return { success: false, error: 'Access denied to this conversation' };
        }

        const messageData = {
            conversationId,
            text: messageText,
            sender: 'shop',
            senderId: conversationData.shopName,
            timestamp: Timestamp.now(),
            read: false,
        };

        // Add message to messages subcollection
        const messageRef = await addDoc(
            collection(db, 'conversations', conversationId, 'messages'),
            messageData
        );

        // Update conversation's last message
        await updateDoc(conversationRef, {
            lastMessage: messageText,
            lastMessageTime: Timestamp.now(),
            unreadCount: 1, // Customer should see unread count
            businessUnreadCount: 0, // Business has read their own message
        });

        return { success: true, messageId: messageRef.id };
    } catch (error) {
        console.error('Error sending business message:', error);
        return { success: false, error: error.message };
    }
};

// Mark business conversation as read (for business side)
export const markBusinessConversationAsRead = async(conversationId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            businessUnreadCount: 0,
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking business conversation as read:', error);
        return { success: false, error: error.message };
    }
=======
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort by lastMessageTime on the client side
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : 0;
        const timeB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : 0;
        return timeB - timeA;
      });

      callback(conversations);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to conversations:', error);
    return null;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify the conversationId belongs to the current user
    if (!conversationId.startsWith(user.uid + '_')) {
      console.error('User does not have access to this conversation');
      return { success: false, error: 'Access denied to this conversation' };
    }

    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      unreadCount: 0,
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error: error.message };
  }
>>>>>>> 88981e373c144f654f005a65718cd99475f835bd
};
