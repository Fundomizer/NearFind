import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import {
    subscribeToBusinessMessages,
    sendBusinessMessage,
    markBusinessConversationAsRead
} from '../services/messageService';

export default function BusinessIndividualChatScreen({ route, navigation }) {
    const { conversationId, customerEmail, userId } = route.params;
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            const unsubscribe = subscribeToBusinessMessages(conversationId, (msgs) => {
                setMessages(msgs);
                setLoading(false);
                // Scroll to bottom when new messages arrive
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            });

            // Mark conversation as read
            markBusinessConversationAsRead(conversationId);

            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [conversationId]);

    const handleSend = async () => {
        if (!messageText.trim() || sending) return;

        const textToSend = messageText.trim();
        setMessageText('');
        setSending(true);

        const result = await sendBusinessMessage(conversationId, textToSend);

        setSending(false);

        if (!result.success) {
            // Restore message text if sending failed
            setMessageText(textToSend);
            alert('Failed to send message. Please try again.');
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const renderMessage = ({ item }) => {
        const isShop = item.sender === 'shop';

        return (
            <View
                style={[
                    styles.messageContainer,
                    isShop ? styles.shopMessageContainer : styles.userMessageContainer
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isShop ? styles.shopMessageBubble : styles.userMessageBubble
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isShop ? styles.shopMessageText : styles.userMessageText
                        ]}
                    >
                        {item.text}
                    </Text>
                    <Text
                        style={[
                            styles.messageTimestamp,
                            isShop ? styles.shopMessageTimestamp : styles.userMessageTimestamp
                        ]}
                    >
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.customerAvatar}>
                        <Icon name="person" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.customerName}>{customerEmail || 'Customer'}</Text>
                        <Text style={styles.customerStatus}>Customer</Text>
                    </View>
                </View>
            </View>

            {/* Messages List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Icon name="chatbubble-ellipses-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Start the conversation with your customer</Text>
                        </View>
                    )}
                />
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!messageText.trim() || sending) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!messageText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Icon name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    customerStatus: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '75%',
    },
    shopMessageContainer: {
        alignSelf: 'flex-end',
    },
    userMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    shopMessageBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    userMessageBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    shopMessageText: {
        color: '#fff',
    },
    userMessageText: {
        color: '#333',
    },
    messageTimestamp: {
        fontSize: 11,
        marginTop: 4,
    },
    shopMessageTimestamp: {
        color: '#E8F5E9',
    },
    userMessageTimestamp: {
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        color: '#333',
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
