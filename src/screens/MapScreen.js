import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Icon name="map" size={60} color="#F9A825" />
      <Text style={styles.title}>Map</Text>
      <Text style={styles.subtitle}>Explore deals around you on the map</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
