import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import LoginNavigator from './src/navigation/LoginNavigator';
import { useState } from 'react';

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? <TabNavigator /> : <LoginNavigator setIsLoggedIn={setIsLoggedIn} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
