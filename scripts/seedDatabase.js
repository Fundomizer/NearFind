/**
 * Database Seeding Script for NearFind
 * Run this once to populate Firestore with sample products and shops
 *
 * To run: node scripts/seedDatabase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration (same as your app)
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

// Sample shops in Baguio
const shops = [
  {
    name: "Good Shepherd Convent",
    address: "Session Road, Baguio City",
    latitude: 16.4123,
    longitude: 120.5960,
    phone: "+63 74 442 2979",
    hours: "8:00 AM - 5:00 PM",
    rating: 4.8,
    tags: ["Local Products", "Pasalubong", "Bakery"],
    description: "Famous for Ube Jam and local delicacies"
  },
  {
    name: "Baguio School Supplies",
    address: "Harrison Road, Baguio City",
    latitude: 16.4089,
    longitude: 120.5950,
    phone: "+63 74 442 1234",
    hours: "9:00 AM - 6:00 PM",
    rating: 4.5,
    tags: ["School Supplies", "Office Supplies"],
    description: "Complete school and office supplies"
  }
];

// Sample products
const products = [
  // Good Shepherd Products
  {
    name: "Ube Jam (450g)",
    shopName: "Good Shepherd Convent",
    price: 199,
    originalPrice: 250,
    discount: 20,
    category: "Food",
    description: "Premium purple yam jam made from local ube. Perfect for bread, desserts, or as a gift.",
    inStock: true,
    stockQuantity: 5,
    imageUrl: "ube_jam.jpg"
  },
  {
    name: "Lengua de Gato Cookies",
    shopName: "Good Shepherd Convent",
    price: 180,
    originalPrice: 220,
    discount: 18,
    category: "Food",
    description: "Crispy buttery cookies, a Baguio favorite pasalubong.",
    inStock: true,
    stockQuantity: 3,
    imageUrl: "lengua.jpg"
  },
  {
    name: "Organic Peanut Butter (500g)",
    shopName: "Good Shepherd Convent",
    price: 149,
    originalPrice: null,
    discount: null,
    category: "Food",
    description: "Locally made organic peanut butter. No added sugar.",
    inStock: true,
    stockQuantity: 8,
    imageUrl: "peanut_butter.jpg"
  },

  // School Supplies
  {
    name: "School Supply Kit (Complete)",
    shopName: "Baguio School Supplies",
    price: 599,
    originalPrice: 750,
    discount: 20,
    category: "School Supplies",
    description: "Complete set: notebooks, pens, pencils, ruler, eraser, sharpener, and folder.",
    inStock: true,
    stockQuantity: 10,
    imageUrl: "school_supplies.jpg"
  },
  {
    name: "Pure Baguio Honey (500ml)",
    shopName: "Baguio School Supplies",
    price: 350,
    originalPrice: null,
    discount: null,
    category: "Food",
    description: "100% pure honey from local bee farms. Raw and unprocessed.",
    inStock: true,
    stockQuantity: 7,
    imageUrl: "honey.jpg"
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Check if data already exists and delete it
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    if (!shopsSnapshot.empty) {
      console.log("🗑️  Deleting existing shops...");
      for (const shopDoc of shopsSnapshot.docs) {
        await deleteDoc(doc(db, 'shops', shopDoc.id));
      }
      console.log(`   ✅ Deleted ${shopsSnapshot.size} shops\n`);
    }

    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (!productsSnapshot.empty) {
      console.log("🗑️  Deleting existing products...");
      for (const productDoc of productsSnapshot.docs) {
        await deleteDoc(doc(db, 'products', productDoc.id));
      }
      console.log(`   ✅ Deleted ${productsSnapshot.size} products\n`);
    }

    // Seed shops
    console.log("📍 Seeding shops...");
    const shopIds = {};
    for (const shop of shops) {
      const docRef = await addDoc(collection(db, 'shops'), {
        ...shop,
        createdAt: new Date().toISOString()
      });
      shopIds[shop.name] = docRef.id;
      console.log(`   ✅ Added: ${shop.name}`);
    }

    // Seed products with shop references
    console.log("\n📦 Seeding products...");
    for (const product of products) {
      // Find the shop's coordinates
      const shop = shops.find(s => s.name === product.shopName);

      await addDoc(collection(db, 'products'), {
        ...product,
        shopId: shopIds[product.shopName],
        latitude: shop.latitude,
        longitude: shop.longitude,
        shopHours: shop.hours,
        createdAt: new Date().toISOString()
      });
      console.log(`   ✅ Added: ${product.name} (${product.shopName})`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log(`   📊 Total shops: ${shops.length}`);
    console.log(`   📊 Total products: ${products.length}`);
    console.log("\n✨ Your NearFind app now has real data!\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seeding
seedDatabase();
