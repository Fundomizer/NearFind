import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BusinessChatScreen from '../screens/BusinessChatScreen';
import BusinessIndividualChatScreen from '../screens/BusinessIndividualChatScreen';

const Stack = createNativeStackNavigator();

export default function BusinessChatStackNavigator({ onGoBack }) {
<<<<<<< HEAD
    return ( <
        Stack.Navigator initialRouteName = "BusinessChatList"
        screenOptions = {
            {
                headerShown: false,
            }
        } >
        <
        Stack.Screen name = "BusinessChatList"
        component = { BusinessChatScreen }
        /> <
        Stack.Screen name = "BusinessIndividualChat"
        component = { BusinessIndividualChatScreen }
        /> <
        /Stack.Navigator>
    );
}
=======
    return (
        <Stack.Navigator
            initialRouteName="BusinessChatList"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="BusinessChatList"
                component={BusinessChatScreen}
                initialParams={{ onGoBack }}
            />
            <Stack.Screen
                name="BusinessIndividualChat"
                component={BusinessIndividualChatScreen}
            />
        </Stack.Navigator>
    );
}
>>>>>>> 9a6a42617bdac0ff2cfa8ef70d80ee80cba2227c
