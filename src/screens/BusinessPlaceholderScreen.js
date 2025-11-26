import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { logOut } from '../services/authService';

export default function BusinessPlaceholderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [promoImages, setPromoImages] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          const result = await logOut();
          if (!result.success) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        }
      },
    ]);
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled) {
        setPromoImages([...promoImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleImagePress = (index) => {
    Alert.alert('Manage Image', 'What would you like to do with this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', onPress: async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });
            if (!result.canceled) {
              const updatedImages = [...promoImages];
              updatedImages[index] = result.assets[0].uri;
              setPromoImages(updatedImages);
            }
          } catch (error) {
            console.error('Error replacing image:', error);
            Alert.alert('Error', 'Failed to replace image. Please try again.');
          }
        }
      },
      { text: 'Remove', style: 'destructive', onPress: () => {
          const updatedImages = promoImages.filter((_, i) => i !== index);
          setPromoImages(updatedImages);
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#999" />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>School Promo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
            {promoImages.map((image, index) => (
              <TouchableOpacity key={index} style={styles.carouselItem} onPress={() => handleImagePress(index)}>
                <Image source={{ uri: image }} style={styles.carouselImage} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={handleImageUpload}>
              <Icon name="cloud-upload-outline" size={40} color="#999" />
              <Text style={styles.uploadText}>Upload Image</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('home')}>
          <Icon name={activeTab === 'home' ? 'home' : 'home-outline'} size={28} color={activeTab === 'home' ? '#4CAF50' : '#999'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('add')}>
          <View style={styles.addButton}>
            <Icon name="add" size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('chat')}>
          <Icon name={activeTab === 'chat' ? 'chatbubble' : 'chatbubble-outline'} size={28} color={activeTab === 'chat' ? '#4CAF50' : '#999'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  logoutButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12, height: 45 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', padding: 0 },
  filterButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10 },
  scrollContent: { flex: 1 },
  promoSection: { paddingVertical: 20, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 20, marginBottom: 15 },
  carousel: { paddingLeft: 20 },
  carouselContent: { paddingRight: 20, gap: 15 },
  carouselItem: { width: 280, height: 160, borderRadius: 12, overflow: 'hidden' },
  carouselImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPlaceholder: { width: 280, height: 160, borderRadius: 12, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  uploadText: { marginTop: 8, fontSize: 14, color: '#999', fontWeight: '600' },
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 5 },
  navButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
});