import React from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';

import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';

export default function HomeScreen() {

    const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Image
        source={require('../../assets/images/baguio-header.jpeg')}
        style={styles.headerImage}
      />
      <Image
        source={require('../../assets/nearfind-logo.png')}
        style={styles.logoImage}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Discover Good Deals{"\n"}Around the Corner</Text>

        <View style={styles.locationBox}>
          <Text style={styles.locationText}>Your location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.cityText}>Baguio, Philippines</Text>
            <TouchableOpacity style={styles.changeBtn}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Feature Buttons */}
      <View style={styles.featureRow}>
        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#3C8D40' } ]
      } onPress={() => navigation.navigate('Search')}>
          <Icon name="search-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#F9A825' }]}
        onPress={() => navigation.navigate('Map')}>
          <Icon name="map-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#F5F5F5' }]}
        onPress={() => navigation.navigate('Chat')}>
          <Icon name="chatbubbles-outline" size={22} color="#555" />
          <Text style={[styles.featureText, { color: '#555' }]}>AI Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Why Choose */}
      <Text style={styles.sectionTitle}>Why Choose NearFind?</Text>

      <View style={styles.card}>
        <Icon name="pricetag-outline" size={22} color="#4CAF50" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Best Local Prices</Text>
          <Text style={styles.cardDesc}>Compare prices and find the best deals nearby.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="leaf-outline" size={22} color="#FFB74D" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Reduce Food Waste</Text>
          <Text style={styles.cardDesc}>Time-limited discounts on fresh products.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="people-outline" size={22} color="#81C784" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Support Local</Text>
          <Text style={styles.cardDesc}>Help small businesses thrive.</Text>
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to discover local treasures?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands saving money and supporting their community.
        </Text>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Start Exploring Now</Text>
        </TouchableOpacity>
      </View>

      {/* Add padding at bottom for tab bar */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoImage: {
    position: 'absolute',   // 👈 makes it float on top
    top: '10%',              // 👈 moves it vertically (50% down)
    left: '38%',             // 👈 moves it horizontally (50% across)
    transform: [
      { translateX: -50 },   // 👈 centers perfectly
      { translateY: -50 },
    ],
    width: '50%',
    height: 200,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  overlay: {
    alignItems: 'center',
    padding: 16,
    marginTop: -100,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 16,
  },
  locationBox: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#777',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cityText: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
    color: '#444',
  },
  changeBtn: {
    padding: 4,
  },
  changeText: {
    color: '#4CAF50',
    fontSize: 13,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  featureButton: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  featureText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  ctaSection: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  ctaButtonText: {
    color: 'black',
    fontWeight: '600',
  },
});
