import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

// --- ฟังก์ชัน Helper สำหรับสร้าง/อัปเดต Document (ย้ายมาจาก AuthPage) ---
const createDefaultProfile = async (user, currentRole = 'patient') => {
    const userRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: currentRole,
            createdAt: new Date(),
            lastLogin: new Date(),
        }, { merge: true });
        console.log("Profile auto-created by Hook for UID:", user.uid);
        // คืนค่าข้อมูลโปรไฟล์ที่สร้างขึ้นมา
        return { uid: user.uid, email: user.email, displayName: user.displayName || user.email.split('@')[0], role: currentRole, createdAt: new Date() };
    } catch (error) {
        console.error("Error auto-creating profile in useAuth:", error);
        return null;
    }
}


const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // useEffect 1: จัดการสถานะ Auth (ยังคงเดิม)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);


  // useEffect 2: ดึง Role จาก Firestore และสร้างใหม่อัตโนมัติถ้าไม่พบ
  useEffect(() => {
    const fetchUserRole = async (uid) => {
      try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef); 

        if (docSnap.exists()) {
          // หากพบโปรไฟล์: บันทึกข้อมูลและ Role
          const profileData = docSnap.data();
          setUserProfile({ uid: docSnap.id, ...profileData });
        } else {
          // *** แก้ไข: หากไม่พบโปรไฟล์ ให้สร้างให้อัตโนมัติเป็น 'patient' (และไม่ต้องเตือน) ***
          const newProfile = await createDefaultProfile(user, 'patient'); 
          
          if (newProfile) {
              setUserProfile(newProfile);
              // Note: การสร้างโปรไฟล์อัตโนมัติจะแก้ไขปัญหา User profile not found ได้อย่างถาวร
          } else {
              // ถ้าสร้างไม่สำเร็จ (เช่น Security Rules บล็อก Create) ให้ Logout
              await signOut(auth);
          }
        }
      } catch (error) {
        console.error("Firestore Fetch Role Error (Fatal):", error.message);
        setUserProfile(null);
        
        // หากเกิด Error ด้านสิทธิ์การเข้าถึง (Error 400) ให้บังคับ Logout
        if (error.code === 'permission-denied' || error.code === 'unavailable') {
             await signOut(auth); 
        }
      }
    };

    if (user && user.uid) { 
        fetchUserRole(user.uid);
    } else {
        setUserProfile(null);
    }
  }, [user]); 

  // ฟังก์ชัน Logout ที่ใช้ใน Dashboard
  const logout = async () => {
      await signOut(auth);
  };

  return { 
    user, 
    userProfile, 
    loading, 
    isAuthReady,
    logout
  };
};

export default useAuth;
