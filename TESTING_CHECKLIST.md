# 🧪 TechnoMVP Complete Testing Checklist

## Overview
This guide walks you through a complete transaction flow that tests ALL features of your app. Follow these steps in order to ensure everything works correctly.

---

## 📱 Prerequisites

### Setup Requirements
- [ ] Clear Metro cache: `npx expo start -c`
- [ ] Have 2 test accounts ready:
  - Business account email: `business@test.com`
  - Customer account email: `customer@test.com`
- [ ] Have 2-3 product images ready on your phone
- [ ] Enable location permissions when prompted
- [ ] Stable internet connection for Firebase

---

## 🏢 PART 1: Business Side Testing (30 minutes)

### 1.1 Authentication & Signup ✅
**Test:** Create new business account
- [ ] Open app → Tap "Sign Up"
- [ ] Enter email: `business@test.com`
- [ ] Enter password: `Test1234!`
- [ ] Select role: **"Business"**
- [ ] Tap "Sign Up"
- [ ] **Expected:** Redirected to Business Dashboard
- [ ] **Check:** No errors in console

**Screenshot Location:** Business Dashboard main screen

---

### 1.2 Business Profile Setup ✅
**Test:** Configure business profile
- [ ] Tap on logo/business name (top left)
- [ ] Select **"Change Company Name"**
- [ ] Enter: `Joe's Campus Store`
- [ ] Tap "Save"
- [ ] **Expected:** Company name updates in header

**Test:** Set business location
- [ ] Tap logo again
- [ ] Select **"Pin my location"**
- [ ] Grant location permission if prompted
- [ ] **Expected:** Maps app opens showing current location
- [ ] **Expected:** Location saved to profile
- [ ] **Check Console:** Look for latitude/longitude values

**Test:** Upload business logo
- [ ] Tap logo again
- [ ] Select **"Change Logo"**
- [ ] Choose an image from gallery
- [ ] **Expected:** Logo updates in header
- [ ] **Check Console:** Should see "Image uploaded successfully" with Firebase URL

**Screenshot Location:** Updated business profile

---

### 1.3 Product Management ✅

#### Add Product #1 (Food with Discount)
- [ ] Tap the **"+"** button (center bottom)
- [ ] Tap product image placeholder
- [ ] Select image from gallery
- [ ] **Check Console:** Should see upload progress
- [ ] Fill in product details:
  - **Product Name:** `Chicken Sandwich`
  - **Category:** `Food`
  - **Original Price:** `120`
  - **Discounted Price:** `99`
  - **Available Quantity:** `15`
  - **Description:** `Fresh grilled chicken with lettuce and tomato`
  - **Status:** `available`
  - **Tags:** `lunch, chicken, sandwich`
- [ ] Tap **"Save Product"**
- [ ] **Expected:** "Product added successfully" alert
- [ ] **Expected:** Returns to dashboard
- [ ] **Expected:** Product appears in product list
- [ ] **Check Console:** Product verified in Firestore

**Screenshot Location:** Product #1 in dashboard

#### Add Product #2 (School Supplies)
- [ ] Tap **"+"** button again
- [ ] Upload different image
- [ ] Fill in details:
  - **Product Name:** `Spiral Notebook Set`
  - **Category:** `School Supplies`
  - **Original Price:** `150`
  - **Discounted Price:** (leave empty)
  - **Available Quantity:** `25`
  - **Description:** `5 subject notebooks, college ruled`
  - **Status:** `available`
  - **Tags:** `notebooks, school, supplies`
- [ ] Tap **"Save Product"**
- [ ] **Expected:** Product #2 appears in dashboard

#### Add Product #3 (Pre-order Item)
- [ ] Tap **"+"** button
- [ ] Upload image
- [ ] Fill in details:
  - **Product Name:** `Limited Edition Hoodie`
  - **Category:** `School Supplies`
  - **Original Price:** `899`
  - **Discounted Price:** `799`
  - **Available Quantity:** `5`
  - **Description:** `Campus exclusive hoodie - arriving next week`
  - **Status:** `pre-order`
  - **Tags:** `clothing, hoodie, limited`
