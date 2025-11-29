import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/SearchScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ReservationConfirmScreen from '../screens/ReservationConfirmScreen';
import ReservationsScreen from '../screens/ReservationsScreen';

const Stack = createNativeStackNavigator();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.reset({
            index: 0,
            routes: [{ name: 'SearchHome' }],
          });
        },
      })}
    >
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="ReservationConfirm" component={ReservationConfirmScreen} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} />
    </Stack.Navigator>
  );
}
