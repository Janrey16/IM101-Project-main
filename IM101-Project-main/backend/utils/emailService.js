const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
      }
    });
  }
  
  // For other SMTP services
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Car Rental System" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Password Reset Code - Car Rental System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 3px solid #3498db;
            }
            .header h1 {
              color: #2c3e50;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px 0;
            }
            .code-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .info-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ecf0f1;
              color: #7f8c8d;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password for your Car Rental System account.</p>
              <p>Your password reset code is:</p>
              
              <div class="code-box">
                ${resetCode}
              </div>
              
              <div class="info-box">
                <strong>⏰ Important:</strong> This code will expire in <strong>15 minutes</strong>.
              </div>
              
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for your reset code</li>
                <li>Make sure you're on the official website</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated email from Car Rental System</p>
              <p>© ${new Date().getFullYear()} Car Rental System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello,
        
        You requested to reset your password for your Car Rental System account.
        
        Your password reset code is: ${resetCode}
        
        This code will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        © ${new Date().getFullYear()} Car Rental System
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig
};