- [ ] Tap **"Save Product"**

**Test:** Edit a product
- [ ] Tap on "Chicken Sandwich" product card
- [ ] Select **"Edit"**
- [ ] Change quantity to `10`
- [ ] Change discounted price to `89`
- [ ] Tap **"Update Product"**
- [ ] **Expected:** "Product updated successfully" alert
- [ ] **Expected:** Updated price shows in dashboard

**Test:** View product details
- [ ] Tap on any product card
- [ ] Select **"View Details"**
- [ ] **Expected:** Alert shows product info with price, quantity, status, description

**Screenshot Location:** Dashboard with all 3 products

---

### 1.4 Business Chat ✅
**Test:** Open chat interface
- [ ] Tap **Chat** icon (bottom right)
- [ ] **Expected:** BusinessChatScreen opens
- [ ] **Expected:** Shows "No messages yet" or existing conversations
- [ ] **Note:** Will receive messages after customer contacts you

**Screenshot Location:** Business chat screen

---

### 1.5 Logout ✅
- [ ] Tap **logout icon** (top right)
- [ ] Select **"Logout"**
- [ ] **Expected:** Redirected to login screen

---

## 👤 PART 2: Customer Side Testing (40 minutes)

### 2.1 Authentication ✅
**Test:** Create customer account
- [ ] Tap "Sign Up"
- [ ] Enter email: `customer@test.com`
- [ ] Enter password: `Test1234!`
- [ ] Select role: **"Customer"**
- [ ] Tap "Sign Up"
- [ ] **Expected:** Redirected to Home Screen
- [ ] **Expected:** Bottom navigation shows: Home, Market, Reservations, Chat, Account

---

### 2.2 Home Screen Features ✅
**Test:** View featured products
- [ ] **Expected:** Home screen loads with products
- [ ] **Check Console:** Should see "HomeScreen: Loaded X products from Firestore"
- [ ] **Expected:** "Hot Deals" section shows products with discounts
- [ ] **Expected:** Products display with images from Firebase Storage
- [ ] **Check:** Images load correctly (not placeholder icons)

**Test:** Favorites section
- [ ] Scroll to "My Favorites" section
- [ ] **Expected:** Shows "No favorites yet" or existing favorites

**Test:** Product interaction from home
- [ ] Tap on "Chicken Sandwich" card in Hot Deals
- [ ] **Expected:** Navigate to Product Details screen

**Screenshot Location:** Home screen with Hot Deals

---

### 2.3 Product Details Screen ✅
**Test:** View product details
- [ ] **Check:** Product image displays (Firebase Storage URL)
- [ ] **Check:** Product name: "Chicken Sandwich"
- [ ] **Check:** Discounted price: ₱89
- [ ] **Check:** Original price strikethrough: ₱120
- [ ] **Check:** Discount badge: "-26%"
- [ ] **Check:** Shop name: "Joe's Campus Store"
- [ ] **Check:** Distance shows (or "Location unavailable")
- [ ] **Check:** Shop hours: "9:00 AM - 6:00 PM"
- [ ] **Check:** Description visible
- [ ] **Check:** Tags displayed

**Test:** Open shop location
- [ ] Tap **"Open in Maps"** button
- [ ] **Expected:** Maps app opens with shop location
- [ ] Go back to app

**Test:** Reserve product
- [ ] Tap **"Reserve Now"** button
- [ ] **Expected:** Navigate to Reservation Confirm screen

**Screenshot Location:** Product Details screen

---

### 2.4 Reservation Process ✅
**Test:** Create reservation
- [ ] On Reservation Confirm screen:
  - [ ] **Check:** Product name and image display
  - [ ] **Check:** Price shown: ₱89
  - [ ] Set **Quantity:** `2`
  - [ ] Set **Pickup Date:** Tomorrow's date
  - [ ] Set **Pickup Time:** `2:00 PM`
  - [ ] Enter **Customer Name:** `John Doe`
  - [ ] Enter **Contact Number:** `09123456789`
  - [ ] (Optional) Enter **Notes:** `Please pack separately`
