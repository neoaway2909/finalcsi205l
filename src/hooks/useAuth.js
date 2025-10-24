import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // ใช้ getDoc เพื่อความเสถียร

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

  // useEffect 2: ดึง Role จาก Firestore (ปรับปรุงการดึงข้อมูลแบบ One-time)
  useEffect(() => {
    const fetchUserRole = async (uid) => {
      try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef); // ใช้ getDoc เพื่อความเสถียร

        if (docSnap.exists()) {
          // หากพบโปรไฟล์: บันทึกข้อมูลและ Role
          setUserProfile({ uid: docSnap.id, ...docSnap.data() });
        } else {
          // หากไม่พบ Document (เช่น บัญชีเก่าที่ไม่มีโปรไฟล์):
          setUserProfile(null);
          console.warn("User profile not found in Firestore. Please create a new one.");
          // *** ไม่ต้อง Logout อัตโนมัติ ปล่อยให้ App.jsx แสดงหน้าโหลด และผู้ใช้เลือก Logout เอง ***
        }
      } catch (error) {
        console.error("Firestore Fetch Role Error (Code: " + error.code + "): " + error.message);
        setUserProfile(null);
        
        // *** จัดการ Error 400 (Bad Request) โดยการบังคับ Logout ***
        // ถ้าเป็น 'permission-denied' หรือ 'unavailable' (มักเป็น 400) ให้ทำการ signOut เพื่อหยุดการเชื่อมต่อที่ล้มเหลว
        if (error.code === 'permission-denied' || error.code === 'unavailable') {
             await signOut(auth); 
        }
      }
    };

    if (user && user.uid) { 
        // ถ้ามี user ล็อกอินอยู่ ให้เริ่มดึง Role
        fetchUserRole(user.uid);
    } else {
        // เมื่อ Logout หรือ user เป็น null
        setUserProfile(null);
    }
    
    // ไม่มี Listener ที่ต้องยกเลิกในการใช้ getDoc
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
