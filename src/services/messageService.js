import { db, auth } from '../config/firebase';
import {
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
};

// Get all messages for a conversation (real-time listener)
export const subscribeToMessages = (conversationId, callback) => {
  try {
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
      where('userId', '==', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to conversations (real-time)
export const subscribeToConversations = (callback) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        });
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
