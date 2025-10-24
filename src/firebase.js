// src/firebase.js

import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, // สำหรับสมัครสมาชิก
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "firebase/firestore"; // สำหรับ Firestore

// *** แทนที่ YOUR_... ด้วยค่า Configuration จริงของคุณ ***
const firebaseConfig = {
    apiKey: "AIzaSyCazx0ElnoK80wBGYfURF3yBsDrutAwjCI",
    authDomain: "finalcsi205.firebaseapp.com",
    projectId: "finalcsi205",
    storageBucket: "finalcsi205.firebasestorage.app",
    messagingSenderId: "526634077933",
    appId: "1:526634077933:web:979f64815ae9aefe6646e4",
    measurementId: "G-NLE7ZMEEH7"
};

const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Functions ที่ใช้บ่อย
export { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    setDoc, 
    doc 
};