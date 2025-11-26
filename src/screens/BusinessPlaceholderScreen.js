import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { logOut } from '../services/authService';

export default function BusinessPlaceholderScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = async() => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?', [{
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async() => {
                        const result = await logOut();
                        if (!result.success) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return ( <
        View style = { styles.container } > { /* Header */ } <
        View style = { styles.header } >
        <
        Text style = { styles.headerTitle } > Business Dashboard < /Text> <
        TouchableOpacity onPress = { handleLogout }
        style = { styles.logoutButton } >
        <
        Icon name = "log-out-outline"
        size = { 24 }
        color = "#333" / >
        <
        /TouchableOpacity> <
        /View>

        { /* Search Bar */ } <
        View style = { styles.searchContainer } >
        <
        View style = { styles.searchInputWrapper } >
        <
        Icon name = "search-outline"
        size = { 20 }
        color = "#999"
        style = { styles.searchIcon }
        /> <
        TextInput style = { styles.searchInput }
        placeholder = "Search..."
        value = { searchQuery }
        onChangeText = { setSearchQuery }
        placeholderTextColor = "#999" /
        >
        <
        /View> <
        TouchableOpacity style = { styles.filterButton } >
        <
        Icon name = "filter-outline"
        size = { 24 }
        color = "#333" / >
        <
        /TouchableOpacity> <
        /View>

        { /* Content */ } <
        View style = { styles.content } >
        <
        Icon name = "storefront"
        size = { 80 }
        color = "#4CAF50" / >
        <
        Text style = { styles.title } > Business UI Placeholder < /Text> <
        Text style = { styles.subtitle } >
        The business owner interface is coming soon. <
        /Text> <
        Text style = { styles.description } >
        This area will contain features
        for managing your business, products, orders, and customer interactions. <
        /Text> <
        /View> <
        /View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    logoutButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        padding: 0,
    },
    filterButton: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 20,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
    },
});