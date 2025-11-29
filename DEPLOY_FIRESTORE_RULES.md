# Deploy Firebase Security Rules

## Important: Deploy Security Rules to Protect Messages

The messaging feature has security rules that ensure users can only see their own conversations and messages. These rules must be deployed to Firebase to take effect.

## Steps to Deploy

### Option 1: Using Firebase Console (Easiest)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tecno-mvp`
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Copy the entire content from `firestore.rules` file in this project
6. Paste it into the rules editor
7. Click **Publish**

### Option 2: Using Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in this project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project: `tecno-mvp`
   - Use the existing `firestore.rules` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What These Rules Protect

### Conversations
- ✅ Users can only see their own conversations
- ✅ Users cannot see other users' conversations
- ✅ Conversation IDs are validated to match the user's ID

### Messages
- ✅ Users can only read messages from their own conversations
- ✅ Users can only send messages in their own conversations
- ✅ Messages cannot be edited or deleted (append-only for integrity)

### Other Collections
- **Products & Shops**: Public read access, authenticated write
- **Reviews**: Public read, users can write their own reviews
- **Reservations**: Users can only see their own reservations
- **Favorites**: Users can only see their own favorites

## Verify Rules are Active

After deployment:
1. Check the Firebase Console > Firestore Database > Rules tab
2. The rules should show as "Published" with a recent timestamp
3. Test the app to ensure messaging works correctly

## Security Architecture

The security is enforced at two levels:

1. **Client-side validation** (messageService.js):
   - Checks conversationId format before making requests
   - Verifies user owns the conversation
   - Prevents accidental access to wrong conversations

2. **Database-level security** (firestore.rules):
   - Enforces rules even if client code is bypassed
   - Protects against malicious users
   - Ensures data privacy at the database level

Both layers work together to provide defense-in-depth security.
