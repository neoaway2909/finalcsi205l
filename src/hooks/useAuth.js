import { useState, useEffect } from 'react';

import { auth, db } from '../firebase';

import { onAuthStateChanged, signOut } from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore'; 



// --- ฟังก์ชัน Helper (ลบการสร้าง Profile อัตโนมัติออก) ---
// ไม่มีการสร้าง Default Profile ใน Hook แล้ว
// ให้ AuthPage.jsx เป็นผู้จัดการเรื่อง Role ทั้งหมด





const useAuth = () => {

  const [user, setUser] = useState(undefined); // เปลี่ยนจาก null เป็น undefined

  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthReady, setIsAuthReady] = useState(false); // 1. เริ่มต้นเป็น false



  // useEffect 1: จัดการสถานะ Auth

  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);

      // Don't set isAuthReady here - let useEffect 2 handle it
      // This prevents the flash of login page while Firebase is checking persistence

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

          // ไม่พบโปรไฟล์ → ให้ Sign Out และแจ้งเตือน
          // AuthPage.jsx จะต้องสร้าง Profile ก่อนที่ผู้ใช้จะ Login สำเร็จ
          console.error("Profile not found for UID:", uid);
          console.error("User must complete role selection before accessing the app");

          setUserProfile(null);
          await signOut(auth);

          // แจ้งเตือนผู้ใช้
          alert("ไม่พบข้อมูลบัญชีของคุณ กรุณาสมัครสมาชิกใหม่อีกครั้ง");

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

    // undefined = Firebase กำลังตรวจสอบ persistence (ยังไม่รู้)

    // null = ไม่มี user (logout แล้ว)

    // user object = มี user login อยู่

    if (user === undefined) {

        // Firebase กำลังตรวจสอบ persistence -> รอก่อน ไม่ต้องทำอะไร

        return;

    } else if (user === null) {

        // User ไม่ได้ login จริง ๆ -> ตั้งค่าให้พร้อมเลย

        setUserProfile(null);

        setIsAuthReady(true);

        setLoading(false);

    } else if (user && user.uid) {

        // ถ้ามี user (Login) -> ให้ไปดึง Profile

        fetchUserRole(user.uid);

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