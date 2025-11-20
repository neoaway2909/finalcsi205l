import React, { useState } from "react";
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
} from "../firebase";
import "./AuthPage.css";
import ForgotPassword from "./ForgotPassword";
import RoleSelectionModal from "./RoleSelectionModal";
import { LoginFormFields } from "./auth/LoginFormFields";
import { RegisterFormFields } from "./auth/RegisterFormFields";
import { SocialLoginButtons } from "./auth/SocialLoginButtons";

// --- Firestore Helper: Save user to Firestore ---
const saveUserToFirestore = async (user, newRole = null) => {
  const userRef = doc(db, "users", user.uid);

  // Path 1: Sign Up (newRole has value)
  if (newRole) {
    const requiresApproval = newRole === 'doctor' || newRole === 'admin';
    const finalRole = requiresApproval ? 'patient' : newRole;
    const accountStatus = requiresApproval ? 'pending' : 'active';

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        role: finalRole,
        requestedRole: requiresApproval ? newRole : null,
        accountStatus: accountStatus,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      { merge: true }
    );
    console.log(`User data saved/updated. Role: ${finalRole}, Status: ${accountStatus}`);
    return { role: finalRole, status: accountStatus, requestedRole: newRole };
  }

  // Path 2: Log In (newRole is null)
  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const currentRole = docSnap.data().role;
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      console.log(`User data updated on login. Role: ${currentRole}`);
      return currentRole;
    } else {
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
  const [selectedRole, setSelectedRole] = useState("patient");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingSocialUser, setPendingSocialUser] = useState(null);

  // --- Sign Up Handler ---
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
      const result = await saveUserToFirestore(user, selectedRole);

      if (result.status === 'pending') {
        alert(`สมัครสมาชิกสำเร็จ!\n\nคำขอเป็น ${result.requestedRole === 'doctor' ? 'แพทย์' : 'แอดมิน'} ของคุณอยู่ระหว่างการพิจารณา\nคุณสามารถใช้งานในฐานะคนไข้ได้ก่อน จนกว่าจะได้รับการอนุมัติ`);
      } else {
        alert(`สมัครสมาชิกสำเร็จ! กำลังนำคุณเข้าสู่ระบบ...`);
      }

      // Reset form
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

  // --- Login Handler ---
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
      await saveUserToFirestore(user);
      console.log("Login Successful, User:", user.email);
    } catch (err) {
      console.error("Login Error:", err.code);
      setError("การล็อกอินล้มเหลว: โปรดตรวจสอบอีเมลและรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const currentRole = docSnap.data().role;
        await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
        console.log(`Google Login Successful, Role: ${currentRole}`);
      } else {
        console.log("First-time Google login, showing role selection...");
        setPendingSocialUser(user);
        setShowRoleModal(true);
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("เกิดข้อผิดพลาดในการล็อกอินด้วย Google");
    } finally {
      setLoading(false);
    }
  };

  // --- Social Role Select Handler ---
  const handleSocialRoleSelect = async (selectedRole) => {
    if (!pendingSocialUser) return;

    setLoading(true);
    try {
      await saveUserToFirestore(pendingSocialUser, selectedRole);
      console.log(`Profile created for social login user with role: ${selectedRole}`);
      setShowRoleModal(false);
      setPendingSocialUser(null);
    } catch (err) {
      console.error("Error saving social login profile:", err);
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // --- Other Social Login Handler ---
  const handleSocialLogin = (platform) => {
    setError(`กรุณาตั้งค่า ${platform} Provider ใน Firebase Console`);
  };

  // --- Tab Switch Handler ---
  const handleTabSwitch = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-page">
      {/* Header Curve with Logo */}
      <div className="header-curve">
        <h1 className="logo-text">Care yoursafe</h1>
        <p className="logo-subtitle">online</p>
      </div>

      {/* Main Card */}
      <div className="login-form-card">
        {showForgot ? (
          <ForgotPassword onBackToLogin={() => setShowForgot(false)} />
        ) : (
          <>
            {/* Tab Buttons */}
            <div className="tab-buttons-container">
              <button
                type="button"
                className={`tab-button ${isLogin ? 'active' : 'inactive'}`}
                onClick={() => handleTabSwitch(true)}
                disabled={loading}
              >
                Log in
              </button>
              <button
                type="button"
                className={`tab-button ${!isLogin ? 'active' : 'inactive'}`}
                onClick={() => handleTabSwitch(false)}
                disabled={loading}
              >
                Sign Up
              </button>
            </div>

            <div className="form-fields">
              {/* Login or Register Form */}
              {isLogin ? (
                <LoginFormFields
                  email={email}
                  password={password}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handleLogin}
                  onForgotPassword={() => setShowForgot(true)}
                  error={error}
                  loading={loading}
                />
              ) : (
                <RegisterFormFields
                  email={email}
                  password={password}
                  confirmPassword={confirmPassword}
                  selectedRole={selectedRole}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  onRoleSelect={setSelectedRole}
                  onSubmit={handleSignUp}
                  error={error}
                  loading={loading}
                />
              )}

              {/* Social Logins */}
              <SocialLoginButtons
                onGoogleLogin={handleGoogleLogin}
                onFacebookLogin={() => handleSocialLogin("Facebook")}
                onLineLogin={() => handleSocialLogin("Line")}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>

      {/* Role Selection Modal for Social Login */}
      {showRoleModal && (
        <RoleSelectionModal
          onRoleSelect={handleSocialRoleSelect}
          onCancel={null}
        />
      )}
    </div>
  );
};

export default AuthPage;
