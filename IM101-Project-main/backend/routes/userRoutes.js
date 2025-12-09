const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/users', verifyAdmin, userController.getAllUsers);
router.get('/users/:id', verifyAdmin, userController.getUserById);
router.post('/users', verifyAdmin, userController.createUser);

module.exports = router;