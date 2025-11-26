import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity, Text, Alert, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';

export default function HomeScreen() {

    const navigation = useNavigation();
    const [currentLocation, setCurrentLocation] = useState('Baguio, Philippines');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [tempLocation, setTempLocation] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Get user's actual location on mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setIsLoadingLocation(true);
                const location = await Location.getCurrentPositionAsync({});

                // Reverse geocode to get neighborhood/street name
                const [geocode] = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (geocode) {
                    // Build location string with neighborhood details
                    const parts = [];

                    // Add street/neighborhood (most specific)
                    if (geocode.street) {
                        parts.push(geocode.street);
                    } else if (geocode.name) {
                        parts.push(geocode.name);
                    } else if (geocode.district) {
                        parts.push(geocode.district);
                    } else if (geocode.subregion) {
                        parts.push(geocode.subregion);
                    }

                    // Add city
                    if (geocode.city) {
                        parts.push(geocode.city);
                    } else if (geocode.region) {
                        parts.push(geocode.region);
                    }

                    // Format: "Session Road, Baguio City" or "Downtown, Manila"
                    const locationString = parts.length > 0
                        ? parts.join(', ')
                        : 'Location detected';

                    setCurrentLocation(locationString);
                }
                setIsLoadingLocation(false);
            }
        } catch (error) {
            console.log('Location error:', error);
            setIsLoadingLocation(false);
        }
    };

    const handleChangeLocation = () => {
        setTempLocation(currentLocation);
        setShowLocationModal(true);
    };

    const handleSaveLocation = () => {
        if (tempLocation.trim()) {
            setCurrentLocation(tempLocation);
            setShowLocationModal(false);
            Alert.alert('Location Updated', `Your location has been set to ${tempLocation}`);
        } else {
            Alert.alert('Error', 'Please enter a valid location');
        }
    };

    const handleUseCurrentLocation = async () => {
        setShowLocationModal(false);
        await getCurrentLocation();
    };

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
            <Text style={styles.cityText}>
              {isLoadingLocation ? 'Getting location...' : currentLocation}
            </Text>
            <TouchableOpacity style={styles.changeBtn} onPress={handleChangeLocation}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Feature Buttons */}
      <View style={styles.featureRow}>
        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#3C8D40' } ]
      } onPress={() => navigation.navigate('Market')}>
          <Icon name="basket-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.featureButton, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('Reservations')}>
          <Icon name="calendar-outline" size={22} color="#fff" />
          <Text style={styles.featureText}>Reservations</Text>
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

      {/* Location Change Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Enter your city</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Manila, Philippines"
              value={tempLocation}
              onChangeText={setTempLocation}
              autoFocus={true}
            />

            <TouchableOpacity
              style={styles.useLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Icon name="location" size={20} color="#4CAF50" />
              <Text style={styles.useLocationText}>Use My Current Location</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveLocation}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  useLocationText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
