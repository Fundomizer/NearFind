# Firebase Setup Guide for NearFind

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `nearfind` (or your preferred name)
4. Disable Google Analytics (optional for MVP, you can enable it later)
5. Click "Create project"

## Step 2: Register Your App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `NearFind App`
3. **Do NOT** check "Set up Firebase Hosting" (not needed for React Native)
4. Click "Register app"

## Step 3: Copy Firebase Configuration

You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nearfind-xxxxx.firebaseapp.com",
  projectId: "nearfind-xxxxx",
  storageBucket: "nearfind-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**IMPORTANT**: Copy this entire object!

## Step 4: Update Your App Configuration

1. Open the file: `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // Replace this
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace this
  projectId: "YOUR_PROJECT_ID",            // Replace this
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // Replace this
  messagingSenderId: "YOUR_SENDER_ID",     // Replace this
  appId: "YOUR_APP_ID"                     // Replace this
};
```

## Step 5: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Click on **Email/Password** under "Sign-in method"
4. **Enable** the first toggle (Email/Password)
5. Click "Save"

## Step 6: Create Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"** (for development - you'll secure it later)
4. Select a location closest to your users (e.g., `asia-southeast1` for Philippines)
5. Click "Enable"

## Step 7: Set Up Firestore Rules (Temporary - For Development Only)

In Firestore Database, go to the **Rules** tab and use these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY!)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: These rules allow any authenticated user to read/write. For production, you'll need proper security rules.

## Step 8: Create Firestore Collections

Firestore will create collections automatically when you add data, but here's the structure:

### Collections to create:

1. **products**
   - Fields: `name`, `price`, `discount`, `originalPrice`, `image`, `shopName`, `latitude`, `longitude`, `createdAt`

2. **shops**
   - Fields: `name`, `address`, `latitude`, `longitude`, `rating`, `tags`, `createdAt`

3. **reviews**
   - Fields: `userId`, `userName`, `productId`, `shopId`, `rating`, `comment`, `createdAt`

4. **chats**
   - Fields: `userId`, `message`, `sender`, `timestamp`

You don't need to create these manually - they'll be created when you use the app!

## Step 9: Enable Storage (Optional - for product images)

1. In Firebase Console, go to **Build > Storage**
2. Click "Get started"
3. Use default security rules for now
4. Click "Done"

## Step 10: Test Your Setup

1. Make sure you've updated `src/config/firebase.js` with your actual config
2. Run your app:
   ```bash
   npm start
   ```
3. Try creating a new account on the Signup screen
4. Try logging in with the account you created
5. Check Firebase Console > Authentication to see your new user!

## Troubleshooting

### Error: "auth/configuration-not-found"
- Make sure you enabled Email/Password authentication in Firebase Console

### Error: "Firebase: Error (auth/invalid-api-key)"
- Double-check your API key in `src/config/firebase.js`

### Error: "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Make sure your Firebase project is active

### Users can't sign up/login
- Verify Email/Password is enabled in Authentication settings
- Check that you copied the config correctly

## Security Best Practices (Before Going Live)

Before launching to production:

1. **Update Firestore Rules** - Implement proper security rules
2. **Enable App Check** - Prevent API abuse
3. **Set up proper indexes** - For better query performance
4. **Monitor usage** - Set up billing alerts
5. **Backup your data** - Enable automatic backups

## Next Steps

Now that Firebase is set up, you can:

1. Test authentication (Login/Signup)
2. Add sample products using `firestoreService.js` functions
3. Implement real-time features
4. Connect your screens to Firestore data

## Database Schema Example

Here's an example product document:

```javascript
{
  name: "Ube Jam",
  price: 120,
  discount: 20,
  originalPrice: 150,
  image: "url_to_image",
  shopName: "Good Shepherd Convent",
  latitude: 16.4123,
  longitude: 120.5960,
  createdAt: "2025-01-15T10:30:00.000Z"
}
```

## Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**You're all set!** 🎉 Your NearFind app is now connected to Firebase.
