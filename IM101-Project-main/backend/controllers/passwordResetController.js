const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Generate 6-digit code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    // Generate reset code
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Delete any existing unused tokens for this email
    await db.query('DELETE FROM password_reset_tokens WHERE email = ? AND used = 0', [email]);
    
    // Store reset token
    await db.query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, resetCode, expiresAt]
    );
    
    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(email, resetCode);
    
    if (emailResult.success) {
      console.log(`✅ Reset code sent to: ${email}`);
      
      res.json({ 
        message: 'Reset code sent to your email',
        expiresIn: '15 minutes'
      });
    } else {
      // Fallback: Show code in console if email fails
      console.log('\n⚠️  EMAIL FAILED - SHOWING CODE IN CONSOLE');
      console.log('🔐 PASSWORD RESET CODE 🔐');
      console.log('========================');
      console.log(`Email: ${email}`);
      console.log(`Code: ${resetCode}`);
      console.log(`Expires: ${expiresAt.toLocaleString()}`);
      console.log('========================\n');
      
      res.json({ 
        message: 'Reset code generated (email service unavailable)',
        resetCode: resetCode, // Show code if email fails
        expiresIn: '15 minutes',
        emailFailed: true
      });
    }
    
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }
  
  try {
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    );
    
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    res.json({ message: 'Code verified successfully', valid: true });
    
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  try {
    // Verify code again
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    );
    
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE email = ? AND token = ?', [email, code]);
    
    console.log(`✅ Password reset successful for: ${email}`);
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
