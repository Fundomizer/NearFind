import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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

// Initialize Firebase services with persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;