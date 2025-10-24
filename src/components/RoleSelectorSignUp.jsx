import React, { useState } from "react";
import {
  FaUserMd,
  FaUser,
  FaArrowLeft,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  setDoc,
  doc,
} from "../firebase";
import "./AuthPage.css"; // ใช้ CSS ชุดเดียวกัน

// ฟังก์ชันสำหรับบันทึกข้อมูลบัญชี (ยังคงเดิม)
const saveUserToFirestore = async (user, role) => {
  // ... (โค้ด saveUserToFirestore ยังคงเดิม)
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.email.split("@")[0],
      role: role, // บันทึก Role ที่ผู้ใช้เลือกโดยตรง
      createdAt: new Date(),
    });
    console.log(`User data saved/updated. Role: ${role}`);
    return true;
  } catch (error) {
    console.error("Error writing document to Firestore: ", error);
    return false;
  }
};

const RoleSelectorSignUp = ({ onSignUpSuccess, onBackToLogin }) => {
  const [selectedRole, setSelectedRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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

      const success = await saveUserToFirestore(user, selectedRole);

      if (success) {
        alert(
          `สมัครเป็น ${
            selectedRole === "patient" ? "คนไข้" : "แพทย์"
          } สำเร็จ! กรุณาล็อกอิน`
        );
        onSignUpSuccess();
      } else {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
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

  // --- ส่วนแสดงผล ---
  return (
    <div className="role-selector-container">
      <h2 className="signup-title">สมัครสมาชิก</h2>
      <p className="signup-subtitle">โปรดเลือกบทบาทที่คุณต้องการสมัคร</p>

      {/* ส่วนเลือก Role แบบง่าย (ใช้ Radio Button) */}
      <div className="role-options-container">
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
      </div>

      <form onSubmit={handleSubmit} className="form-fields">
        {/* Input Fields - เพิ่ม className 'input-field' จาก AuthPage.css */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field" /* ใช้ Class ที่มีอยู่ */
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Password (อย่างน้อย 6 ตัว)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field" /* ใช้ Class ที่มีอยู่ */
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
            className="input-field" /* ใช้ Class ที่มีอยู่ */
            disabled={loading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="login-main-button" disabled={loading}>
          {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
        </button>

        <a
          href="#"
          onClick={onBackToLogin}
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "10px",
            color: "#666",
          }}
        >
          <FaArrowLeft style={{ marginRight: "5px" }} /> ย้อนกลับไปหน้าล็อกอิน
        </a>
      </form>
    </div>
  );
};

// Component ย่อยสำหรับปุ่มเลือก Role - เปลี่ยนมาใช้ className 'role-option-button'
const RoleOption = ({ icon: Icon, title, role, selected, onSelect, color }) => (
  <button
    onClick={() => onSelect(role)}
    className="role-option-button" // <-- เพิ่ม className นี้
    style={{
      border: `2px solid ${selected ? color : "#ccc"}`,
      backgroundColor: selected ? `${color}15` : "white", // ปรับความเข้มสีพื้นหลัง
    }}
  >
    <Icon size={25} color={color} />
    <p className="role-title">{title}</p>
  </button>
);

export default RoleSelectorSignUp;
