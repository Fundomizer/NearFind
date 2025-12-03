import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/Ionicons';

// Import screens
import BusinessDashboardScreen from '../screens/BusinessDashboardScreen';
import BusinessChatScreen from '../screens/BusinessChatScreen';
import BusinessIndividualChatScreen from '../screens/BusinessIndividualChatScreen';
import BusinessReservationsScreen from '../screens/BusinessReservationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create a stack navigator for business screens
function BusinessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessHome" component={BusinessDashboardScreen} />
      <Stack.Screen name="BusinessReservations" component={BusinessReservationsScreen} />
      <Stack.Screen name="BusinessChatList" component={BusinessChatScreen} />
      <Stack.Screen name="BusinessIndividualChat" component={BusinessIndividualChatScreen} />
    </Stack.Navigator>
  );
}

export default function BusinessTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen
        name="Business"
        component={BusinessStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="storefront" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
