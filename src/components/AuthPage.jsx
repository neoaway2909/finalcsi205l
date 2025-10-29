import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaFacebookF,
  FaGoogle,
  FaLine,
  FaUserMd,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setDoc,
  doc,
  getDoc,
  signOut, // ต้อง Import signOut เพื่อใช้ในการแก้ไข Race Condition
} from "../firebase";
import "./AuthPage.css";
import ForgotPassword from "./ForgotPassword";

// --- 1. ฟังก์ชัน Firestore: บันทึกข้อมูลบัญชี (แก้ไข Logic บังคับใช้ Role ใหม่) ---
const saveUserToFirestore = async (user, newRole = null) => {
  const userRef = doc(db, "users", user.uid);

  // *** Logic ที่ถูกแก้ไข: แยก Path การ Sign Up และ Log In ออกจากกัน ***

  // Path 1: Sign Up (newRole มีค่า)
  if (newRole) {
    // **บังคับเขียนทับ Role ที่เลือก** โดยไม่สนใจว่า useAuth.js สร้าง doc ชั่วคราวไว้หรือไม่
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        role: newRole, // <-- ใช้ Role ที่ถูกเลือก (doctor/admin)
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      { merge: true }
    );
    console.log(`User data saved/updated. Role: ${newRole} (New Registration)`);
    return newRole;
  }

  // Path 2: Log In (newRole ไม่มีค่า)
  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const currentRole = docSnap.data().role;

      // อัปเดตเฉพาะเวลา Login โดยไม่เขียนทับ Role
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      console.log(`User data updated on login. Role: ${currentRole}`);
      return currentRole;
    } else {
      // ควรถูกจัดการใน useAuth.js แต่ถ้ามาถึงตรงนี้ให้ fallback เป็น patient
      console.error("Profile missing on login.");
      return "patient";
    }
  } catch (error) {
    console.error("Error reading profile on login:", error);
    return "patient";
  }
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // *** State ใหม่สำหรับ Role Selector ***
  const [selectedRole, setSelectedRole] = useState("patient");

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

      // *** 1. บันทึก Role ที่ผู้ใช้เลือก (Doctor) โดยส่ง selectedRole เข้าไป ***
      // Logic ใน saveUserToFirestore จะจัดการให้ใช้ Role ที่ถูกต้องนี้
      await saveUserToFirestore(user, selectedRole);

      // *** 2. Sign Out ทันทีเพื่อยุติ Race Condition ***
      // สิ่งนี้สำคัญที่สุดเพื่อไม่ให้ useAuth.js เข้ามาแทรกแซงและกำหนด role เป็น patient
      await signOut(auth);

      alert(`สมัครเป็น ${selectedRole} สำเร็จ! กรุณาล็อกอิน`);
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedRole("patient");
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

      // เรียกใช้โดยไม่ส่งค่า Role (เพื่อให้ดึง Role เดิมที่บันทึกไว้ใน Firestore)
      // Logic ใน saveUserToFirestore จะรู้ว่าเป็น Log In และจะรักษา Role เดิมไว้
      await saveUserToFirestore(user);

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

      // เรียกใช้โดยไม่ส่งค่า Role (เพื่อให้ดึง Role เดิม)
      await saveUserToFirestore(user);

      console.log("Google Login Successful, User:", user.email);
    } catch (err) {
      console.error("Login Error:", err);
      setError("เกิดข้อผิดพลาดในการล็อกอินด้วย Google");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Social Login อื่น ๆ ---
  const handleSocialLogin = (platform) => {
    setError(`กรุณาตั้งค่า ${platform} Provider ใน Firebase Console`);
  };

  // --- Component ย่อยสำหรับปุ่มเลือก Role (ย้ายมาที่นี่) ---
  const RoleOption = ({
    icon: Icon,
    title,
    role,
    selected,
    onSelect,
    color,
  }) => (
    <button
      onClick={() => onSelect(role)}
      className="role-option-button"
      style={{
        border: `2px solid ${selected ? color : "#ccc"}`,
        backgroundColor: selected ? `${color}15` : "white",
      }}
    >
      <Icon size={25} color={color} />
      <p className="role-title">{title}</p>
    </button>
  );

  return (
    <div className="login-page">
      <div className="header-curve">
        <h1 className="logo-text">Care yoursafe</h1>
        <p className="logo-subtitle">online</p>
      </div>

      {/* เราใช้ login-form-card เป็น Container หลักที่ไม่ขยับ */}
      <div className="login-form-card">
        {showForgot ? (
          // 1. หน้า Forgot Password
          <ForgotPassword onBackToLogin={() => setShowForgot(false)} />
        ) : (
          <>
            {/* --- แถบ Log in / Sign Up --- */}
            <div className="tab-buttons-container">
              <button
                className={`tab-button ${isLogin ? "active" : "inactive"}`}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                disabled={loading}
              >
                Log in
              </button>
              <button
                className={`tab-button ${!isLogin ? "active" : "inactive"}`}
                onClick={() => {
                  setIsLogin(false); // เปลี่ยนไปแสดงหน้า Sign Up
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

            {isLogin ? (
              // --- 3. หน้า Login ปกติ ---
              <form onSubmit={handleLogin} className="form-fields">
                {/* Input Fields Login */}
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

                <div className="forgot-password">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgot(true);
                    }}
                  >
                    Forgot password
                  </a>
                </div>

                <button
                  type="submit"
                  className="login-main-button"
                  disabled={loading}
                >
                  {loading ? "กำลังดำเนินการ..." : "Log in"}
                </button>
              </form>
            ) : (
              // --- 2. หน้า Sign Up (Role Selector + Form) ---
              <>
                {/* ***** ส่วน Role Selector ***** */}
                <p className="signup-subtitle">
                  โปรดเลือกบทบาทที่คุณต้องการสมัคร:
                </p>

                <div
                  className="role-options-container"
                  style={{ marginBottom: "20px" }}
                >
                  <RoleOption
                    icon={FaUser}
                    title="คนไข้"
                    role="patient"
                    selected={selectedRole === "patient"}
                    onSelect={setSelectedRole}
                    color="#668ee0"
                  />
                  <RoleOption
                    icon={FaUserMd}
                    title="แพทย์"
                    role="doctor"
                    selected={selectedRole === "doctor"}
                    onSelect={setSelectedRole}
                    color="#28a745"
                  />
                  <RoleOption
                    icon={FaUserTie}
                    title="แอดมิน"
                    role="admin"
                    selected={selectedRole === "admin"}
                    onSelect={setSelectedRole}
                    color="#e6b800"
                  />
                </div>
                {/* ***** สิ้นสุดส่วน Role Selector ***** */}

                <form onSubmit={handleSignUp} className="form-fields">
                  {/* Input Fields Sign Up */}
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

                  <button
                    type="submit"
                    className="login-main-button"
                    disabled={loading}
                  >
                    {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
                  </button>
                </form>
              </>
            )}

            {error && <p className="error-message">{error}</p>}

            {/* Social Logins - แสดงเฉพาะในหน้า Login */}
            {isLogin && (
              <>
                <div className="separator">or</div>
                <div className="social-logins">
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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
