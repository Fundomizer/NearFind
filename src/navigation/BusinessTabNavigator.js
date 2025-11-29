import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';

// Import screens
import BusinessPlaceholderScreen from '../screens/BusinessPlaceholderScreen';
import BusinessChatScreen from '../screens/BusinessChatScreen';
import BusinessIndividualChatScreen from '../screens/BusinessIndividualChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BusinessStack() {
    return ( <
        Stack.Navigator screenOptions = {
            { headerShown: false } } >
        <
        Stack.Screen name = "BusinessHome"
        component = { BusinessPlaceholderScreen }
        /> <
        Stack.Screen name = "BusinessChatList"
        component = { BusinessChatScreen }
        /> <
        Stack.Screen name = "BusinessIndividualChat"
        component = { BusinessIndividualChatScreen }
        /> <
        /Stack.Navigator>
    );
}

export default function BusinessTabNavigator() {
    const insets = useSafeAreaInsets();
    return ( <
        Tab.Navigator screenOptions = {
            {
                headerShown: false,
                tabBarActiveTintColor: '#4CAF50',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#ddd',
                    backgroundColor: '#fff',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: -2 },
                    shadowRadius: 3,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }
        } >
        <
        Tab.Screen name = "Business"
        component = { BusinessStack }
        options = {
            {
                tabBarIcon: ({ color, size }) => ( <
                    Icon name = "storefront"
                    size = { size }
                    color = { color }
                    />
                ),
            }
        }
        /> <
        /Tab.Navigator>
    );
}