- [ ] Tap **"Confirm Reservation"**
- [ ] **Expected:** "Reservation successful" alert
- [ ] **Expected:** Navigate back to Market/Home
- [ ] **Check Console:** Reservation saved to Firestore

**Screenshot Location:** Reservation confirmation

---

### 2.5 Market Tab - Search & Filter ✅
**Test:** Navigate to Market
- [ ] Tap **"Market"** tab (bottom nav)
- [ ] **Expected:** MarketScreen loads
- [ ] **Expected:** Shows "X products found"
- [ ] **Expected:** All 3 products visible

**Test:** Search functionality
- [ ] Tap search bar
- [ ] Type: `chicken`
- [ ] **Expected:** Only "Chicken Sandwich" shows
- [ ] Clear search
- [ ] Type: `notebook`
- [ ] **Expected:** Only "Spiral Notebook Set" shows
- [ ] Clear search

**Test:** View toggle
- [ ] Tap **"Shops"** toggle (top right)
- [ ] **Expected:** View changes to shop list
- [ ] **Expected:** Shows "Joe's Campus Store" with product count
- [ ] Tap **"Products"** toggle
- [ ] **Expected:** Back to product grid view

**Test:** Filters
- [ ] Tap **filter icon** (top right)
- [ ] **Expected:** Filter modal opens

**Filter by Category:**
- [ ] Select **"Food"**
- [ ] Tap **"Apply Filters"**
- [ ] **Expected:** Only food products show
- [ ] Open filters again, select **"All"**

**Filter by Distance:**
- [ ] In filter modal, adjust **Max Distance** slider
- [ ] Set to `5 km`
- [ ] Tap **"Apply Filters"**
- [ ] **Expected:** Products filtered by distance
- [ ] **Note:** If business location is set, products should show actual distance

**Filter by Discount:**
- [ ] Open filters
- [ ] Set **Min Discount:** `10%`
- [ ] Tap **"Apply Filters"**
- [ ] **Expected:** Only discounted products show

**Sort by Price:**
- [ ] Open filters
- [ ] Select **"Price: Low to High"**
- [ ] Tap **"Apply Filters"**
- [ ] **Expected:** Products sorted by price ascending

**Sort by Discount:**
- [ ] Open filters
- [ ] Select **"Best Deals"**
- [ ] Tap **"Apply Filters"**
- [ ] **Expected:** Products with highest discounts first

**Reset Filters:**
- [ ] Open filters
- [ ] Tap **"Reset"** button
- [ ] **Expected:** All filters cleared
- [ ] **Expected:** Sort returns to "Nearest First"
- [ ] **Expected:** All products visible again

**Screenshot Location:** Market screen with filters applied

---

### 2.6 Favorites System ✅
**Test:** Add to favorites
- [ ] Tap **heart icon** on "Chicken Sandwich" product card
- [ ] **Expected:** Heart fills with red color
- [ ] **Check Console:** "Added to favorites" or similar
- [ ] Add "Spiral Notebook Set" to favorites
- [ ] Add "Limited Edition Hoodie" to favorites

**Test:** View favorites
- [ ] Go to **Home** tab
- [ ] Scroll to **"My Favorites"** section
- [ ] **Expected:** All 3 favorited products show
- [ ] Tap on a favorite product
- [ ] **Expected:** Navigate to Product Details

**Test:** Remove from favorites
- [ ] In Product Details, tap **heart icon**
- [ ] **Expected:** Heart outline (unfilled)
- [ ] Go back to Home
- [ ] **Expected:** Product removed from favorites section

**Screenshot Location:** Favorites section with products

---

