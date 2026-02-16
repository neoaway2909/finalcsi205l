// Mock Firebase implementation to disconnect from real Firebase
// and connect to local Node.js Express Server

const API_URL = 'http://localhost:3000/api';

// --- Auth Mocks ---
export const auth = {};
export const db = {};

export const signInWithEmailAndPassword = async (auth, email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Simulate Firebase User object
    return {
      user: {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        ...data.user
      }
    };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const createUserWithEmailAndPassword = async (auth, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: email, // Using email as ID for simplicity in migration
        password,
        displayName: email.split('@')[0],
        role: 'patient' // Default role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return {
      user: {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        ...data.user
      }
    };
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

export const signOut = async (auth) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload(); // Reload to reset state
};

export const onAuthStateChanged = (auth, callback) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // Mimic Firebase User Object
    callback({
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      ...user
    });
  } else {
    callback(null);
  }
  return () => { }; // Unsubscribe function
};

// --- Firestore Mocks (Mocking data for now) ---

export const doc = (db, collectionName, id) => ({ type: 'doc', collection: collectionName, id });
export const collection = (db, collectionName) => ({ type: 'collection', name: collectionName });
export const query = (col, ...constraints) => ({ ...col, constraints });
export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, dir) => ({ type: 'orderBy', field, dir });

export const getDoc = async (docRef) => {
  // Fetch specific user data
  if (docRef.collection === 'users') {
    try {
      const response = await fetch(`${API_URL}/user/${docRef.id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          exists: () => true,
          data: () => data,
          id: data.id
        };
      }
    } catch (e) {
      console.error("Error fetching doc:", e);
    }
  }
  return { exists: () => false, data: () => undefined };
};

export const onSnapshot = (queryObj, callback, onError) => {
  // Mocking real-time updates: Just return empty or static data for now
  // to prevent errors until we implement backend APIs for lists (doctors, appointments)

  setTimeout(() => {
    let docs = [];
    // Logic to return mock data based on query name
    if (queryObj.name === 'users') {
      // Mock some doctors if querying users
      // To implement properly, we need GET /api/doctors endpoint
      docs = [];
    } else if (queryObj.name === 'appointments') {
      docs = [];
    } else if (queryObj.name === 'notifications') {
      docs = [];
    }

    callback({
      docs: docs.map(d => ({
        id: d.id,
        data: () => d
      }))
    });
  }, 100);

  return () => { }; // unsubscribe
};

export const setDoc = async (docRef, data) => {
  console.log("Mock setDoc:", docRef, data);
};

export const updateDoc = async (docRef, data) => {
  console.log("Mock updateDoc:", docRef, data);
};

export const addDoc = async (colRef, data) => {
  console.log("Mock addDoc:", colRef, data);
  return { id: 'mock-id-' + Date.now() };
};

export const deleteDoc = async (docRef) => {
  console.log("Mock deleteDoc:", docRef);
};

export const serverTimestamp = () => new Date();

// --- Auth Providers (Not supported in local auth yet) ---
export const GoogleAuthProvider = class { constructor() { } };
export const signInWithPopup = async () => { alert("Google Sign-In not supported in Local Mode"); };
export const sendPasswordResetEmail = async () => { alert("Password reset not supported in Local Mode"); };
export const signInAnonymously = async () => { };
export const signInWithCustomToken = async () => { };
export const getAuth = () => ({});
export const getFirestore = () => ({});


// --- Custom Functions Exports (Keep signatures) ---
export const bookAppointment = async (data) => addDoc(collection(db, 'appointments'), data);
export const createNotification = async (data) => addDoc(collection(db, 'notifications'), data);
export const addMedicalHistory = async (data) => addDoc(collection(db, 'medical_history'), data);
export const updateAppointmentStatus = async (id, status) => updateDoc(doc(db, 'appointments', id), { status });
export const updateUserProfile = async (id, updates) => updateDoc(doc(db, 'users', id), updates);
export const deleteUser = async (id) => deleteDoc(doc(db, 'users', id));

// Export all original names
export {
  // ... all functions defined above are exported ...
};

