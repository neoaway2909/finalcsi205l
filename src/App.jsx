// 1. Import Hook และ Component ที่จำเป็น
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import {
  PatientDashboard,
  DoctorDashboard,
  AdminDashboard,
} from "./components/Dashboards"; // Import Dashboards ทั้ง 3 ตัว
import { db } from "./firebase"; // Import db
import LoadingScreen from "./components/common/LoadingScreen";

function App() {
  const { user, userProfile, isAuthReady, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (isAuthReady && user && userProfile && location.pathname === '/') {
      // Redirect ไปหน้าเริ่มต้นตาม role
      if (userProfile.role === 'patient') {
        navigate('/home', { replace: true });
      } else if (userProfile.role === 'doctor') {
        navigate('/queue', { replace: true });
      } else if (userProfile.role === 'admin') {
        navigate('/doctors', { replace: true });
      }
    }
  }, [isAuthReady, user, userProfile, location.pathname, navigate]);

  // แสดง Splash Screen ก่อนรู้สถานะ auth
  if (!isAuthReady) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f7fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e0e0e0",
              borderTop: "4px solid #668ee0",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ถ้าผู้ใช้ไม่ได้ล็อกอิน แสดงหน้า Auth
  if (!user) {
    return <AuthPage />;
  }

  // ถ้าล็อกอินแล้ว แต่กำลังโหลด userProfile
  if (loading) {
    return <LoadingScreen />;
  }

  // ถ้าล็อกอินแล้ว แต่ยังไม่มี Role
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

  // แสดงหน้า Dashboard ตาม Role
  switch (userProfile.role) {
    case "patient":
      return <PatientDashboard user={userProfile} logout={logout} db={db} />;
    case "doctor":
      return <DoctorDashboard user={userProfile} logout={logout} db={db} />;
    case "admin":
      return <AdminDashboard user={userProfile} logout={logout} db={db} />;
    default:
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
