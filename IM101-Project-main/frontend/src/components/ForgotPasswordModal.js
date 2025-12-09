import React, { useState } from 'react';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, apiBase }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState(''); // Store code from API

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    if (strength < 40) return { strength, label: 'Weak', color: '#e74c3c' };
    if (strength < 70) return { strength, label: 'Medium', color: '#f39c12' };
    return { strength, label: 'Strong', color: '#27ae60' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // Check if email failed and code is provided as fallback
        if (data.emailFailed && data.resetCode) {
          setResetCode(data.resetCode); // Store code for display (fallback)
        }
        setStep(2);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Password reset successfully! You can now login with your new password.');
        handleClose();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResetCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>✕</button>
        
        <h2>🔐 Reset Password</h2>
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Email</div>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Code</div>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">New Password</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="reset-form">
            <p className="step-description">Enter your email address to receive a reset code</p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="reset-form">
            <p className="step-description">Enter the 6-digit code sent to your email</p>
            
            {/* Show code only if email service failed (fallback) */}
            {resetCode && (
              <div className="dev-code-display">
                <strong>⚠️ Email Service Unavailable</strong>
                <div className="code-box">{resetCode}</div>
                <small>Use this code (email service will be configured soon)</small>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              autoFocus
            />
            <button type="submit" disabled={loading || code.length !== 6} className="submit-btn">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="back-btn">
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="reset-form">
            <p className="step-description">Create a new strong password</p>
            
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength.strength}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span style={{ color: passwordStrength.color, fontSize: '12px', fontWeight: '600' }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="password-requirements">
              <small>Password must be at least 6 characters</small>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(2)} className="back-btn">
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
