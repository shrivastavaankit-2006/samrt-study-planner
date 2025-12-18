import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: "AIzaSyCZCG16T4oOYzC_M0t53RSR0WhkvEPXXPY",
    authDomain: "smart-study-planner-90246.firebaseapp.com",
    projectId: "smart-study-planner-90246",
    storageBucket: "smart-study-planner-90246.firebasestorage.app",
    messagingSenderId: "858018662260",
    appId: "1:858018662260:web:a6f7a9240d64922b2c0e21",
    measurementId: "G-2731PH58VT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
