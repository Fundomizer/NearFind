import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { addProduct, updateProduct } from '../services/businessService';

export default function AddProductScreen({ onBack, onSaveProduct, editProduct }) {
  const [productImage, setProductImage] = useState(editProduct?.image || editProduct?.imageUrl || null);
  const [label, setLabel] = useState(editProduct?.label || editProduct?.name || '');
  const [originalPrice, setOriginalPrice] = useState(editProduct?.originalPrice?.toString() || '');
  const [discountedPrice, setDiscountedPrice] = useState(editProduct?.discountedPrice?.toString() || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [status, setStatus] = useState(editProduct?.status || 'available');
  const [tags, setTags] = useState(editProduct?.tags?.join(', ') || '');
  const [quantity, setQuantity] = useState(editProduct?.quantity?.toString() || editProduct?.stockQuantity?.toString() || '0');
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleSaveProduct = async () => {
    if (!productImage || !label || !originalPrice) {
      Alert.alert('Missing Information', 'Please fill in at least product image, label, and original price.');
      return;
    }

    setSaving(true);

    const productData = {
      image: productImage,
      label,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      description,
      status,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      quantity: parseInt(quantity) || 0,
    };

    try {
      let result;
      if (editProduct && editProduct.id) {
        // Update existing product
        result = await updateProduct(editProduct.id, productData);
      } else {
        // Add new product
        result = await addProduct(productData);
      }

      setSaving(false);

      if (result.success) {
        Alert.alert('Success', `Product ${editProduct ? 'updated' : 'added'} successfully!`, [
          { text: 'OK', onPress: () => onBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to save product. Please try again.');
      }
    } catch (error) {
      setSaving(false);
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    }
  };

  const statusOptions = ['available', 'out of stock', 'pre-order'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editProduct ? 'Edit Product' : 'Add Product'}</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImageUpload}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera-outline" size={48} color="#999" />
              <Text style={styles.imagePlaceholderText}>Add Product Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.formSection}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput style={styles.input} placeholder="Enter product name" value={label} onChangeText={setLabel} placeholderTextColor="#999" />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Original Price</Text>
          <TextInput style={styles.input} placeholder="0.00" value={originalPrice} onChangeText={setOriginalPrice} keyboardType="numeric" placeholderTextColor="#999" />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Discounted Price (Optional)</Text>
          <TextInput style={styles.input} placeholder="0.00" value={discountedPrice} onChangeText={setDiscountedPrice} keyboardType="numeric" placeholderTextColor="#999" />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Available Quantity</Text>
          <TextInput style={styles.input} placeholder="0" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholderTextColor="#999" />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Enter product description" value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" placeholderTextColor="#999" />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {statusOptions.map((option) => (
              <TouchableOpacity key={option} style={[styles.statusButton, status === option && styles.statusButtonActive]} onPress={() => setStatus(option)}>
                <Text style={[styles.statusButtonText, status === option && styles.statusButtonTextActive]}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput style={styles.input} placeholder="e.g. snacks, drinks, supplies" value={tags} onChangeText={setTags} placeholderTextColor="#999" />
        </View>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveProduct}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{editProduct ? 'Update Product' : 'Save Product'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  placeholder: { width: 40 },
  scrollContent: { flex: 1 },
  scrollContentContainer: { padding: 20 },
  imageUploadContainer: { width: '100%', aspectRatio: 1, marginBottom: 24 },
  productImage: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { marginTop: 12, fontSize: 16, color: '#999', fontWeight: '600' },
  formSection: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { height: 100, paddingTop: 12 },
  statusContainer: { flexDirection: 'row', gap: 10 },
  statusButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  statusButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  statusButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  statusButtonTextActive: { color: '#fff' },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, marginBottom: 40 },
  saveButtonDisabled: { backgroundColor: '#999' },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});