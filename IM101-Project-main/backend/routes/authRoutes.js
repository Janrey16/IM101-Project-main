const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, deleteUserById } = require('../controllers/authController');
const { requestPasswordReset, verifyResetCode, resetPassword } = require('../controllers/passwordResetController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Health check route
router.get('/', (req, res) => res.send('✅ Auth route working!'));

// Register and login routes
router.post('/register', register); 
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected routes - require admin authentication
router.get('/users', verifyAdmin, getAllUsers);
router.delete('/users/:id', verifyAdmin, deleteUserById);

module.exports = router;