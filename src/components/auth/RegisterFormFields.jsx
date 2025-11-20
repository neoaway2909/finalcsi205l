import React from 'react';
import { FaUser, FaLock, FaUserMd, FaUserTie, FaCheck } from 'react-icons/fa';

/**
 * Register Form Fields Component
 * Displays registration form with role selection, email, password, and confirm password
 *
 * @param {string} email - Current email value
 * @param {string} password - Current password value
 * @param {string} confirmPassword - Current confirm password value
 * @param {string} selectedRole - Currently selected role ('patient', 'doctor', 'admin')
 * @param {Function} onEmailChange - Callback when email changes
 * @param {Function} onPasswordChange - Callback when password changes
 * @param {Function} onConfirmPasswordChange - Callback when confirm password changes
 * @param {Function} onRoleSelect - Callback when role is selected
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {string} error - Error message to display
 * @param {boolean} loading - Loading state
 */
export const RegisterFormFields = ({
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
