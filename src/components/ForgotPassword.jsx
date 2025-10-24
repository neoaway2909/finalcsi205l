import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FaEnvelope } from "react-icons/fa";
import "./AuthPage.css";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ดึง auth instance ที่ถูก export จาก firebase.js
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Firebase Function: ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล
      await sendPasswordResetEmail(auth, email);

      setMessage(
        `✅ ได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล ${email} แล้ว กรุณาตรวจสอบอีเมล`
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
    <div
      className="login-form-card"
      style={{
        marginLeft: "0px",
        background: "white",
        marginTop: "0px",
        marginBottom: "60px",
        width: "85%",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>ลืมรหัสผ่าน?</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
        กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
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
        {message && (
          <p className="success-message" style={{ color: "green" }}>
            {message}
          </p>
        )}

        <button type="submit" className="login-main-button" disabled={loading}>
          {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <a
          href="#"
          onClick={onBackToLogin}
          style={{ color: "#666", textDecoration: "none" }}
        >
          ย้อนกลับไปหน้าล็อกอิน
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
