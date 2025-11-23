import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Tab = createNativeStackNavigator();

export default function LoginNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
            <Tab.Screen name="Login" component={LoginScreen}></Tab.Screen>
            <Tab.Screen name="Signup" component={SignupScreen}></Tab.Screen>
        </Tab.Navigator>
    )
}