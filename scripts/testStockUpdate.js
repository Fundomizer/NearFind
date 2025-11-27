/**
 * Test Script: Manually update product stock to test real-time listeners
 *
 * This script updates a product's stock to 0 to verify that:
 * 1. The database update works
 * 2. The real-time listener in ProductDetailsScreen picks it up
 * 3. The UI updates accordingly
 *
 * To run: node scripts/testStockUpdate.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3H1AZ_LSi3zMocqWYr5I55hcxn04I03k",
  authDomain: "tecno-mvp.firebaseapp.com",
  projectId: "tecno-mvp",
  storageBucket: "tecno-mvp.firebasestorage.app",
  messagingSenderId: "548455483656",
  appId: "1:548455483656:web:c718dc96512b8cdb4004bd",
  measurementId: "G-XHYRZBT63L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testStockUpdate() {
  try {
    console.log("🧪 Testing stock update...\n");

    // Get all products
    const productsSnapshot = await getDocs(collection(db, 'products'));

    if (productsSnapshot.empty) {
      console.log("❌ No products found in database");
      return;
    }

    // Pick the first product
    const firstProduct = productsSnapshot.docs[0];
    const productData = firstProduct.data();

    console.log("📦 Selected Product:");
    console.log(`   Name: ${productData.name}`);
    console.log(`   Shop: ${productData.shopName}`);
    console.log(`   Current Stock: ${productData.stockQuantity}`);
    console.log(`   Product ID: ${firstProduct.id}\n`);

    // Update stock to 0
    console.log("🔄 Updating stock to 0...");
    const productRef = doc(db, 'products', firstProduct.id);
    await updateDoc(productRef, {
      stockQuantity: 0,
      inStock: false
    });

    console.log("✅ Stock updated to 0\n");
    console.log("📱 Now check your app:");
    console.log("   1. If you're viewing this product, the UI should update immediately");
    console.log("   2. Stock should show 'Out of Stock'");
    console.log("   3. Reserve button should be grayed out\n");

    // Wait 5 seconds then restore stock
    console.log("⏳ Waiting 5 seconds before restoring stock...\n");
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("🔄 Restoring stock...");
    await updateDoc(productRef, {
      stockQuantity: productData.stockQuantity,
      inStock: true
    });

    console.log("✅ Stock restored to original value\n");
    console.log("📱 The UI should update again showing the product is back in stock\n");
    console.log("✨ Test completed!");

  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

// Run the test
testStockUpdate();
