import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { subscribeToBusinessConversations } from '../services/messageService';
import { getBusinessProfile } from '../services/businessService';

export default function BusinessChatScreen({ navigation, route }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  useEffect(() => {
    if (shopId) {
      const unsubscribe = subscribeToBusinessConversations(shopId, (convos) => {
        setConversations(convos);
        setLoading(false);
      });

      if (!unsubscribe) {
        setLoading(false);
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [shopId]);

  const loadBusinessProfile = async () => {
    const result = await getBusinessProfile();
    if (result.success) {
      setShopId(result.data.id);
    } else {
      setLoading(false);
      console.error('Failed to load business profile:', result.error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const handleConversationPress = (conversation) => {
    if (navigation) {
      navigation.navigate('BusinessIndividualChat', {
        conversationId: conversation.id,
        customerEmail: conversation.userEmail,
        userId: conversation.userId
      });
    } else {
      console.log('Open conversation:', conversation.userEmail);
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item)}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={24} color="#999" />
        </View>
        {item.unreadCount > 0 && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.customerName}>{item.userEmail || 'Customer'}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyText}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptySubtitle}>Customer messages will appear here</Text>
        </View>
      ) : (
        <FlatList data={conversations} renderItem={renderConversation} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} ItemSeparatorComponent={() => <View style={styles.separator} />} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  menuButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#999', textAlign: 'center' },
  listContainer: { paddingVertical: 8 },
  conversationItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff' },
  conversationContent: { flex: 1, justifyContent: 'center' },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#333' },
  timestamp: { fontSize: 13, color: '#999' },
  messagePreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lastMessage: { flex: 1, fontSize: 14, color: '#666', marginRight: 8 },
  unreadMessage: { color: '#333', fontWeight: '600' },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  unreadBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 88 },
});