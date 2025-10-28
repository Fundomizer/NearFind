import * as React from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';


const Tab = createBottomTabNavigator();

const homeTab = 'Home';
const searchTab = 'Search';
const mapTab = 'Map';
const chatTab = 'Chat';
const moreTab = 'More'

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={homeTab}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'grey',
          labelStyle: { paddingBottom: 10, fontSize: 10 },
          style: { padding: 10, height: 70 }
        }}>

        <Tab.Screen 
          name="Home" 
          options={{ tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} /> }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',   // 👈 Sticks it to the screen
    bottom: 0,              // 👈 Puts it at the bottom
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 5,           // shadow for Android
    shadowColor: '#000',    // shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 3,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#555', marginTop: 2 },
});
