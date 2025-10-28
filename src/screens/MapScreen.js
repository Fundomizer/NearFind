import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function MapScreen() {
  const [isOffline, setIsOffline] = useState(false);

  // Random marker positions (percentage from top and left)
  const markers = [
    { id: 1, top: '25%', left: '30%' },
    { id: 2, top: '40%', left: '60%' },
    { id: 3, top: '55%', left: '20%' },
    { id: 5, top: '65%', left: '50%' },
    { id: 6, top: '50%', left: '40%' },
  ];

  const handleRecenter = () => {
    console.log('Recenter map');
  };

  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
  };

  const handleMarkerPress = (markerId) => {
    console.log('Marker pressed:', markerId);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/map-placeholder.jpg')}
        style={styles.mapImage}
        resizeMode="cover"
      />

      {/* Markers */}
      {markers.map((marker) => (
        <TouchableOpacity
          key={marker.id}
          style={[styles.marker, { top: marker.top, left: marker.left }]}
          onPress={() => handleMarkerPress(marker.id)}
        >
          {marker.id === 6 ? (
            <>
              <View style={styles.highlightRing} />
              <Icon name="location" size={40} color="#F9A825" />
            </>
          ) : (
            <Icon name="location" size={40} color="#4CAF50" />
          )}
        </TouchableOpacity>
      ))}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.button} onPress={handleRecenter}>
          <Icon name="locate" size={20} color="#fff" />
          <Text style={styles.buttonText}>Recenter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isOffline && styles.offlineButton]}
          onPress={toggleOfflineMode}
        >
          <Icon name={isOffline ? "cloud-offline" : "cloud-done"} size={20} color="#fff" />
          <Text style={styles.buttonText}>{isOffline ? 'Offline' : 'Online'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Bar - Product Preview */}
      <View style={styles.bottomBar}>
        <View style={styles.productBox}>
          <Image
            source={require('../../assets/images/products/sour dough bread.jpg')}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.shopName}>Artisan Bakery</Text>
          <View style={styles.detailsRow}>
            <View style={styles.distanceContainer}>
              <Icon name="location-outline" size={14} color="#666" />
              <Text style={styles.distanceText}>0.8 km</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#F9A825" />
              <Text style={styles.ratingText}>4.6</Text>
            </View>
          </View>
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Bread & Pastries</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Coffee</Text>
            </View>
          </View>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.viewShopButton}>
              <Text style={styles.viewShopButtonText}>View Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goButton}>
              <Icon name="navigate" size={18} color="#fff" />
              <Text style={styles.goButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  offlineButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(249, 168, 37, 0.3)',
    borderWidth: 2,
    borderColor: '#F9A825',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 15,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  productBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  viewShopButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewShopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  goButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
