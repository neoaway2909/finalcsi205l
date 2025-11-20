import React from 'react';
import { FaFacebookF, FaGoogle, FaLine } from 'react-icons/fa';

/**
 * Social Login Buttons Component
 * Displays social login options (Facebook, Google, Line)
 *
 * @param {Function} onGoogleLogin - Callback for Google login
 * @param {Function} onFacebookLogin - Callback for Facebook login
 * @param {Function} onLineLogin - Callback for Line login
 * @param {boolean} loading - Loading state
 */
export const SocialLoginButtons = ({
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
