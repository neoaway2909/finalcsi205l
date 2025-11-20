import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
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
    serverTimestamp,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

//key firebase config
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

// --- Custom Functions ---

export const bookAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, "appointments"), appointmentData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    await addDoc(collection(db, "notifications"), notificationData);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const addMedicalHistory = async (historyData) => {
  try {
    await addDoc(collection(db, "medical_history"), historyData);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, { status });
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};


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
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithCustomToken 
};
