import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { subscribeToBusinessConversations } from '../services/messageService';
import { getBusinessProfile } from '../services/businessService';

export default function BusinessChatScreen({ navigation, route }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopId, setShopId] = useState(null);
    const { onGoBack } = route.params || {};

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
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;

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
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleConversationPress(item)}
        >
            <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Icon name="person" size={24} color="#999" />
                </View>
                {(item.businessUnreadCount || 0) > 0 && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.customerName}>{item.userEmail || 'Customer'}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(item.lastMessageTime)}</Text>
                </View>
                <View style={styles.messagePreview}>
                    <Text
                        style={[styles.lastMessage, (item.businessUnreadCount || 0) > 0 && styles.unreadMessage]}
                        numberOfLines={1}
                    >
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                    {(item.businessUnreadCount || 0) > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{item.businessUnreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (onGoBack) {
                            onGoBack();
                        } else {
                            navigation.goBack();
                        }
                    }}
                    style={styles.backButton}
                >
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
                    <Text style={styles.emptyText}>No conversations yet</Text>
                    <Text style={styles.emptySubtext}>Customers will appear here when they message you</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#333',
    },
    menuButton: {
        padding: 8,
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
    },
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#333',
    },
    unreadBadge: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
