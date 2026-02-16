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
  getAuth,
  sendPasswordResetEmail
} from "../firebase";
import { FaUser, FaLock, FaUserMd, FaUserTie, FaCheck, FaFacebookF, FaGoogle, FaLine, FaEnvelope } from 'react-icons/fa';
import "./AuthPage.css";

// --- Internal Auth Components ---

/**
 * Forgot Password Component
 * Displays form to send password reset email
 */
const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authInstance = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(authInstance, email);
      setMessage(
        `ได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล ${email} แล้ว กรุณาตรวจสอบอีเมล`
      );
      setEmail("");
    } catch (err) {
      console.error("Password Reset Error:", err.code);
      if (err.code === "auth/user-not-found") {
        setError("ไม่พบผู้ใช้ด้วยอีเมลนี้");
      } else if (err.code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ต");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">ลืมรหัสผ่าน?</h2>
        <p className="forgot-password-subtitle">
          กรอกอีเมลที่คุณใช้สมัครสมาชิก
          <br />
          เพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
        </p>

        <form onSubmit={handleSubmit} className="form-fields">
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button type="submit" className="login-main-button" disabled={loading}>
            {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
          </button>
        </form>

        <div className="back-to-login">
          <a href="#" onClick={onBackToLogin}>
            ย้อนกลับไปหน้าล็อกอิน
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Role Selection Modal Component
 * Displays modal for selecting user role (patient, doctor, admin)
 */
const RoleSelectionModal = ({ onRoleSelect, onCancel }) => {
  const [selectedRole, setSelectedRole] = useState("patient");

  const handleConfirm = () => {
    onRoleSelect(selectedRole);
  };

  const roles = [
    {
      icon: FaUser,
      title: "คนไข้",
      role: "patient",
      color: "border-blue-500 bg-blue-50 text-blue-600",
      hoverColor: "hover:border-blue-500 hover:bg-blue-50/50",
      iconColor: "text-blue-500"
    },
    {
      icon: FaUserMd,
      title: "แพทย์",
      role: "doctor",
      color: "border-green-500 bg-green-50 text-green-600",
      hoverColor: "hover:border-green-500 hover:bg-green-50/50",
      iconColor: "text-green-500"
    },
    {
      icon: FaUserTie,
      title: "แอดมิน",
      role: "admin",
      color: "border-yellow-500 bg-yellow-50 text-yellow-600",
      hoverColor: "hover:border-yellow-500 hover:bg-yellow-50/50",
      iconColor: "text-yellow-500"
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      style={{ animation: 'fadeIn 0.2s ease-in-out' }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-[90%] max-w-2xl shadow-2xl"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="text-center mb-8 space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">เลือกบทบาทของคุณ</h2>
          <p className="text-base text-gray-600">กรุณาเลือกว่าคุณต้องการเข้าใช้งานในฐานะใด</p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6">
          {roles.map((roleItem) => {
            const RoleIcon = roleItem.icon;
            const isSelected = selectedRole === roleItem.role;
            return (
              <button
                key={roleItem.role}
                onClick={() => setSelectedRole(roleItem.role)}
                className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? roleItem.color
                    : `border-gray-200 bg-white hover:shadow-md ${roleItem.hoverColor}`
                }`}
              >
                <RoleIcon
                  size={40}
                  className={isSelected ? roleItem.iconColor : "text-gray-400"}
                />
                <p className={`font-medium text-lg ${isSelected ? "" : "text-gray-600"}`}>
                  {roleItem.title}
                </p>
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm">
                    <FaCheck size={16} className={roleItem.iconColor} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-8 py-3 rounded-lg font-semibold transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              ยกเลิก
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="min-w-[120px] px-8 py-3 rounded-lg font-semibold transition-all text-white hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6b9bf6 0%, #5a8de5 100%)',
              boxShadow: '0 4px 12px rgba(107, 155, 246, 0.4)'
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// --- Internal Auth Components ---

/**
 * Login Form Fields Component
 * Displays email and password input fields for login
 */
const LoginFormFields = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  error,
  loading = false
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="input-group">
        <FaUser className="input-icon" />
        <input
          type="email"
          placeholder="Email (ใช้แทน Username)"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />
      </div>

      <div className="input-group" style={{ marginTop: '16px' }}>
        <FaLock className="input-icon" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />
      </div>

      <div className="forgot-password">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}
        >
          Forgot password
        </a>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="login-main-button" disabled={loading}>
        {loading ? "กำลังดำเนินการ..." : "Log in"}
      </button>
    </form>
  );
};

/**
 * Register Form Fields Component
 * Displays registration form with role selection, email, password, and confirm password
 */
const RegisterFormFields = ({
  email,
  password,
  confirmPassword,
  selectedRole = 'patient',
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleSelect,
  onSubmit,
  error,
  loading = false
}) => {
  const checkmarkStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "white",
    borderRadius: "50%",
    padding: "3px"
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="signup-subtitle">โปรดเลือกบทบาทที่คุณต้องการสมัคร:</p>

      <div className="role-options-container">
        <button
          type="button"
          onClick={() => onRoleSelect("patient")}
          className={`role-option-button ${selectedRole === "patient" ? "selected-patient" : ""}`}
        >
          <FaUser size={28} color={selectedRole === "patient" ? "#2867e4" : "#999"} />
          <p className="role-title">คนไข้</p>
          {selectedRole === "patient" && (
            <div style={checkmarkStyle}>
              <FaCheck size={12} color="#2867e4" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onRoleSelect("doctor")}
          className={`role-option-button ${selectedRole === "doctor" ? "selected-doctor" : ""}`}
        >
          <FaUserMd size={28} color={selectedRole === "doctor" ? "#10a37f" : "#999"} />
          <p className="role-title">แพทย์</p>
          {selectedRole === "doctor" && (
            <div style={checkmarkStyle}>
              <FaCheck size={12} color="#10a37f" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onRoleSelect("admin")}
          className={`role-option-button ${selectedRole === "admin" ? "selected-admin" : ""}`}
        >
          <FaUserTie size={28} color={selectedRole === "admin" ? "#f59e0b" : "#999"} />
          <p className="role-title">แอดมิน</p>
          {selectedRole === "admin" && (
            <div style={checkmarkStyle}>
              <FaCheck size={12} color="#f59e0b" />
            </div>
          )}
        </button>
      </div>

      <div className="input-group">
        <FaUser className="input-icon" />
        <input
          type="email"
          placeholder="Email (ใช้แทน Username)"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />
      </div>

      <div className="input-group" style={{ marginTop: '16px' }}>
        <FaLock className="input-icon" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />
      </div>

      <div className="input-group" style={{ marginTop: '16px' }}>
        <FaLock className="input-icon" />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="login-main-button" disabled={loading}>
        {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
      </button>
    </form>
  );
};

/**
 * Social Login Buttons Component
 * Displays social login options (Facebook, Google, Line)
 */
const SocialLoginButtons = ({
  onGoogleLogin,
  onFacebookLogin,
  onLineLogin,
  loading = false
}) => {
  return (
    <>
      <div className="separator">or</div>

      <div className="social-logins">
        <button
          type="button"
          onClick={onFacebookLogin}
          disabled={loading}
          className="social-button facebook"
        >
          <FaFacebookF />
        </button>
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={loading}
          className="social-button google"
        >
          <FaGoogle />
        </button>
        <button
          type="button"
          onClick={onLineLogin}
          disabled={loading}
          className="social-button line"
        >
          <FaLine />
        </button>
      </div>
    </>
  );
};

// --- Firestore Helper: Save user to Firestore ---
const saveUserToFirestore = async (user, newRole = null) => {
  const userRef = doc(db, "users", user.uid);

  // Path 1: Sign Up (newRole has value)
  if (newRole) {
    const requiresApproval = newRole === 'doctor' || newRole === 'admin';
    const finalRole = requiresApproval ? 'patient' : newRole;
    const accountStatus = requiresApproval ? 'pending' : 'active';

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      role: finalRole,
      accountStatus: accountStatus,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    if (requiresApproval) {
      userData.requestedRole = newRole;
    }

    await setDoc(
      userRef,
      userData,
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
