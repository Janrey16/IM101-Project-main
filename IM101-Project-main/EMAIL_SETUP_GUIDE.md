# 📧 Email Service Setup Guide

## Quick Setup (Gmail - Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer** (or Other)
3. Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Open `backend/.env` and update:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with your App Password (remove spaces)

### Step 4: Restart Backend
```bash
cd backend
npm start
```

### Step 5: Test!
1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check your inbox for the reset code! 📬

---

## Alternative: Custom SMTP Server

If you want to use a different email service (SendGrid, Mailgun, etc.):

### Update .env:
```env
# Comment out Gmail settings
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# Use SMTP settings instead
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Common SMTP Settings:

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

---

## Troubleshooting

### "Email service unavailable" message?
- Check your .env file has correct credentials
- Make sure you're using App Password (not regular password) for Gmail
- Restart the backend server after changing .env

### Not receiving emails?
- Check spam/junk folder
- Verify email address is correct
- Check backend console for error messages
- Test email config with: `node test-email.js` (see below)

### Test Email Configuration:
Create `backend/test-email.js`:
```javascript
require('dotenv').config();
const { testEmailConfig, sendPasswordResetEmail } = require('./utils/emailService');

async function test() {
  console.log('Testing email configuration...');
  const isReady = await testEmailConfig();
  
  if (isReady) {
    console.log('Sending test email...');
    const result = await sendPasswordResetEmail('test@example.com', '123456');
    console.log('Result:', result);
  }
}

test();
```

Run: `node test-email.js`

---

## Security Notes

⚠️ **Important:**
- Never commit your .env file to Git
- Use App Passwords, not your main password
- Keep your credentials secure
- For production, use environment variables (not .env file)

---

## Current Status

✅ Email service is installed and configured
✅ Fallback to console if email fails
✅ Beautiful HTML email template included
✅ 15-minute code expiration

**Next Steps:**
1. Add your Gmail credentials to .env
2. Restart backend
3. Test forgot password feature!

---

Need help? The system will still work even without email configured - codes will show in the console as fallback! 🎉
