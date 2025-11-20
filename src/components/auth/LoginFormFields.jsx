import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa';

/**
 * Login Form Fields Component
 * Displays email and password input fields for login
 *
 * @param {string} email - Current email value
 * @param {string} password - Current password value
 * @param {Function} onEmailChange - Callback when email changes
 * @param {Function} onPasswordChange - Callback when password changes
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onForgotPassword - Callback when forgot password is clicked
 * @param {string} error - Error message to display
 * @param {boolean} loading - Loading state
 */
export const LoginFormFields = ({
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
