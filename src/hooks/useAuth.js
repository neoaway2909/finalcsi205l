import { useState, useEffect } from 'react';

import { auth, db } from '../firebase';

import { onAuthStateChanged, signOut } from 'firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore'; 



// --- ฟังก์ชัน Helper (คงเดิม) ---

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

  const [isAuthReady, setIsAuthReady] = useState(false); // 1. เริ่มต้นเป็น false



  // useEffect 1: จัดการสถานะ Auth

  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);

      // ถ้าไม่มี user ให้ตั้งค่า ready ทันที
      if (!currentUser) {
        setIsAuthReady(true);
        setLoading(false);
      }

    });



    return () => unsubscribeAuth();

  }, []);





  // useEffect 2: ดึง Role และจัดการ isAuthReady

  useEffect(() => {

    

    // 2. สร้างฟังก์ชัน fetchUserRole *ข้างใน* useEffect

    // (เพื่อรวม logic การตั้งค่า isAuthReady และ loading)

    const fetchUserRole = async (uid) => {

      setLoading(true); // 3. เริ่มโหลดโปรไฟล์

      try {

        const userRef = doc(db, 'users', uid);

        const docSnap = await getDoc(userRef); 



        if (docSnap.exists()) {

          const profileData = docSnap.data();

          setUserProfile({ uid: docSnap.id, ...profileData });

        } else {

          // หากไม่พบโปรไฟล์ ให้สร้างให้อัตโนมัติเป็น 'patient'

          const newProfile = await createDefaultProfile(user, 'patient'); 

          

          if (newProfile) {

              setUserProfile(newProfile);

          } else {

              // ถ้าสร้างไม่สำเร็จ (เช่น Security Rules บล็อก Create)

              await signOut(auth);

          }

        }

      } catch (error) {

        console.error("Firestore Fetch Role Error (Fatal):", error.message);

        setUserProfile(null);

        

        if (error.code === 'permission-denied' || error.code === 'unavailable') {

             await signOut(auth); 

        }

      } finally {

        // 4. ตั้งค่า Ready และ Loading ที่นี่ (ใน finally)

        // ไม่ว่า Try หรือ Catch จะทำงาน... เราก็พร้อมแล้ว

        setLoading(false);

        setIsAuthReady(true);

      }

    };



    // 5. Logic การเรียกใช้

    if (user && user.uid) { 

        // ถ้ามี user (Login) -> ให้ไปดึง Profile

        fetchUserRole(user.uid);

    } else {

        // ถ้าไม่มี user (Logout) -> ตั้งค่าให้พร้อมเลย

        setUserProfile(null);

        setIsAuthReady(true);

        setLoading(false); // (กันไว้)

    }

  }, [user]); // 6. ให้ Effect นี้ทำงานเมื่อ 'user' เปลี่ยน



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