### 2.7 Reservations Screen ✅
**Test:** View reservations list
- [ ] Tap **"Reservations"** tab (bottom nav)
- [ ] **Expected:** Shows your reservation for "Chicken Sandwich"
- [ ] **Check:** Reservation details:
  - Product name and image
  - Quantity: 2
  - Total: ₱178
  - Pickup date and time
  - Status: "pending"
  - Shop name

**Test:** Reservation actions
- [ ] Tap on the reservation card
- [ ] **Expected:** Can view full details
- [ ] **Check:** Contact shop button present
- [ ] **Check:** Cancel option available (if status is pending)

**Screenshot Location:** Reservations list

---

### 2.8 Chat with Business ✅
**Test:** Contact shop about product
- [ ] Go to **Product Details** screen (any product)
- [ ] Tap **"Contact Shop"** button
- [ ] **Expected:** Navigate to IndividualChatScreen
- [ ] **Expected:** Chat header shows "Joe's Campus Store"
- [ ] Type message: `Hi, is the chicken sandwich still available?`
- [ ] Tap **Send** button
- [ ] **Expected:** Message appears in chat
- [ ] **Check Console:** Message saved to Firestore

**Test:** View chat list
- [ ] Go to **Chat** tab (bottom nav)
- [ ] **Expected:** Shows conversation with "Joe's Campus Store"
- [ ] **Expected:** Shows last message preview
- [ ] Tap on conversation
- [ ] **Expected:** Opens IndividualChatScreen

**Screenshot Location:** Chat conversation

---

### 2.9 Account Screen ✅
**Test:** View account details
- [ ] Tap **"Account"** tab (bottom nav)
- [ ] **Expected:** AccountScreen loads
- [ ] **Check:** Shows user email
- [ ] **Check:** Shows account type: "Customer"

**Test:** Account features
- [ ] Explore available options:
  - [ ] Profile settings
  - [ ] Preferences
  - [ ] Help/Support
  - [ ] Terms & Privacy
  - [ ] Logout button

**Test:** Logout
- [ ] Tap **"Logout"**
- [ ] **Expected:** Redirected to login screen

**Screenshot Location:** Account screen

---

## 🔄 PART 3: Business Response Testing (15 minutes)

### 3.1 Login as Business ✅
- [ ] Login with: `business@test.com`
- [ ] **Expected:** Redirected to Business Dashboard

### 3.2 View Reservation (if implemented) ✅
- [ ] Check if there's a reservations/orders section
- [ ] **Expected:** See reservation from customer
- [ ] **Check:** Customer details visible
- [ ] **Note:** This depends on if you implemented business reservation viewing

### 3.3 Respond to Chat ✅
- [ ] Tap **Chat** icon (bottom nav)
- [ ] **Expected:** See conversation with customer
- [ ] Tap on conversation
- [ ] **Expected:** See customer's message
- [ ] Reply: `Yes, we have 10 left! You can pick up anytime today.`
- [ ] **Expected:** Message sent successfully

**Screenshot Location:** Business chat response

---

## 🔍 PART 4: Real-time Updates Testing (10 minutes)

### 4.1 Test Real-time Product Updates ✅
**Setup:** Keep customer account open on one device/browser

**Test:**
- [ ] On business account: Edit "Chicken Sandwich" price to `79`
- [ ] **Expected:** Customer's screen updates automatically
- [ ] **Check:** Price changes without refresh

### 4.2 Test Real-time Chat ✅
**Setup:** Have both accounts open (customer and business)

**Test:**
- [ ] Send message from customer
- [ ] **Expected:** Business sees message instantly
- [ ] Reply from business
- [ ] **Expected:** Customer sees reply instantly

### 4.3 Test Real-time Favorites ✅
- [ ] On customer: Add product to favorites
- [ ] Go to Home tab
- [ ] **Expected:** Favorites section updates immediately

---

## 📊 PART 5: Edge Cases & Error Handling (15 minutes)

