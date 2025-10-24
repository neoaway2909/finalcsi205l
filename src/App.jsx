import React from "react";
// 1. Import Hook และ Component ที่จำเป็น
import useAuth from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import {
  PatientDashboard,
  DoctorDashboard,
  AdminDashboard,
} from "./components/Dashboards"; // Import Dashboards ทั้ง 3 ตัว

function App() {
  // ดึงสถานะปัจจุบันของผู้ใช้: user, ข้อมูลโปรไฟล์ (พร้อม role), สถานะการโหลด, และ logout function
  const { user, userProfile, isAuthReady, loading, logout } = useAuth();

  // 1. แสดง Loading Screen หากยังไม่พร้อม
  if (loading || !isAuthReady) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        กำลังโหลดระบบ... โปรดรอสักครู่
      </div>
    );
  }

  // 2. ถ้าผู้ใช้ไม่ได้ล็อกอิน (user เป็น null) ให้แสดงหน้า Auth (Login/Signup)
  if (!user) {
    return <AuthPage />;
  }

  // 3. ถ้าล็อกอินแล้ว แต่ยังไม่มี Role (กำลังดึงข้อมูลจาก Firestore)
  // userProfile จะเป็น null ชั่วคราวหลัง login จนกว่า Firestore จะตอบกลับ
  if (!userProfile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1 style={{ color: "#333" }}>กำลังตรวจสอบบทบาท (Role)...</h1>
        <p style={{ margin: "20px 0" }}>
          โปรดรอสักครู่ หรือลองออกจากระบบแล้วเข้าใหม่
        </p>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    );
  }

  // 4. แสดงหน้า Dashboard ตาม Role ที่ได้จาก Firestore (ใช้ switch/case)
  switch (userProfile.role) {
    case "patient":
      // ส่งข้อมูล userProfile และ logout function ไปให้ Dashboard
      return <PatientDashboard user={userProfile} logout={logout} />;
    case "doctor":
      return <DoctorDashboard user={userProfile} logout={logout} />;
    case "admin":
      return <AdminDashboard user={userProfile} logout={logout} />;
    default:
      // กรณี Role ไม่ถูกต้อง/ไม่รู้จัก
      return (
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          <h1>❌ บทบาทไม่ถูกต้อง!</h1>
          <p>
            บัญชีของคุณมีบทบาทที่ไม่รู้จัก ({userProfile.role})
            โปรดติดต่อผู้ดูแลระบบ
          </p>
          <button
            onClick={logout}
            style={{ display: "block", margin: "20px auto" }}
          >
            ออกจากระบบ
          </button>
        </div>
      );
  }
}

export default App;
