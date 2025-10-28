import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Icon name="person" size={60} color="#7E57C2" />
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Profile, settings, and more options</Text>
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