### 5.1 Empty States ✅
- [ ] **New account:** Check if empty states show properly
  - [ ] No favorites → Shows "No favorites yet"
  - [ ] No reservations → Shows "No reservations"
  - [ ] No messages → Shows "No messages yet"

### 5.2 Out of Stock Product ✅
- [ ] As business: Edit a product
- [ ] Set **Available Quantity:** `0`
- [ ] Set **Status:** `out of stock`
- [ ] Save product
- [ ] As customer: View that product
- [ ] **Expected:** "Out of Stock" badge shows
- [ ] **Expected:** Reserve button disabled or shows "Out of Stock"

### 5.3 Form Validation ✅
**Test Product Creation:**
- [ ] As business: Try to save product without image
- [ ] **Expected:** Error: "Please fill in required fields"
- [ ] Add image but leave name empty
- [ ] **Expected:** Validation error

**Test Reservation:**
- [ ] As customer: Try to reserve without filling customer name
- [ ] **Expected:** Validation error

### 5.4 Image Upload Errors ✅
- [ ] Try uploading very large image (>10MB if possible)
- [ ] **Expected:** Should upload or show size limit error
- [ ] **Check Console:** Look for upload errors

### 5.5 Location Not Set ✅
- [ ] Create new business account (don't set location)
- [ ] Add a product
- [ ] As customer: View that product
- [ ] **Expected:** Distance shows "Location unavailable" or 0 km
- [ ] **Expected:** Product still appears but sorted to bottom when using distance filter

---

## ✅ SUCCESS CRITERIA

### All Tests Pass If:
- [ ] All screens load without errors
- [ ] All navigation works correctly
- [ ] Images upload to Firebase Storage successfully
- [ ] Products display with Firebase Storage URLs
- [ ] Real-time updates work (Firestore listeners)
- [ ] Filters and search work correctly
- [ ] Reservations save to Firestore
- [ ] Chat messages send/receive in real-time
- [ ] Favorites persist across sessions
- [ ] Authentication flow works (signup, login, logout)
- [ ] Location services work (if permissions granted)
- [ ] No console errors during normal operations

---

## 🐛 Common Issues to Check

### If Products Don't Show:
- [ ] Check Firestore console - are products saved?
- [ ] Check console logs for "products loaded"
- [ ] Verify Firebase rules allow read access

### If Images Don't Load:
- [ ] Check if URL starts with `https://firebasestorage.googleapis.com`
- [ ] Verify Firebase Storage rules (see FIREBASE_STORAGE_SETUP.md)
- [ ] Check console for storage errors

### If Distance Shows Wrong:
- [ ] Verify business location is set (not 0, 0)
- [ ] Check location permissions on customer device
- [ ] Look for distance calculation in console logs

### If Filters Don't Work:
- [ ] Check that "Apply Filters" button was clicked
- [ ] Verify Reset button clears all filters
- [ ] Check console for filter state changes

---

## 📸 Screenshots to Capture

For documentation/demo purposes, capture:
1. Business Dashboard with products
2. Product Details screen
3. Reservation confirmation
4. Market screen with filters
5. Chat conversation
6. Favorites section
7. Home screen Hot Deals
8. Account screen

---

## ⏱️ Estimated Testing Time

- **Part 1 (Business):** 30 minutes
- **Part 2 (Customer):** 40 minutes
- **Part 3 (Business Response):** 15 minutes
- **Part 4 (Real-time):** 10 minutes
- **Part 5 (Edge Cases):** 15 minutes

**Total: ~2 hours** for comprehensive testing

---

## 🎯 Quick Smoke Test (15 minutes)

If you're short on time, do this minimal test:

1. [ ] Signup as business → Add 1 product with image
2. [ ] Logout → Signup as customer
3. [ ] View product on Home → Add to favorites
4. [ ] Go to Market → Search for product
5. [ ] Reserve product
6. [ ] Contact shop via chat
7. [ ] Check Reservations tab
8. [ ] Logout

If these 8 steps work, your core features are functional! ✅
