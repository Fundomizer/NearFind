import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketScreen from '../screens/MarketScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ReservationConfirmScreen from '../screens/ReservationConfirmScreen';
import ReservationsScreen from '../screens/ReservationsScreen';

const Stack = createNativeStackNavigator();

export default function MarketStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MarketHome" component={MarketScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="ReservationConfirm" component={ReservationConfirmScreen} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} />
    </Stack.Navigator>
  );
}
