import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import BusinessTabNavigator from './src/navigation/BusinessTabNavigator';
import LoginNavigator from './src/navigation/LoginNavigator';
import { onAuthChange, getUserData } from './src/services/authService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'customer' or 'business'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // User is logged in, fetch their role
        setLoading(true); // Keep loading while fetching role
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserRole(result.data.role);
        } else {
          // If user data doesn't exist, default to customer
          setUserRole('customer');
        }
        setIsLoggedIn(true);
        setLoading(false);
      } else {
        // User is logged out
        setIsLoggedIn(false);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading || (isLoggedIn && !userRole)) {
    // Show loading while checking auth or fetching user role
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!isLoggedIn ? (
          <LoginNavigator setIsLoggedIn={setIsLoggedIn} />
        ) : userRole === 'business' ? (
          <BusinessTabNavigator />
        ) : (
          <TabNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
