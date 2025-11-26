import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';

// Import screens
import BusinessPlaceholderScreen from '../screens/BusinessPlaceholderScreen';

const Tab = createBottomTabNavigator();

export default function BusinessTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
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
      }}
    >
      <Tab.Screen
        name="Business"
        component={BusinessPlaceholderScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="storefront" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
