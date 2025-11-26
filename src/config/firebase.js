import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;