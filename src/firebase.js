import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, // <--- ถูกเพิ่มเข้ามา
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    sendPasswordResetEmail 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    serverTimestamp 
} from "firebase/firestore";

// *** กรุณาแทนที่ YOUR_... ด้วยค่า Configuration จริงของคุณ ***
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

// Export Functions ทั้งหมดที่จำเป็น
export { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    sendPasswordResetEmail,
    setDoc, 
    doc,
    getDoc, 
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    onAuthStateChanged, // <--- ถูก Export แล้ว
    signInAnonymously, 
    signInWithCustomToken 
};
