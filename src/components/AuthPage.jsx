// src/components/AuthPage.jsx

import React, { useState } from "react";
import { FaUser, FaLock, FaFacebookF, FaGoogle, FaLine } from "react-icons/fa";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // ใช้สำหรับ Sign Up
  GoogleAuthProvider,
  signInWithPopup,
  setDoc,
  doc,
} from "../firebase";
import "./AuthPage.css";
import ForgotPassword from "./ForgotPassword"; // Component ลืมรหัสผ่าน
import RoleSelectorSignUp from "./RoleSelectorSignUp";

// --- 1. ฟังก์ชัน Firestore: บันทึกข้อมูลบัญชี ---
const saveUserToFirestore = async (user, role = "patient") => {
  // โค้ดสำหรับการบันทึกข้อมูลยังคงเดิม
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        role: role,
        createdAt: new Date(),
      },
      { merge: true }
    );
    console.log("User data successfully saved/updated in Firestore.");
  } catch (error) {
    console.error("Error writing document to Firestore: ", error);
  }
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false); // สถานะควบคุมการแสดงผล
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 2. ฟังก์ชันหลัก: สมัครสมาชิก (handleSignUp) ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      return setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await saveUserToFirestore(user, "patient");

      alert("สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน");
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Sign Up Error:", err.code);
      if (err.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้สมัครไปแล้ว");
      } else if (err.code === "auth/weak-password") {
        setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      } else {
        setError("การสมัครสมาชิกไม่สำเร็จ: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ฟังก์ชันหลัก: ล็อกอิน (handleLogin) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await saveUserToFirestore(user, "patient");

      console.log("Login Successful, User:", user.email);
    } catch (err) {
      console.error("Login Error:", err.code);
      setError("การล็อกอินล้มเหลว: โปรดตรวจสอบอีเมลและรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ฟังก์ชัน: ล็อกอินด้วย Google ---
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await saveUserToFirestore(user, "patient");

      console.log("Google Login Successful, User:", user.email);
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("เกิดข้อผิดพลาดในการล็อกอินด้วย Google");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Social Login อื่น ๆ ---
  const handleSocialLogin = (platform) => {
    setError(`กรุณาตั้งค่า ${platform} Provider ใน Firebase Console`);
  };

  // ส่วนของฟังก์ชัน AuthPage

  return (
    <div className="login-page">
      <div className="header-curve">
        <h1 className="logo-text">Care yoursafe</h1>
        <p className="logo-subtitle">online</p>
      </div>

      {/* เราใช้ login-form-card เป็น Container หลักที่ไม่ขยับ */}
      <div className="login-form-card">
        {showForgot ? (
          // A. ถ้า showForgot เป็น true ให้แสดงหน้า Forgot Password
          <ForgotPassword onBackToLogin={() => setShowForgot(false)} />
        ) : (
          // B. ถ้า showForgot เป็น false ให้แสดงหน้า Login / Sign Up ปกติ
          <>
            {" "}
            {/* ใช้ Fragment เพื่อรวม Element หลายตัวเข้าด้วยกัน */}
            {/* แถบ Log in / Sign Up */}
            <div className="tab-buttons-container">
              <button
                className={`tab-button ${isLogin ? "active" : "inactive"}`}
                onClick={() => setIsLogin(true)}
                disabled={loading}
              >
                Log in
              </button>
              <button
                className={`tab-button ${!isLogin ? "active" : "inactive"}`}
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                disabled={loading}
              >
                Sign Up
              </button>
            </div>
            {/* Form: Login / Sign Up */}
            <form
              onSubmit={isLogin ? handleLogin : handleSignUp}
              className="form-fields"
            >
              {/* ... Input Fields และ Logic ทั้งหมดของ Login/Sign Up ... */}

              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="email"
                  placeholder="Email (ใช้แทน Username)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  disabled={loading}
                />
              </div>

              {!isLogin && (
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              )}

              {/* ลืมรหัสผ่าน / ปุ่มหลัก */}
              {isLogin && (
                <div className="forgot-password">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgot(true); // เปลี่ยน State
                    }}
                  >
                    Forgot password
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="login-main-button"
                disabled={loading}
              >
                {loading ? "กำลังดำเนินการ..." : isLogin ? "Log in" : "Sign Up"}
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <div className="separator">or</div>
            <div className="social-logins">
              {/* ... Social Login Buttons ... */}
              <button
                onClick={() => handleSocialLogin("Facebook")}
                className="social-button facebook"
                disabled={loading}
              >
                <FaFacebookF size={20} />
              </button>
              <button
                onClick={handleGoogleLogin}
                className="social-button google"
                disabled={loading}
              >
                <FaGoogle size={20} />
              </button>
              <button
                onClick={() => handleSocialLogin("Line")}
                className="social-button line"
                disabled={loading}
              >
                <FaLine size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
