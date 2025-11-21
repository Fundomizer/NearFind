import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hi! I'm your NearFind AI assistant. I can help you find local products, compare prices, and discover the best deals near you. What are you looking for today?",
    },
  ]);

  const suggestions = [
    "Where can I buy cheap bread nearby?",
    "Show me bakery discounts today",
    "Find fresh vegetables under ₱100",
    "Coffee shops within 1km",
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setShowSuggestions(false); // hide suggestions after sending
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "ai" ? styles.aiMessage : styles.userMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "ai" ? styles.aiText : styles.userText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="sparkles" size={20} color="#fff" />
        <Text style={styles.headerText}>AI Assistant</Text>
      </View>

      {/* Main content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // adjusts distance from top
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatArea}
        />

        {showSuggestions && (
          <View style={styles.suggestions}>
            <Text style={styles.tryText}>Try asking:</Text>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionButton}
                onPress={() => handleSend(s)}
              >
                <Icon name="flash-outline" size={16} color="#3A6E3A" />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input always visible */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Where can I buy cheap bread nearby?"
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend(input)}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A6E3A",
    padding: 15,
    paddingTop: Platform.OS === "android" ? 40 : 20, // avoids overlap with status bar
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  chatArea: {
    padding: 16,
    paddingBottom: 80, // space for input
  },
  messageContainer: {
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    maxWidth: "85%",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF3EB",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#CFE5CF",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  aiText: { color: "#2E402E" },
  userText: { color: "#1B2B1B" },
  suggestions: {
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tryText: {
    color: "#888",
    fontSize: 13,
    marginBottom: 6,
  },
  suggestionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionText: {
    color: "#3A6E3A",
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2ED",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#3A6E3A",
    borderRadius: 50,
    padding: 10,
  },
});
