<<<<<<< HEAD
﻿import React, { useState, useEffect, useRef } from 'react';
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
    subscribeToMessages,
    sendMessage,
    getOrCreateConversation,
    markConversationAsRead
} from '../services/messageService';

export default function IndividualChatScreen({ route, navigation }) {
    const { shopName, shopId, conversationId: initialConversationId } = route.params;
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const flatListRef = useRef(null);

    useEffect(() => {
        initializeConversation();
    }, []);

    useEffect(() => {
        if (conversationId) {
            const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
                setMessages(msgs);
                setLoading(false);
                // Mark conversation as read when new messages arrive
                markConversationAsRead(conversationId);
                // Scroll to bottom when new messages arrive
                setTimeout(() => {
                    flatListRef.current ?.scrollToEnd({ animated: true });
                }, 100);
            });

            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [conversationId]);

    const initializeConversation = async() => {
        if (!initialConversationId) {
            // Create new conversation if it doesn't exist
            const result = await getOrCreateConversation(shopName, shopId);
            if (result.success) {
                setConversationId(result.conversationId);
            } else {
                setLoading(false);
            }
        }
    };

    const handleSend = async() => {
        if (!messageText.trim() || sending) return;

        const textToSend = messageText.trim();
        setMessageText('');
        setSending(true);

        const result = await sendMessage(conversationId, shopName, textToSend, 'user');

        setSending(false);

        if (!result.success) {
            // Restore message text if sending failed
            setMessageText(textToSend);
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
        const isUser = item.sender === 'user';

        return ( <
            View style = {
                [
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.shopMessageContainer
                ]
            } >
            <
            View style = {
                [
                    styles.messageBubble,
                    isUser ? styles.userMessageBubble : styles.shopMessageBubble
                ]
            } >
            <
            Text style = {
                [
                    styles.messageText,
                    isUser ? styles.userMessageText : styles.shopMessageText
                ]
            } > { item.text } <
            /Text> <
            Text style = {
                [
                    styles.messageTimestamp,
                    isUser ? styles.userMessageTimestamp : styles.shopMessageTimestamp
                ]
            } > { formatTimestamp(item.timestamp) } <
            /Text> <
            /View> <
            /View>
        );
    };

    return ( <
        KeyboardAvoidingView style = { styles.container }
        behavior = { Platform.OS === 'ios' ? 'padding' : undefined }
        keyboardVerticalOffset = { Platform.OS === 'ios' ? 0 : 0 } >
        { /* Header */ } <
        View style = { styles.header } >
        <
        TouchableOpacity onPress = {
            () => navigation.goBack() }
        style = { styles.backButton } >
        <
        Icon name = "arrow-back"
        size = { 24 }
        color = "#333" / >
        <
        /TouchableOpacity> <
        View style = { styles.headerInfo } >
        <
        View style = { styles.shopAvatar } >
        <
        Icon name = "storefront"
        size = { 20 }
        color = "#4CAF50" / >
        <
        /View> <
        View style = { styles.headerTextContainer } >
        <
        Text style = { styles.shopName } > { shopName } < /Text> <
        Text style = { styles.shopStatus } > Typically replies within a day < /Text> <
        /View> <
        /View> <
        /View>

        { /* Messages List */ } {
            loading ? ( <
                View style = { styles.loadingContainer } >
                <
                ActivityIndicator size = "large"
                color = "#4CAF50" / >
                <
                Text style = { styles.loadingText } > Loading messages... < /Text> <
                /View>
            ) : ( <
                FlatList ref = { flatListRef }
                data = { messages }
                renderItem = { renderMessage }
                keyExtractor = {
                    (item) => item.id }
                contentContainerStyle = { styles.messagesList }
                onContentSizeChange = {
                    () => flatListRef.current ?.scrollToEnd({ animated: true }) }
                ListEmptyComponent = { <
                    View style = { styles.emptyContainer } >
                    <
                    Icon name = "chatbubble-ellipses-outline"
                    size = { 60 }
                    color = "#ccc" / >
                    <
                    Text style = { styles.emptyTitle } > Start a Conversation < /Text> <
                    Text style = { styles.emptyText } >
                    Send a message to { shopName }
                    about their products or services <
                    /Text> <
                    /View>
                }
                />
            )
        }

        { /* Input Area */ } <
        View style = { styles.inputContainer } >
        <
        TextInput style = { styles.input }
        placeholder = "Type a message..."
        placeholderTextColor = "#999"
        value = { messageText }
        onChangeText = { setMessageText }
        multiline maxLength = { 500 }
        /> <
        TouchableOpacity style = {
            [
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled
            ]
        }
        onPress = { handleSend }
        disabled = {!messageText.trim() || sending } >
        {
            sending ? ( <
                ActivityIndicator size = "small"
                color = "#fff" / >
            ) : ( <
                Icon name = "send"
                size = { 20 }
                color = "#fff" / >
            )
        } <
        /TouchableOpacity> <
        /View> <
        /KeyboardAvoidingView>
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
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopAvatar: {
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
    shopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    shopStatus: {
        fontSize: 12,
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
        fontSize: 15,
        color: '#666',
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
        minHeight: 400,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    messageContainer: {
        marginBottom: 12,
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    shopMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    userMessageBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    shopMessageBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    userMessageText: {
        color: '#fff',
    },
    shopMessageText: {
        color: '#333',
    },
    messageTimestamp: {
        fontSize: 11,
    },
    userMessageTimestamp: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    shopMessageTimestamp: {
        color: '#999',
        textAlign: 'left',
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
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#333',
        maxHeight: 100,
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
=======
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
  subscribeToMessages,
  sendMessage,
  getOrCreateConversation,
  markConversationAsRead
} from '../services/messageService';

export default function IndividualChatScreen({ route, navigation }) {
  const { shopName, shopId, conversationId: initialConversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
        setMessages(msgs);
        setLoading(false);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Mark conversation as read
      markConversationAsRead(conversationId);

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [conversationId]);

  const initializeConversation = async () => {
    if (!initialConversationId) {
      // Create new conversation if it doesn't exist
      const result = await getOrCreateConversation(shopName, shopId);
      if (result.success) {
        setConversationId(result.conversationId);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    const result = await sendMessage(conversationId, shopName, textToSend, 'user');

    setSending(false);

    if (!result.success) {
      // Restore message text if sending failed
      setMessageText(textToSend);
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
    const isUser = item.sender === 'user';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.shopMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.shopMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.shopMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTimestamp,
            isUser ? styles.userMessageTimestamp : styles.shopMessageTimestamp
          ]}>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.shopAvatar}>
            <Icon name="storefront" size={20} color="#4CAF50" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.shopStatus}>Typically replies within a day</Text>
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chatbubble-ellipses-outline" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>Start a Conversation</Text>
              <Text style={styles.emptyText}>
                Send a message to {shopName} about their products or services
              </Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
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
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shopStatus: {
    fontSize: 12,
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
    fontSize: 15,
    color: '#666',
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
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  shopMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  shopMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  shopMessageText: {
    color: '#333',
  },
  messageTimestamp: {
    fontSize: 11,
  },
  userMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  shopMessageTimestamp: {
    color: '#999',
    textAlign: 'left',
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
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
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
>>>>>>> 88981e373c144f654f005a65718cd99475f835bd
